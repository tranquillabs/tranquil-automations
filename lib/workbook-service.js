"use babel";

// The workbook view's work that needs Node or Pulsar (ADR-0030, ADR-0032): reading a workbook,
// checking the paths it names, rendering its Markdown, watching the files it shows, and opening
// its links. It draws nothing. The view (ui/workbook) calls it and draws the models it returns,
// so the UI never touches files itself. Running steps, ticks and messages arrive in step 2.

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { parseDoc, renderSource, placeholder } = require("./workbook-format.js");
const { resolveInProject, readCapped } = require("./workbook-disk.js");
const safeMarkdown = require("./safe-markdown.js");
const { parseHeader, renderGrants } = require("./permissions.js");

const DEBOUNCE_MS = 75;
const CUT_NOTE = "\n… (cut at 64 KB)";

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

// Which block a top-level node stands for, or -1. Only a paragraph whose whole text is a
// placeholder with this draw's nonce counts.
function placeholderIndex(node, nonce) {
  if (node.nodeName !== "P") return -1;
  const m = node.textContent.trim().match(new RegExp(`^WB${nonce}N(\\d+)$`));
  return m && node.textContent.trim() === placeholder(nonce, Number(m[1])) ? Number(m[1]) : -1;
}

// A step: its script, what the script may do, and its source. Running it comes in step 2.
function runModel(filePath, block, watch) {
  const run = { kind: "run", key: `run:${block.id}`, path: block.path || null };
  if (!block.stepOk) return { ...run, refused: "This step can't run until the problem above is fixed." };
  const res = resolve(filePath, block.path, { ext: ".ts" });
  if (!res.ok) return { ...run, refused: `This step can't run: ${res.reason}.` };
  watch.add(res.abs);
  const read = readCapped(res.abs);
  if (!read.ok) return { ...run, refused: read.missing ? `The script ${block.path} doesn't exist.` : read.reason };
  let grants;
  try {
    const { grants: g } = parseHeader(read.text);
    grants = { summary: grantSummary(g), detail: renderGrants(g).join("\n"), error: false };
  } catch (e) {
    grants = { summary: "no valid permission header", detail: e.message, error: true };
  }
  return { ...run, grants, source: read.text + (read.truncated ? CUT_NOTE : "") };
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

function blockModel(filePath, block, watch) {
  if (block.kind === "run") return runModel(filePath, block, watch);
  if (block.kind === "file") return fileModel(filePath, block, watch);
  // Outputs and messages are trusted only when Tranquil's signature checks out, which arrives in
  // step 2. Until then every one is shown as plain text and labelled as unverified.
  const label = block.kind === "reply" ? "reply" : `${block.kind} · not written by Tranquil`;
  return { kind: block.kind, label, body: block.body };
}

/**
 * What the view draws for a workbook, and every file whose change should redraw it. The model is
 * the title, the format's warnings, and the document as runs of rendered Markdown with the
 * workbook's own blocks between them. Each block is a top-level paragraph holding only its
 * placeholder (blocks start at column 0, so nothing nests them), and the nonce is new every time.
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
  const doc = parseDoc(text);
  const nonce = crypto.randomBytes(8).toString("hex");
  const frag = safeMarkdown.render(renderSource(text, doc, nonce));
  const segments = [];
  let run = null;
  for (const node of Array.from(frag.childNodes)) {
    const n = placeholderIndex(node, nonce);
    if (n >= 0 && doc.blocks[n]) {
      segments.push({ key: `b${n}`, kind: "block", block: blockModel(filePath, doc.blocks[n], watch) });
      run = null;
      continue;
    }
    if (!run) {
      run = { key: `m${segments.length}`, kind: "markdown", nodes: [] };
      segments.push(run);
    }
    run.nodes.push(node);
  }
  return { model: { title: doc.title || title, warnings: doc.warnings, segments }, watch };
}

/**
 * Calls `onModel` with the workbook's model now, and again whenever the workbook or a file it
 * shows changes, from anyone. Returns a function that stops watching. Folders are watched rather
 * than files, since a watch on a file can miss it being replaced by an atomic rename.
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
          if (!name || watched.has(path.join(dir, String(name)))) {
            clearTimeout(timer);
            timer = setTimeout(draw, DEBOUNCE_MS);
          }
        }));
      } catch {
        // A folder that doesn't exist yet is watched once a later draw finds it.
      }
    }
    onModel(model);
  }

  // The first draw comes just after this returns, outside the caller's own update.
  queueMicrotask(draw);
  return () => {
    stopped = true;
    clearTimeout(timer);
    for (const w of watchers.values()) w.close();
    watchers.clear();
  };
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

module.exports = { watchWorkbook, openLink };
