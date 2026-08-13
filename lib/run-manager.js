// RunManager — the runner's heart (ADR-0022): spawns each automation as a `deno run` child
// under computed permission flags, wires the token bridge, captures output into a persisted
// ring buffer, and owns cancel/timeout (protocol-level CANCEL → SIGTERM → SIGKILL).
const crypto = require("crypto");
const cp = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { pathToFileURL } = require("url");
const { Emitter } = require("atom");
const rpc = require("tranquil-rpc");
const { parseHeader } = require("./permissions.js");
const { ensureConsent } = require("./consent.js");
const { resolveDeno, denoCacheDir } = require("./deno.js");
const { globalDenoConfigPath } = require("./deno-config-seed.js");
const { notify } = require("./notify.js");

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
    // Restored runs from the last session: anything still "running" died with the window.
    this.runs = ((state && state.runs) || []).map((r) =>
      r.state === "running" ? { ...r, state: "cancelled", note: "window closed" } : r
    );
  }

  serialize() {
    return { runs: this.runs.slice(0, MAX_RUNS) };
  }

  onDidUpdate(cb) {
    return this.emitter.on("did-update", cb);
  }

  find(runId) {
    return this.runs.find((r) => r.runId === runId) || null;
  }

  // Spawn a run. `sourceOverride` (run-selection) is written to <scriptDir>/.runs/<runId>.ts
  // and deleted after — module resolution and stack traces stay honest. Resolves the runId,
  // or null when the run could not start (no deno, bad header, consent declined).
  async run({ scriptPath, sourceOverride, trigger = "manual" }) {
    const deno = await resolveDeno();
    if (!deno) {
      notify("addError", "Deno not found", {
        detail:
          "Install Deno (deno.land) or set its path in Settings › Packages › " +
          "tranquil-automations › Deno Path.",
      });
      return null;
    }

    let source;
    try {
      source = sourceOverride != null ? sourceOverride : fs.readFileSync(scriptPath, "utf8");
    } catch (e) {
      notify("addError", "Cannot read automation", { detail: String(e.message || e) });
      return null;
    }

    let header;
    try {
      header = parseHeader(source);
    } catch (e) {
      notify("addError", `Bad permissions header in ${path.basename(scriptPath)}`, {
        detail: String(e.message || e),
      });
      return null;
    }

    if (!(await ensureConsent(scriptPath, header.grants))) return null;

    const scriptDir = path.dirname(scriptPath);
    const { port } = await rpc.ensureRunnerServer();
    const runId = crypto.randomUUID();
    const token = rpc.mintRunToken({ runId, scriptPath, scriptDir });

    let entry = scriptPath;
    let tempEntry = null;
    if (sourceOverride != null) {
      const runsDir = path.join(scriptDir, ".runs");
      fs.mkdirSync(runsDir, { recursive: true });
      tempEntry = path.join(runsDir, `${runId}.ts`);
      fs.writeFileSync(tempEntry, sourceOverride, "utf8");
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
      `--allow-net=${[
        `127.0.0.1:${port}`,
        `127.0.0.1:${cdpPort()}`,
        `localhost:${cdpPort()}`,
        ...g.net,
      ].join(",")}`,
      `--allow-env=${[...ENV_NAMES, ...g.env].join(",")}`,
      `--allow-read=${[scriptDir, ...g.read].join(",")}`,
      `--allow-write=${[scriptDir, ...g.write].join(",")}`,
    ];
    if (g.run.length) args.push(`--allow-run=${g.run.join(",")}`);
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
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    const record = {
      runId,
      kind: "script", // engine runs (ADR-0023) will share this surface with kind "workflow"
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

    if (header.timeoutMs != null) {
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

    this.emitter.emit("did-update", record);
    return runId;
  }

  // Protocol-level cancel with a kill backstop: CANCEL frame → 2 s grace → SIGTERM → 1 s →
  // SIGKILL. `finalState` distinguishes user cancel from timeout in the record.
  cancel(runId, finalState = "cancelled") {
    const l = this.live.get(runId);
    if (!l) return false;
    if (l.finalState) return true; // cancel already in flight
    l.finalState = finalState;

    rpc.sendCancel(runId);
    l.killTimers.push(
      setTimeout(() => {
        try {
          l.child.kill("SIGTERM");
        } catch (e) {
          /* already gone */
        }
      }, CANCEL_GRACE_MS),
      setTimeout(() => {
        try {
          l.child.kill("SIGKILL");
        } catch (e) {
          /* already gone */
        }
      }, CANCEL_GRACE_MS + TERM_GRACE_MS)
    );
    return true;
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
