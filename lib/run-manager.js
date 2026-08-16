// RunManager — the runner's heart (ADR-0022): spawns each automation as a `deno run` child
// under computed permission flags, wires the token bridge, captures output into a persisted
// ring buffer, and owns cancel/timeout (protocol-level CANCEL → SIGTERM → SIGKILL).
const crypto = require("crypto");
const cp = require("child_process");
const fs = require("fs");
const net = require("net");
const os = require("os");
const path = require("path");
const { pathToFileURL } = require("url");
const { Emitter } = require("atom");
const rpc = require("tranquil-rpc");
const {
  parseHeader,
  renderGrants,
  MissingHeaderError,
  CAPABILITY_KEYS,
} = require("./permissions.js");
const { ensureConsent } = require("./consent.js");
const { resolveDeno, denoCacheDir } = require("./deno.js");
const { globalDenoConfigPath } = require("./deno-config-seed.js");
const { notify } = require("./notify.js");
const { buildSelectionEntry } = require("./selection-entry.js");

const MAX_RUNS = 100;
const MAX_OUTPUT = 64 * 1024;
const CANCEL_GRACE_MS = 2000;
const TERM_GRACE_MS = 1000;

const ENV_NAMES = [
  "TRANQUIL_RPC_URL",
  "TRANQUIL_RPC_TOKEN",
  "TRANQUIL_RUN_ID",
  "TRANQUIL_SCRIPT_DIR",
  "TRANQUIL_TRIGGER",
  "TRANQUIL_CDP_PORT",
  "TRANQUIL_ENTRY",
  "TRANQUIL_GRANTS",
];

// The bootstrap module `deno run` executes (deno/main.ts); it loads the user script via
// TRANQUIL_ENTRY and exits when done, so open runtime sockets don't keep the run alive.
function bootstrapEntry() {
  return path.join(__dirname, "..", "deno", "main.ts");
}

// The app's CDP port — overridable via TRANQUIL_CDP_PORT (start.js honors the same variable),
// so the runner works inside instances not on :9222 (e.g. the smoke-test harness).
function cdpPort() {
  return process.env.TRANQUIL_CDP_PORT || "9222";
}

// A free localhost port for Deno's V8 inspector (ADR-0025). Asking the OS for an ephemeral port
// and immediately releasing it leaves a millisecond-wide race, which is the standard trade: the
// alternative, `--inspect-brk=127.0.0.1:0`, makes Deno pick the port but then only announces it on
// stderr — and `--quiet` (already in argv) suppresses that banner entirely, so there would be no
// way to discover it. Knowing the port up front is what lets us poll /json/list instead.
function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

// Nearest deno.json/deno.jsonc walking up from the script's directory; the seeded global
// config is the fallback, so "run any .ts anywhere" keeps the tranquil/automation import.
function findDenoConfig(scriptDir) {
  let dir = scriptDir;
  for (;;) {
    for (const name of ["deno.json", "deno.jsonc"]) {
      const candidate = path.join(dir, name);
      if (fs.existsSync(candidate)) return candidate;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return globalDenoConfigPath();
}

class RunManager {
  constructor(state) {
    this.emitter = new Emitter();
    this.live = new Map(); // runId → { child, timeoutTimer, killTimers, finalState }
    // Restored runs from the last session: anything still in flight died with the window.
    // "paused" counts as in flight — a debug session stopped at a breakpoint (ADR-0025) has no
    // more chance of surviving a reload than a running one, and leaving it paused strands a row
    // whose Cancel button can never do anything, because its child is long gone.
    this.runs = ((state && state.runs) || []).map((r) =>
      r.state === "running" || r.state === "paused"
        ? { ...r, state: "cancelled", note: "window closed" }
        : r
    );
  }

  serialize() {
    return { runs: this.runs.slice(0, MAX_RUNS) };
  }

  onDidUpdate(cb) {
    return this.emitter.on("did-update", cb);
  }

  // Fired once per run, right after it is spawned — the runs panel uses this to jump its
  // selection to the newest run instead of leaving the user on whatever they last clicked.
  onDidStartRun(cb) {
    return this.emitter.on("did-start-run", cb);
  }

  // Debug runs only (ADR-0025): the inspector is listening on this port and the child is
  // suspended, waiting to be attached to.
  onDidStartInspector(cb) {
    return this.emitter.on("did-start-inspector", cb);
  }

  find(runId) {
    return this.runs.find((r) => r.runId === runId) || null;
  }

  // Is this script currently under the debugger (ADR-0025)? Read off the run records rather than
  // asking tranquil-debug, so the Run button can hide itself during a debug session without the
  // two packages knowing about each other.
  isDebugging(scriptPath) {
    return this.runs.some(
      (r) =>
        r.mode === "debug" &&
        r.scriptPath === scriptPath &&
        (r.state === "running" || r.state === "paused")
    );
  }

  // Record a run that never started, so the reason survives the toast. A refusal — missing
  // permissions header, no Deno, declined consent — used to exist only as a notification that
  // auto-hid after a few seconds, leaving nothing to go back to. These land in the runs panel
  // like any other run, with the full message as their output.
  recordRefusal({ scriptPath, trigger, mode, state, title, detail }) {
    const record = {
      runId: crypto.randomUUID(),
      kind: "script",
      mode,
      inspectorPort: null,
      scriptPath,
      trigger,
      state,
      startedAt: Date.now(),
      endedAt: Date.now(),
      exitCode: null,
      output: detail ? `${title}\n\n${detail}\n` : `${title}\n`,
    };
    this.runs.unshift(record);
    if (this.runs.length > MAX_RUNS) this.runs.length = MAX_RUNS;
    this.emitter.emit("did-start-run", record);
    this.emitter.emit("did-update", record);
    return record;
  }

  // Spawn a run. `sourceOverride` (run-selection) is written to <scriptDir>/.runs/<runId>.ts
  // and deleted after — module resolution and stack traces stay honest. Resolves the runId,
  // or null when the run could not start (no deno, bad header, consent declined).
  async run({ scriptPath, sourceOverride, trigger = "manual", debug = false }) {
    const mode = debug ? "debug" : "run";
    const refuse = ({ state = "failed", title, detail }) => {
      const record = this.recordRefusal({ scriptPath, trigger, mode, state, title, detail });
      notify("addError", title, {
        detail,
        timeout: 0, // no auto-hide: this has to stay long enough to read and act on
        buttons: this.onShowRuns
          ? [{ text: "Show Runs", onDidClick: () => this.onShowRuns(record.runId) }]
          : undefined,
      });
      return null;
    };

    const deno = await resolveDeno();
    if (!deno) {
      return refuse({
        title: "Deno not found",
        detail:
          "Install Deno (deno.land) or set its path in Settings › Packages › " +
          "tranquil-automations › Deno Path.",
      });
    }

    // Permissions always come from the FILE, never from a selection. Running a selection is a
    // REPL affordance — the fragment is part of this script, not a script of its own — and a
    // selection has no header, so parsing the override would refuse every REPL run and, worse,
    // invite people to paste a header into a fragment to change what it may do. The file is the
    // unit of trust: it is what the user read, what consent is keyed to, and what they approved.
    let fileSource;
    try {
      fileSource = fs.readFileSync(scriptPath, "utf8");
    } catch (e) {
      return refuse({ title: "Cannot read automation", detail: String(e.message || e) });
    }

    let header;
    try {
      header = parseHeader(fileSource);
    } catch (e) {
      return refuse({
        title:
          e instanceof MissingHeaderError
            ? `${path.basename(scriptPath)} declares no permissions`
            : `Bad permissions header in ${path.basename(scriptPath)}`,
        detail: String(e.message || e),
      });
    }

    if (!(await ensureConsent(scriptPath, header.grants))) {
      // Declined is a decision, not a failure — recorded as cancelled, and without a toast,
      // since the user just dismissed the prompt that asked.
      this.recordRefusal({
        scriptPath,
        trigger,
        mode,
        state: "cancelled",
        title: "Permissions not approved",
        detail: renderGrants(header.grants).join("\n"),
      });
      return null;
    }

    const scriptDir = path.dirname(scriptPath);
    const { port } = await rpc.ensureRunnerServer();
    const runId = crypto.randomUUID();
    // `debug` widens the host-side auth/TTL windows: those timers keep running while the
    // inspector has the guest frozen, so a breakpoint hit during the handshake would otherwise
    // get the RPC bridge refused with 4001 (ADR-0025).
    const token = rpc.mintRunToken({
      runId,
      scriptPath,
      scriptDir,
      grants: header.grants,
      debug,
    });

    let entry = scriptPath;
    let tempEntry = null;
    if (sourceOverride != null) {
      const runsDir = path.join(scriptDir, ".runs");
      fs.mkdirSync(runsDir, { recursive: true });
      tempEntry = path.join(runsDir, `${runId}.ts`);
      // Carry the file's imports across, so a highlighted statement runs as a REPL line
      // rather than failing with "tabs is not defined".
      fs.writeFileSync(tempEntry, buildSelectionEntry(fileSource, sourceOverride), "utf8");
      entry = tempEntry;
    }

    const g = header.grants;
    const args = [
      "run",
      "--quiet",
      "--no-prompt",
      "--config",
      findDenoConfig(scriptDir),
      `--allow-import=${["jsr.io:443", ...g.import].join(",")}`,
      // The RPC bridge is always reachable — it is how the host serves capabilities, and each is
      // gated on its own grant. The CDP port is NOT: reaching it means driving the browser inside
      // the user's signed-in sessions, so it requires `browser` (ADR-0025).
      `--allow-net=${[
        `127.0.0.1:${port}`,
        ...(g.browser ? [`127.0.0.1:${cdpPort()}`, `localhost:${cdpPort()}`] : []),
        ...g.net,
      ].join(",")}`,
      `--allow-env=${[...ENV_NAMES, ...g.env].join(",")}`,
      `--allow-read=${[scriptDir, ...g.read].join(",")}`,
      `--allow-write=${[scriptDir, ...g.write].join(",")}`,
    ];
    if (g.run.length) args.push(`--allow-run=${g.run.join(",")}`);
    // Debug runs (ADR-0025) start suspended so the host can attach and arm breakpoints before any
    // user code executes. The inspector socket is bound by Deno itself, not by the script, so it
    // needs no --allow-net grant.
    let inspectorPort = null;
    if (debug) {
      inspectorPort = await freePort();
      args.push(`--inspect-brk=127.0.0.1:${inspectorPort}`);
    }
    // The deno-run entry is the bootstrap; the user script rides in via TRANQUIL_ENTRY so the
    // bootstrap can exit the process when the script finishes (open sockets otherwise hang it).
    args.push(bootstrapEntry());

    const child = cp.spawn(deno, args, {
      cwd: scriptDir,
      env: {
        PATH: process.env.PATH || "/usr/bin:/bin",
        HOME: os.homedir(),
        DENO_DIR: denoCacheDir(),
        NO_COLOR: "1",
        TRANQUIL_RPC_URL: `ws://127.0.0.1:${port}`,
        TRANQUIL_RPC_TOKEN: token,
        TRANQUIL_RUN_ID: runId,
        TRANQUIL_SCRIPT_DIR: scriptDir,
        TRANQUIL_TRIGGER: trigger,
        TRANQUIL_CDP_PORT: cdpPort(),
        TRANQUIL_ENTRY: pathToFileURL(entry).href,
        // The capability grants this run holds, so the SDK can say "you need @permissions
        // browser" itself. It cannot detect this from the host stub: capnweb proxies property
        // access, so a missing capability is not observably undefined on the guest side — the
        // failure only surfaces as the host's own TypeError, relayed back.
        TRANQUIL_GRANTS: CAPABILITY_KEYS.filter((k) => header.grants[k]).join(","),
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    const record = {
      runId,
      kind: "script", // engine runs (ADR-0023) will share this surface with kind "workflow"
      mode,
      inspectorPort,
      scriptPath,
      trigger,
      state: "running",
      startedAt: Date.now(),
      endedAt: null,
      exitCode: null,
      output: "",
    };
    this.runs.unshift(record);
    if (this.runs.length > MAX_RUNS) this.runs.length = MAX_RUNS;

    const liveEntry = { child, timeoutTimer: null, killTimers: [], finalState: null };
    this.live.set(runId, liveEntry);

    const append = (chunk) => {
      record.output += chunk.toString();
      if (record.output.length > MAX_OUTPUT) {
        record.output = "…[truncated]\n" + record.output.slice(record.output.length - MAX_OUTPUT);
      }
      this.emitter.emit("did-update", record);
    };
    child.stdout.on("data", append);
    child.stderr.on("data", append);

    // Debug runs get no wall-clock timeout: the timer cannot tell "paused at a breakpoint" from
    // "hung", and the default 10 minutes would kill a session the moment someone reads their code.
    // The debug session owns its own attach watchdog instead.
    if (header.timeoutMs != null && !debug) {
      liveEntry.timeoutTimer = setTimeout(() => this.cancel(runId, "timed-out"), header.timeoutMs);
    }

    child.on("error", (err) => {
      append(`spawn error: ${err.message}\n`);
    });
    child.on("exit", (code) => {
      const l = this.live.get(runId);
      this.live.delete(runId);
      if (l) {
        clearTimeout(l.timeoutTimer);
        l.killTimers.forEach(clearTimeout);
      }
      rpc.endRun(runId);
      if (tempEntry) fs.rmSync(tempEntry, { force: true });

      record.endedAt = Date.now();
      record.exitCode = code;
      record.state = (l && l.finalState) || (code === 0 ? "succeeded" : "failed");
      this.emitter.emit("did-update", record);

      if (record.state === "failed") {
        const firstErrorLine =
          record.output.split("\n").find((ln) => /error/i.test(ln)) ||
          `exited with code ${code}`;
        notify("addError", `Automation failed: ${path.basename(scriptPath)}`, {
          detail: firstErrorLine.trim(),
          timeout: 10000, // leave time to reach the Show Runs button
          buttons: this.onShowRuns
            ? [{ text: "Show Runs", onDidClick: () => this.onShowRuns(runId) }]
            : undefined,
        });
      }
    });

    this.emitter.emit("did-start-run", record);
    if (debug) this.emitter.emit("did-start-inspector", { runId, port: inspectorPort, record });
    this.emitter.emit("did-update", record);
    return runId;
  }

  // Protocol-level cancel with a kill backstop: CANCEL frame → 2 s grace → SIGTERM → 1 s →
  // SIGKILL. `finalState` distinguishes user cancel from timeout in the record.
  //
  // `graceful: false` skips the CANCEL frame and goes straight to signals. That is the only
  // correct path for a run paused in the debugger: the frame is handled on the JS event loop,
  // which a paused V8 is not pumping, so it would sit unread until the kill timers fired anyway.
  // Resuming first is worse — it runs arbitrary user code with side effects, and can re-hit a
  // breakpoint and freeze again, making the outcome depend on timing.
  cancel(runId, finalState = "cancelled", { graceful = true } = {}) {
    const l = this.live.get(runId);
    if (!l) {
      // No live child, but the record may still claim to be in flight — a run restored from a
      // previous window, or a child that died without its exit handler landing. Resolve the record
      // instead of returning silently, so Cancel is never a button that does nothing.
      const record = this.find(runId);
      if (record && (record.state === "running" || record.state === "paused")) {
        record.state = finalState;
        record.endedAt = record.endedAt || Date.now();
        this.emitter.emit("did-update", record);
        return true;
      }
      return false;
    }
    if (l.finalState) return true; // cancel already in flight
    l.finalState = finalState;

    const termAt = graceful ? CANCEL_GRACE_MS : 0;
    if (graceful) rpc.sendCancel(runId);
    l.killTimers.push(
      setTimeout(() => {
        try {
          l.child.kill("SIGTERM");
        } catch (e) {
          /* already gone */
        }
      }, termAt),
      setTimeout(() => {
        try {
          l.child.kill("SIGKILL");
        } catch (e) {
          /* already gone */
        }
      }, termAt + TERM_GRACE_MS)
    );
    return true;
  }

  // The debug session reports pause/resume so the runs panel can distinguish a session stopped at
  // a breakpoint from one that is merely slow — without this, a paused run reads as "running"
  // forever. Purely presentational; the run's real lifecycle is still the child process.
  setPaused(runId, paused) {
    const record = this.find(runId);
    if (!record || (record.state !== "running" && record.state !== "paused")) return;
    const next = paused ? "paused" : "running";
    if (record.state === next) return;
    record.state = next;
    this.emitter.emit("did-update", record);
  }

  dispose() {
    for (const [runId, l] of this.live) {
      clearTimeout(l.timeoutTimer);
      l.killTimers.forEach(clearTimeout);
      try {
        l.child.kill("SIGKILL");
      } catch (e) {
        /* already gone */
      }
      rpc.endRun(runId);
    }
    this.live.clear();
    this.emitter.dispose();
  }
}

module.exports = RunManager;
