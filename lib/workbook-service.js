"use babel";

// The workbook view's work that needs Node or Pulsar (ADR-0030, ADR-0032): reading a workbook,
// checking the paths it names, rendering its Markdown, watching the files it shows, opening its
// links, and the person's actions: running a step, ticking a box, sending a message. It draws
// nothing. The view (ui/workbook) gets this module as a prop and calls it directly, in the same
// window: watchWorkbook calls back with a model to draw, and every action writes the workbook,
// whose change brings the next model. So the person's edits, an LLM's and Tranquil's own reach the
// view the same way.

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const format = require("./workbook-format.js");
const { resolveInProject, readCapped, writeDoc } = require("./workbook-disk.js");
const signatures = require("./workbook-signatures.js");
const safeMarkdown = require("./safe-markdown.js");
const { parseHeader, renderGrants } = require("./permissions.js");
const { STATE_LABELS, formatDuration, runText } = require("./run-text.js");

const DEBOUNCE_MS = 75;
const CUT_NOTE = "\n… (cut at 64 KB)";
const RESULT_MARK = "Result:\n";

let runManager = null;
/** Called on activation (lib/tranquil-automations.js); restored panes exist before that. */
function setRunManager(rm) {
  runManager = rm;
}

let key = null;
const signingKey = () => (key ??= signatures.loadKey(path.join(atom.getConfigDirPath(), "workbook-signing.key")));

// The steps running now, by workbook and step id, and the redraw of every open view, by workbook.
const running = new Set();
const redraws = new Map();
const runKey = (filePath, id) => `${filePath}\n${id}`;
const redraw = (filePath) => (redraws.get(filePath) || []).forEach((fn) => fn());

function timeOf(ms) {
  return new Date(ms).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// A run card's permissions in a few plain words; the full list is the tooltip.
function grantSummary(grants) {
  const parts = [];
  if (grants.browser) parts.push("controls the browser");
  else {
    if (grants["page-js"]) parts.push("runs code in pages");
    if (grants.submit) parts.push("submits forms");
    else if (grants.forms) parts.push("fills forms");
    else if (grants.tabs) parts.push("reads pages");
  }
  if (grants.tabs) parts.push((grants.sites || []).length ? grants.sites.join(", ") : "any site");
  if (grants.read.length) parts.push("reads files");
  if (grants.write.length) parts.push("writes files");
  if (grants.net.length) parts.push("uses the network");
  if (grants.run.length) parts.push("runs commands");
  if (grants.clipboard) parts.push("uses the clipboard");
  return parts.length ? parts.join(" · ") : "no permissions";
}

// The project folder that holds the workbook, or its own folder outside any project. Every path
// the workbook names must stay inside it.
function projectRoot(filePath) {
  const [root] = atom.project.relativizePath(filePath);
  return root || path.dirname(filePath);
}

function resolve(filePath, rel, opts) {
  return resolveInProject(projectRoot(filePath), filePath, rel, opts);
}

/** A script's hash as outputs record it: the first 16 hex characters of its SHA-256. */
const hashOf = (text) => crypto.createHash("sha256").update(text).digest("hex").slice(0, 16);

/** Whether an editor holds unsaved changes to this workbook, which Tranquil's writes would clash with. */
const locked = (filePath) => atom.workspace.getTextEditors().some((e) => e.getPath() === filePath && e.isModified());

// Which block a top-level node stands for, or -1. Only a paragraph whose whole text is a
// placeholder with this draw's nonce counts.
function placeholderIndex(node, nonce) {
  if (node.nodeName !== "P") return -1;
  const m = node.textContent.trim().match(new RegExp(`^WB${nonce}N(\\d+)$`));
  return m && node.textContent.trim() === format.placeholder(nonce, Number(m[1])) ? Number(m[1]) : -1;
}

/** A step's script, read: where it is, its text and its hash, or why it can't run. */
function stepScript(filePath, block) {
  if (!block.stepOk) return { refused: "This step can't run until the problem above is fixed." };
  const res = resolve(filePath, block.path, { ext: ".ts" });
  if (!res.ok) return { refused: `This step can't run: ${res.reason}.` };
  const read = readCapped(res.abs);
  if (!read.ok) return { abs: res.abs, refused: read.missing ? `The script ${block.path} doesn't exist.` : read.reason };
  return { abs: res.abs, text: read.text, truncated: read.truncated, hash: hashOf(read.text) };
}

// A step: its script, what it may do, its source, and whether it changed since its last output.
function runModel(filePath, block, outputs, watch, isLocked) {
  const run = { kind: "run", key: `run:${block.id}`, id: block.id, path: block.path || null };
  const script = stepScript(filePath, block);
  if (script.abs) watch.add(script.abs);
  if (script.refused) return { ...run, refused: script.refused };
  let grants;
  try {
    const { grants: g } = parseHeader(script.text);
    grants = { summary: grantSummary(g), detail: renderGrants(g).join("\n"), error: false };
  } catch (e) {
    grants = { summary: "no valid permission header", detail: e.message, error: true };
  }
  const last = outputs.get(block.id);
  const changed = Boolean(last && (last.attrs.hash !== script.hash || decodeURI(last.attrs.script || "") !== block.path));
  const isRunning = running.has(runKey(filePath, block.id));
  return {
    ...run,
    grants,
    source: script.text + (script.truncated ? CUT_NOTE : ""),
    hasRun: Boolean(last),
    changed,
    running: isRunning,
    canRun: !isLocked && !isRunning,
  };
}

// A live view of a data file the workbook names, collapsed to one line.
function fileModel(filePath, block, watch) {
  const file = { kind: "file", key: `file:${block.path}`, path: block.path || null, error: false };
  const res = resolve(filePath, block.path);
  if (!res.ok) return { ...file, state: res.reason, error: true };
  watch.add(res.abs);
  const read = readCapped(res.abs);
  if (!read.ok) return { ...file, state: read.missing ? "not written yet" : read.reason };
  return { ...file, state: `changed ${timeOf(read.mtimeMs)}`, text: read.text + (read.truncated ? CUT_NOTE : "") };
}

/** A signed output's body split into its text and its result, when it has one. */
function splitResult(block) {
  if (block.attrs.result !== "1") return { text: block.body };
  const at = block.body.startsWith(RESULT_MARK) ? 0 : block.body.lastIndexOf(`\n\n${RESULT_MARK}`);
  if (at < 0) return { text: block.body };
  const json = block.body.slice(at + (at === 0 ? 0 : 2) + RESULT_MARK.length);
  try {
    return { text: block.body.slice(0, at), result: JSON.parse(json), hasResult: true };
  } catch {
    return { text: block.body };
  }
}

const firstLine = (text) => (String(text).split("\n").find((l) => l.trim()) || "").trim();

function blockModel(filePath, block, index, ctx) {
  if (block.kind === "run") return runModel(filePath, block, ctx.outputs, ctx.watch, ctx.locked);
  if (block.kind === "file") return fileModel(filePath, block, ctx.watch);
  const verified = (block.kind === "output" || block.kind === "message") && signatures.verify(signingKey(), block);
  const at = Date.parse(block.attrs.at || "");
  const time = Number.isNaN(at) ? "" : timeOf(at);
  if (block.kind === "reply") {
    return {
      kind: "reply",
      key: `reply:${index}`,
      time,
      summary: firstLine(block.body),
      nodes: Array.from(safeMarkdown.render(block.body).childNodes),
      startOpen: ctx.newestThread.has(index),
    };
  }
  if (!verified) return { kind: block.kind, label: `${block.kind} · not written by Tranquil`, body: block.body };
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
    state: state === "not-started" ? "not started" : STATE_LABELS[state] || state,
    tone: { succeeded: "success", failed: "error", "timed-out": "error", "not-started": "warning" }[state] || "surface",
    time,
    duration: block.attrs.ms ? formatDuration(Number(block.attrs.ms)) : "",
    text,
    result,
    hasResult: Boolean(hasResult),
  };
}

/**
 * What the view draws for a workbook, and every file whose change should redraw it. The model is
 * the title, the format's warnings, whether the controls are locked, the task boxes, and the
 * document as runs of rendered Markdown with the workbook's own blocks between them. Each block is
 * a top-level paragraph holding only its placeholder (blocks start at column 0, so nothing nests
 * them), and the nonce is new every time.
 */
function readWorkbook(filePath) {
  const title = path.basename(filePath);
  const watch = new Set([filePath]);
  let text;
  try {
    text = fs.readFileSync(filePath, "utf8");
  } catch (e) {
    return { model: { title, error: `Can't read this workbook: ${e.message}` }, watch };
  }
  const doc = format.parseDoc(text);
  const isLocked = locked(filePath);

  // Each step's latest output that Tranquil signed, for "changed since this run".
  const outputs = new Map();
  for (const b of doc.blocks) {
    if (b.kind === "output" && b.id && signatures.verify(signingKey(), b)) outputs.set(b.id, b);
  }
  // The newest message and the reply right after it start open; older ones show one line.
  const newestThread = new Set();
  const lastMessage = doc.blocks.map((b) => b.kind).lastIndexOf("message");
  if (lastMessage >= 0) {
    newestThread.add(lastMessage);
    if (doc.blocks[lastMessage + 1]?.kind === "reply") newestThread.add(lastMessage + 1);
  }
  const ctx = { outputs, watch, locked: isLocked, newestThread };

  const nonce = crypto.randomBytes(8).toString("hex");
  const frag = safeMarkdown.render(format.renderSource(text, doc, nonce));
  const segments = [];
  let run = null;
  for (const node of Array.from(frag.childNodes)) {
    const n = placeholderIndex(node, nonce);
    if (n >= 0 && doc.blocks[n]) {
      segments.push({ key: `b${n}`, kind: "block", block: blockModel(filePath, doc.blocks[n], n, ctx) });
      run = null;
      continue;
    }
    if (!run) {
      run = { key: `m${segments.length}`, kind: "markdown", nodes: [] };
      segments.push(run);
    }
    run.nodes.push(node);
  }
  return {
    model: {
      title: doc.title || title,
      warnings: doc.warnings,
      locked: isLocked,
      tasks: doc.tasks.map((t) => t.checked),
      segments,
    },
    watch,
  };
}

/**
 * Calls `onModel` with the workbook's model now, and again whenever the workbook or a file it
 * shows changes, a step starts or ends, or an editor's unsaved changes to the workbook come or go.
 * Returns a function that stops watching. Folders are watched rather than files, since a watch on
 * a file can miss it being replaced by an atomic rename.
 */
function watchWorkbook(filePath, onModel) {
  const watchers = new Map(); // folder → fs.FSWatcher
  let watched = new Set();
  let timer = null;
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
        watchers.set(dir, fs.watch(dir, (event, name) => {
          if (!name || watched.has(path.join(dir, String(name)))) later();
        }));
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
  redraws.get(filePath).add(later);
  // observeTextEditors calls back for the editors already open before it returns.
  const subscriptions = [];
  subscriptions.push(atom.workspace.observeTextEditors((editor) => {
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
function write(filePath, edit) {
  if (locked(filePath)) {
    atom.notifications.addWarning("Save or discard the workbook's unsaved changes first", {
      detail: "It's open in an editor with changes that aren't saved, and Tranquil's write would clash with them.",
      dismissable: true,
    });
    return false;
  }
  const result = writeDoc(filePath, edit);
  if (!result.ok) atom.notifications.addError("Couldn't write the workbook", { detail: result.reason, dismissable: true });
  return result.ok;
}

/** A signed block's text. */
function signedBlock(kind, id, attrs, body) {
  const sig = signatures.sign(signingKey(), kind, id, attrs, body);
  return format.blockText(kind, id, { ...attrs, sig }, body);
}

/**
 * Runs a step, as the person who clicked Run, and writes its signed output under it. The script's
 * hash is taken now, so the output records the version that ran. A second click while it runs
 * does nothing.
 */
async function runStep(filePath, stepId) {
  const k = runKey(filePath, stepId);
  if (running.has(k) || !runManager || locked(filePath)) return;
  let text;
  try {
    text = fs.readFileSync(filePath, "utf8");
  } catch (e) {
    atom.notifications.addError("Couldn't read the workbook", { detail: e.message, dismissable: true });
    return;
  }
  const block = format.parseDoc(text).blocks.find((b) => b.kind === "run" && b.id === stepId);
  if (!block) return;
  const script = stepScript(filePath, block);
  if (script.refused) return;

  running.add(k);
  redraw(filePath);
  const trigger = `workbook:${filePath}`;
  const startedAt = Date.now();
  let runId = null;
  let record = null;
  let failure = null;
  // A run that's refused (no Deno, a bad header, declined consent) resolves null; its record
  // arrives first, through onDidStartRun. A run that can't even be set up throws.
  let refusal = null;
  const sub = runManager.onDidStartRun((r) => {
    if (!refusal && r.trigger === trigger && r.scriptPath === script.abs && r.state !== "running") refusal = r;
  });
  try {
    runId = await runManager.run({ scriptPath: script.abs, trigger });
    record = runId ? await runManager.whenDone(runId) : refusal;
  } catch (e) {
    failure = String((e && e.message) || e);
  } finally {
    sub.dispose();
  }

  const started = Boolean(runId && record);
  const state = started ? record.state : "not-started";
  const body = format.capOutput(started ? runText(record) : (record && record.output) || failure || "The run didn't start.");
  const attrs = {
    script: encodeURI(block.path),
    hash: script.hash,
    state,
    at: new Date(started ? record.startedAt : startedAt).toISOString(),
    ms: started && record.endedAt ? String(record.endedAt - record.startedAt) : undefined,
    result: started && record.result !== undefined ? "1" : undefined,
  };
  running.delete(k);
  const written = write(filePath, (now) => format.setOutput(now, stepId, signedBlock("output", stepId, attrs, body)));
  if (!written) redraw(filePath);
}

/** Ticks or unticks task `index`, unless it changed since the person saw it. */
function toggleTask(filePath, index, wasChecked) {
  write(filePath, (text) => format.toggleTask(text, index, wasChecked));
}

/** Adds the person's signed message: at the end, or under a step when it's about one. */
function sendMessage(filePath, text, stepId) {
  const body = String(text).replace(/\r\n?/g, "\n").trim();
  if (!body) return false;
  const block = signedBlock("message", undefined, { at: new Date().toISOString() }, body);
  return write(filePath, (now) => format.insertMessage(now, block, stepId || undefined));
}

// Links never navigate the window. Web links open in a browser tab; relative links open in
// Tranquil if they stay in the project; anything else does nothing.
function openLink(filePath, href) {
  const link = safeMarkdown.classifyLink(href);
  if (link.kind === "web") {
    atom.workspace.open(link.url);
  } else if (link.kind === "relative") {
    const res = resolve(filePath, link.path);
    if (res.ok) atom.workspace.open(res.abs);
    else atom.notifications.addWarning("Can't open that link", { detail: res.reason, dismissable: true });
  }
}

/**
 * The message box: a Pulsar text editor, which needs the app's own stylesheets, so it lives
 * outside the view's shadow root and is slotted in. ⌘↩ (ctrl-enter elsewhere) sends.
 */
function createComposer() {
  const editor = atom.workspace.buildTextEditor({ autoHeight: true, lineNumberGutterVisible: false });
  editor.setSoftWrapped(true); // after building: the editor.softWrap setting overrides the option
  editor.setPlaceholderText("Message your LLM…");
  const element = document.createElement("div");
  element.className = "tranquil-workbook-composer";
  element.append(editor.getElement());
  return {
    element,
    getText: () => editor.getText(),
    clear: () => editor.setText(""),
    focus: () => editor.getElement().focus(),
    onSubmit: (fn) => atom.commands.add(editor.getElement(), "tranquil-automations:send-workbook-message", fn),
    destroy: () => editor.destroy(),
  };
}

module.exports = { setRunManager, watchWorkbook, runStep, toggleTask, sendMessage, openLink, createComposer };
