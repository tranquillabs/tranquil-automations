// The workbook view's work that needs Node or Pulsar (ADR-0030, ADR-0032): reading a workbook,
// checking the paths it names, watching the files it shows, opening its links, and the person's
// actions: running a step, ticking a box, sending a message. It draws nothing. The view gets it
// as a prop and calls it directly, in the same window: watchWorkbook calls back with a model to
// draw, and every action writes the workbook, whose change brings the next model. So the
// person's edits, an LLM's and Tranquil's own reach the view the same way.
//
// Pulsar, the run manager and the package's run text and permission parsing are passed in
// (ServiceDeps), so this is typed against just what it uses and tested with stand-ins.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { classifyLink } from "../common/core.ts";
import { readCapped, resolveInProject, writeDoc } from "./disk.ts";
import * as format from "./format.ts";
import { can, next } from "./run-machine.ts";
import * as signatures from "./signatures.ts";
import type { Block, BlockAttrs } from "./types/format.ts";
import type { Resolved } from "./types/disk.ts";
import type { ActivePhase, RunEvent, RunPhase } from "./types/run-machine.ts";
import type {
  BlockModel,
  Disposable,
  EntryModel,
  FileModel,
  Grants,
  OutputModel,
  RunModel,
  RunRecord,
  ScriptModel,
  ServiceDeps,
  WorkbookModel,
  WorkbookService,
} from "./types/service.ts";

const DEBOUNCE_MS = 75;
const CUT_NOTE = "\n… (cut at 64 KB)";
const RESULT_MARK = "Result:\n";
const TONES: Record<string, OutputModel["tone"]> = {
  succeeded: "success",
  failed: "error",
  "timed-out": "error",
  "not-started": "warning",
};

const messageOf = (e: unknown) => (e instanceof Error ? e.message : String(e));

function timeOf(ms: number): string {
  return new Date(ms).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// A run card's permissions in a few plain words; the full list is the tooltip.
function grantSummary(grants: Grants): string {
  const parts: string[] = [];
  if (grants.browser) parts.push("controls the browser");
  else {
    if (grants["page-js"]) parts.push("runs code in pages");
    if (grants.submit) parts.push("submits forms");
    else if (grants.forms) parts.push("fills forms");
    else if (grants.tabs) parts.push("reads pages");
  }
  if (grants.tabs) parts.push((grants.sites || []).length ? (grants.sites || []).join(", ") : "any site");
  if (grants.read.length) parts.push("reads files");
  if (grants.write.length) parts.push("writes files");
  if (grants.net.length) parts.push("uses the network");
  if (grants.run.length) parts.push("runs commands");
  if (grants.clipboard) parts.push("uses the clipboard");
  return parts.length ? parts.join(" · ") : "no permissions";
}

/** A script's hash as outputs record it: the first 16 hex characters of its SHA-256. */
const hashOf = (text: string) => crypto.createHash("sha256").update(text).digest("hex").slice(0, 16);

const firstLine = (text: string) => (String(text).split("\n").find((l) => l.trim()) || "").trim();

/** A signed output's body split into its text and its result, when it has one. */
function splitResult(block: Block): { text: string; result?: unknown; hasResult: boolean } {
  if (block.attrs.result !== "1") return { text: block.body, hasResult: false };
  const at = block.body.startsWith(RESULT_MARK) ? 0 : block.body.lastIndexOf(`\n\n${RESULT_MARK}`);
  if (at < 0) return { text: block.body, hasResult: false };
  const json = block.body.slice(at + (at === 0 ? 0 : 2) + RESULT_MARK.length);
  try {
    return { text: block.body.slice(0, at), result: JSON.parse(json), hasResult: true };
  } catch {
    return { text: block.body, hasResult: false };
  }
}

/** A step's script, read: where it is, its text and its hash, or why it can't run. */
type StepScript = { refused: string; abs?: string } | {
  refused?: undefined;
  abs: string;
  text: string;
  truncated: boolean;
  hash: string;
};

export function createWorkbookService(deps: ServiceDeps): WorkbookService {
  const { pulsar } = deps;
  let key: Uint8Array | null = null;
  const signingKey =
    () => (key ??= signatures.loadKey(path.join(pulsar.getConfigDirPath(), "workbook-signing.key")));

  // Each step's run phase (run-machine.ts), by workbook and step id; a step not listed is idle. And
  // the redraw of every open view, by workbook.
  const phases = new Map<string, ActivePhase>();
  const redraws = new Map<string, Set<() => void>>();
  const runKey = (filePath: string, id: string) => `${filePath}\n${id}`;
  const phaseOf = (k: string): RunPhase => phases.get(k) ?? "idle";
  const redraw = (filePath: string) => redraws.get(filePath)?.forEach((fn) => fn());

  /** Moves a step's run on by `event`, and redraws. `runStep` sends only events the table allows. */
  function advance(filePath: string, k: string, event: RunEvent): void {
    const from = phaseOf(k);
    const to = next(from, event);
    if (to === null) throw new Error(`A step's run can't go from ${from} on ${event}.`);
    if (to === "idle") phases.delete(k);
    else phases.set(k, to);
    redraw(filePath);
  }

  // The project folder that holds the workbook, or its own folder outside any project. Every path
  // the workbook names must stay inside it.
  function resolve(filePath: string, rel: string | null | undefined, opts?: { ext?: string }): Resolved {
    const [root] = pulsar.project.relativizePath(filePath);
    return resolveInProject(root || path.dirname(filePath), filePath, rel, opts);
  }

  /** Whether an editor holds unsaved changes to this workbook, which a write would clash with. */
  const locked = (filePath: string) =>
    pulsar.workspace.getTextEditors().some((e) => e.getPath() === filePath && e.isModified());

  function stepScript(filePath: string, block: Block): StepScript {
    if (!block.stepOk) return { refused: "This step can't run until the problem above is fixed." };
    const res = resolve(filePath, block.path, { ext: ".ts" });
    if (!res.ok) return { refused: `This step can't run: ${res.reason}.` };
    const read = readCapped(res.abs);
    if (!read.ok) {
      return {
        abs: res.abs,
        refused: read.missing ? `The script ${block.path} doesn't exist.` : read.reason,
      };
    }
    return { abs: res.abs, text: read.text, truncated: read.truncated, hash: hashOf(read.text) };
  }

  // A step: its script, what it may do, its source, and where it stands (StepState). A step that
  // can't run says so even mid-run (its script was deleted, say); a step in a run shows its phase;
  // otherwise its last output says whether the script changed since.
  function runModel(
    filePath: string,
    block: Block,
    outputs: Map<string, Block>,
    watch: Set<string>,
  ): RunModel {
    const run = { kind: "run" as const, key: `run:${block.id}`, id: block.id, path: block.path || null };
    const read = stepScript(filePath, block);
    if (read.abs) watch.add(read.abs);
    if (read.refused !== undefined) return { ...run, state: { kind: "refused", reason: read.refused } };
    let grants: ScriptModel["grants"];
    try {
      const g = deps.parseHeader(read.text).grants;
      grants = { summary: grantSummary(g), detail: deps.renderGrants(g).join("\n"), error: false };
    } catch (e) {
      grants = { summary: "no valid permission header", detail: messageOf(e), error: true };
    }
    const script: ScriptModel = { grants, source: read.text + (read.truncated ? CUT_NOTE : "") };
    const phase = block.id === undefined ? "idle" : phaseOf(runKey(filePath, block.id));
    if (phase !== "idle") return { ...run, state: { kind: "running", phase, script } };
    const last = block.id ? outputs.get(block.id) : undefined;
    if (!last) return { ...run, state: { kind: "new", script } };
    const changed = last.attrs.hash !== read.hash || decodeURI(last.attrs.script || "") !== block.path;
    return { ...run, state: { kind: changed ? "changed" : "current", script } };
  }

  // A live view of a data file the workbook names, collapsed to one line.
  function fileModel(filePath: string, block: Block, watch: Set<string>): FileModel {
    const file: FileModel = {
      kind: "file",
      key: `file:${block.path}`,
      path: block.path || null,
      state: "",
      error: false,
    };
    const res = resolve(filePath, block.path);
    if (!res.ok) return { ...file, state: res.reason, error: true };
    watch.add(res.abs);
    const read = readCapped(res.abs);
    if (!read.ok) return { ...file, state: read.missing ? "not written yet" : read.reason };
    return {
      ...file,
      state: `changed ${timeOf(read.mtimeMs)}`,
      text: read.text + (read.truncated ? CUT_NOTE : ""),
    };
  }

  interface DrawContext {
    outputs: Map<string, Block>;
    watch: Set<string>;
    newestThread: Set<number>;
  }

  function blockModel(filePath: string, block: Block, index: number, ctx: DrawContext): BlockModel {
    if (block.kind === "run") return runModel(filePath, block, ctx.outputs, ctx.watch);
    if (block.kind === "file") return fileModel(filePath, block, ctx.watch);
    const at = Date.parse(block.attrs.at || "");
    const time = Number.isNaN(at) ? "" : timeOf(at);
    if (block.kind === "reply") {
      const reply: EntryModel = {
        kind: "reply",
        key: `reply:${index}`,
        time,
        summary: firstLine(block.body),
        body: block.body,
        startOpen: ctx.newestThread.has(index),
      };
      return reply;
    }
    if (!signatures.verify(signingKey(), block)) {
      return { kind: "unverified", label: `${block.kind} · not written by Tranquil`, body: block.body };
    }
    if (block.kind === "message") {
      return {
        kind: "message",
        key: `message:${index}`,
        time,
        summary: firstLine(block.body),
        body: block.body,
        startOpen: ctx.newestThread.has(index),
      };
    }
    const state = block.attrs.state || "";
    const { text, result, hasResult } = splitResult(block);
    return {
      kind: "output",
      key: `output:${block.id}`,
      script: path.basename(decodeURI(block.attrs.script || "")),
      state: state === "not-started" ? "not started" : deps.stateLabels[state] || state,
      tone: TONES[state] ?? "surface",
      time,
      duration: block.attrs.ms ? deps.formatDuration(Number(block.attrs.ms)) : "",
      text,
      result,
      hasResult,
    };
  }

  /** What the view draws for a workbook, and every file whose change should redraw it. */
  function readWorkbook(filePath: string): { model: WorkbookModel; watch: Set<string> } {
    const title = path.basename(filePath);
    const watch = new Set([filePath]);
    let text: string;
    try {
      text = fs.readFileSync(filePath, "utf8");
    } catch (e) {
      return { model: { title, error: `Can't read this workbook: ${messageOf(e)}` }, watch };
    }
    const doc = format.parseDoc(text);
    const isLocked = locked(filePath);

    // Each step's latest output that Tranquil signed, for "changed since this run".
    const outputs = new Map<string, Block>();
    for (const b of doc.blocks) {
      if (b.kind === "output" && b.id && signatures.verify(signingKey(), b)) outputs.set(b.id, b);
    }
    // The newest message and the reply right after it start open; older ones show one line.
    const newestThread = new Set<number>();
    const lastMessage = doc.blocks.map((b) => b.kind).lastIndexOf("message");
    if (lastMessage >= 0) {
      newestThread.add(lastMessage);
      if (doc.blocks[lastMessage + 1]?.kind === "reply") newestThread.add(lastMessage + 1);
    }
    const ctx: DrawContext = { outputs, watch, newestThread };
    const nonce = crypto.randomBytes(8).toString("hex");
    return {
      model: {
        title: doc.title || title,
        warnings: doc.warnings,
        locked: isLocked,
        tasks: doc.tasks.map((t) => t.checked),
        markdown: format.renderSource(text, doc, nonce),
        nonce,
        blocks: doc.blocks.map((b, i) => blockModel(filePath, b, i, ctx)),
      },
      watch,
    };
  }

  function watchWorkbook(filePath: string, onModel: (model: WorkbookModel) => void): () => void {
    const watchers = new Map<string, fs.FSWatcher>(); // folder → watcher
    let watched = new Set<string>();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;

    function draw() {
      if (stopped) return;
      const { model, watch } = readWorkbook(filePath);
      watched = watch;
      const folders = new Set(Array.from(watch, (p) => path.dirname(p)));
      for (const [dir, w] of watchers) {
        if (!folders.has(dir)) {
          w.close();
          watchers.delete(dir);
        }
      }
      for (const dir of folders) {
        if (watchers.has(dir)) continue;
        try {
          watchers.set(
            dir,
            fs.watch(dir, (_event, name) => {
              if (!name || watched.has(path.join(dir, String(name)))) later();
            }),
          );
        } catch {
          // A folder that doesn't exist yet is watched once a later draw finds it.
        }
      }
      onModel(model);
    }
    function later() {
      clearTimeout(timer);
      timer = setTimeout(draw, DEBOUNCE_MS);
    }

    if (!redraws.has(filePath)) redraws.set(filePath, new Set());
    redraws.get(filePath)?.add(later);
    // observeTextEditors calls back for the editors already open before it returns.
    const subscriptions: Disposable[] = [];
    subscriptions.push(pulsar.workspace.observeTextEditors((editor) => {
      if (editor.getPath() === filePath) subscriptions.push(editor.onDidChangeModified(later));
    }));

    // The first draw comes just after this returns, outside the caller's own update.
    queueMicrotask(draw);
    return () => {
      stopped = true;
      clearTimeout(timer);
      for (const w of watchers.values()) w.close();
      watchers.clear();
      redraws.get(filePath)?.delete(later);
      for (const s of subscriptions) s.dispose();
    };
  }

  /** Writes an edit to the workbook, or says why it can't. Returns whether it was written. */
  function write(filePath: string, edit: (text: string) => string | null): boolean {
    if (locked(filePath)) {
      pulsar.notifications.addWarning("Save or discard the workbook's unsaved changes first", {
        detail:
          "It's open in an editor with changes that aren't saved, and Tranquil's write would clash with them.",
        dismissable: true,
      });
      return false;
    }
    const result = writeDoc(filePath, edit);
    if (!result.ok) {
      pulsar.notifications.addError("Couldn't write the workbook", {
        detail: result.reason,
        dismissable: true,
      });
    }
    return result.ok;
  }

  /** A signed block's text. */
  function signedBlock(
    kind: "output" | "message",
    id: string | undefined,
    attrs: BlockAttrs,
    body: string,
  ): string {
    const present = Object.fromEntries(
      Object.entries(attrs).filter((e): e is [string, string] => e[1] !== undefined),
    );
    const text = format.blockBody(body);
    const sig = signatures.sign(signingKey(), kind, id, present, text);
    return format.blockText(kind, id, { ...present, sig }, text);
  }

  /**
   * Runs a step, as the person who clicked Run, and writes its signed output under it. The
   * script's hash is taken now, so the output records the version that ran. Each stage sends the
   * run machine an event (run-machine.ts); a click the step's phase doesn't allow, such as a
   * second one while it runs, does nothing.
   */
  async function runStep(filePath: string, stepId: string): Promise<void> {
    const k = runKey(filePath, stepId);
    const runManager = deps.runManager();
    if (!can(phaseOf(k), "run") || !runManager || locked(filePath)) return;
    let text: string;
    try {
      text = fs.readFileSync(filePath, "utf8");
    } catch (e) {
      pulsar.notifications.addError("Couldn't read the workbook", {
        detail: messageOf(e),
        dismissable: true,
      });
      return;
    }
    const block = format.parseDoc(text).blocks.find((b) => b.kind === "run" && b.id === stepId);
    if (!block || !block.path) return;
    const script = stepScript(filePath, block);
    if (script.refused !== undefined) return;

    advance(filePath, k, "run");
    const trigger = `workbook:${filePath}`;
    const startedAt = Date.now();
    // A run that's refused (no Deno, a bad header, declined consent) resolves null; its record
    // arrives first, through onDidStartRun. A run that can't even be set up throws. (A holder,
    // since the callback sets it.)
    const refusal: { record: RunRecord | null } = { record: null };
    const sub = runManager.onDidStartRun((r) => {
      if (!refusal.record && r.trigger === trigger && r.scriptPath === script.abs && r.state !== "running") {
        refusal.record = r;
      }
    });
    let runId: string | null = null;
    let record: RunRecord | null = null;
    let failure: string | null = null;
    try {
      runId = await runManager.run({ scriptPath: script.abs, trigger });
    } catch (e) {
      failure = messageOf(e);
    } finally {
      sub.dispose();
    }
    if (runId !== null) {
      advance(filePath, k, "started");
      try {
        record = await runManager.whenDone(runId);
      } catch (e) {
        failure = messageOf(e);
      }
    }
    advance(filePath, k, failure !== null ? "threw" : record ? "ended" : "refused");

    // Back to idle however the write ends, a throw included (the signing key is read here).
    let written = false;
    try {
      const body = format.capOutput(
        record ? deps.runText(record) : refusal.record?.output || failure || "The run didn't start.",
      );
      const attrs: BlockAttrs = {
        script: encodeURI(block.path),
        hash: script.hash,
        state: record ? record.state : "not-started",
        at: new Date(record ? record.startedAt : startedAt).toISOString(),
        ms: record?.endedAt ? String(record.endedAt - record.startedAt) : undefined,
        result: record && record.result !== undefined ? "1" : undefined,
      };
      written = write(
        filePath,
        (now) => format.setOutput(now, stepId, signedBlock("output", stepId, attrs, body)),
      );
    } finally {
      advance(filePath, k, written ? "written" : "writeFailed");
    }
  }

  /** Ticks or unticks task `index`, unless it changed since the person saw it. */
  function toggleTask(filePath: string, index: number, wasChecked: boolean): void {
    write(filePath, (text) => format.toggleTask(text, index, wasChecked));
  }

  /** Adds the person's signed message: at the end, or under a step when it's about one. */
  function sendMessage(filePath: string, text: string, stepId?: string | null): boolean {
    const body = String(text).replace(/\r\n?/g, "\n").trim();
    if (!body) return false;
    const block = signedBlock("message", undefined, { at: new Date().toISOString() }, body);
    return write(filePath, (now) => format.insertMessage(now, block, stepId || undefined));
  }

  // Links never navigate the window. Web links open in a browser tab; relative links open in
  // Tranquil if they stay in the project; anything else does nothing.
  function openLink(filePath: string, href: string): void {
    const link = classifyLink(href);
    if (link.kind === "web") {
      pulsar.workspace.open(link.url);
    } else if (link.kind === "relative") {
      const res = resolve(filePath, link.path);
      if (res.ok) pulsar.workspace.open(res.abs);
      else pulsar.notifications.addWarning("Can't open that link", { detail: res.reason, dismissable: true });
    }
  }

  return { watchWorkbook, runStep, toggleTask, sendMessage, openLink };
}
