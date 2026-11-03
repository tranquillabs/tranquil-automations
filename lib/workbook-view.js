"use babel";

// The workbook view (ADR-0030): the pane item that draws a `*.workbook.md`. It holds no state of
// its own. It reads the file, draws it, and redraws whenever the file (or a file it shows)
// changes, from anyone. Step 1 draws only; Run, ticks and messages arrive in step 2.

const { Emitter, CompositeDisposable } = require("atom");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { parseDoc, renderSource, placeholder } = require("./workbook-format.js");
const { resolveInProject, readCapped } = require("./workbook-disk.js");
const safeMarkdown = require("./safe-markdown.js");
const { parseHeader, renderGrants } = require("./permissions.js");

const DEBOUNCE_MS = 75;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

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

class WorkbookView {
  constructor(state = {}) {
    this.filePath = state.filePath;
    this.emitter = new Emitter();
    this.disposables = new CompositeDisposable();
    this.restoreScroll = typeof state.scrollTop === "number" ? state.scrollTop : null;
    this.openKeys = new Set(); // the <details> the person opened, kept across redraws
    this.watchers = new Map(); // folder → fs.FSWatcher
    this.watched = new Set(); // absolute paths whose change redraws the view
    this.pendingTimer = null;
    this.pending = true; // Pulsar's preview-tab state, ended by the first interaction
    this.title = path.basename(this.filePath);

    this.element = el("div", "tranquil-workbook");
    this.element.tabIndex = -1;
    this.content = el("div", "workbook-content");
    this.element.append(this.content);
    this.element.addEventListener("click", (e) => this.onClick(e));
    this.element.addEventListener("auxclick", (e) => {
      if (e.target.closest && e.target.closest("a")) e.preventDefault();
    });
    this.element.addEventListener("dragstart", (e) => {
      if (e.target.closest && e.target.closest("a")) e.preventDefault();
    });
    this.element.addEventListener("mousedown", () => this.terminatePendingState(), { once: true });
    this.element.addEventListener("toggle", (e) => this.onToggle(e), true);

    WorkbookView.instances.add(this);
    this.redraw();
  }

  // The project folder that holds the workbook, or its own folder outside any project. Every path
  // the workbook names must stay inside it.
  projectRoot() {
    const [root] = atom.project.relativizePath(this.filePath);
    return root || path.dirname(this.filePath);
  }

  resolve(rel, opts) {
    return resolveInProject(this.projectRoot(), this.filePath, rel, opts);
  }

  redraw() {
    let text;
    try {
      text = fs.readFileSync(this.filePath, "utf8");
    } catch (e) {
      this.content.replaceChildren(el("div", "workbook-warning", `Can't read this workbook: ${e.message}`));
      this.watch(new Set([this.filePath]));
      return;
    }

    const scroller = this.element;
    const atBottom = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 40;
    const scrollTop = this.restoreScroll !== null ? this.restoreScroll : scroller.scrollTop;
    this.restoreScroll = null;

    const doc = parseDoc(text);
    const nonce = crypto.randomBytes(8).toString("hex");
    const frag = safeMarkdown.render(renderSource(text, doc, nonce));
    const watch = new Set([this.filePath]);

    // Swap each placeholder paragraph for the block it stands for. Only a paragraph whose whole
    // text is the placeholder counts, and the nonce is new on every draw.
    for (const p of Array.from(frag.querySelectorAll("p"))) {
      const m = p.textContent.trim().match(new RegExp(`^WB${nonce}N(\\d+)$`));
      if (!m) continue;
      const block = doc.blocks[Number(m[1])];
      if (block && p.textContent.trim() === placeholder(nonce, Number(m[1]))) {
        p.replaceWith(this.blockElement(block, watch));
      }
    }

    const parts = [];
    if (doc.warnings.length) {
      const box = el("div", "workbook-warning");
      box.append(el("div", "workbook-warning-title", "This workbook has problems:"));
      const list = el("ul");
      for (const w of doc.warnings) list.append(el("li", null, w));
      box.append(list);
      parts.push(box);
    }
    parts.push(frag);
    this.content.replaceChildren(...parts);

    for (const d of this.content.querySelectorAll("details[data-key]")) {
      if (this.openKeys.has(d.dataset.key)) d.open = true;
    }
    scroller.scrollTop = atBottom && this.lastDrawn ? scroller.scrollHeight : scrollTop;
    this.lastDrawn = true;

    const title = doc.title || path.basename(this.filePath);
    if (title !== this.title) {
      this.title = title;
      this.emitter.emit("did-change-title", title);
    }
    this.watch(watch);
  }

  blockElement(block, watch) {
    if (block.kind === "run") return this.runCard(block, watch);
    if (block.kind === "file") return this.fileView(block, watch);
    return this.unverified(block);
  }

  // A step: its script, what the script may do, and its source. Running it comes in step 2.
  runCard(block, watch) {
    const card = el("div", "workbook-run");
    const header = el("div", "workbook-run-header");
    header.append(el("span", "workbook-run-path", block.path || "(no script)"));
    card.append(header);

    const problem = (text) => {
      card.classList.add("is-refused");
      card.append(el("div", "workbook-run-problem", text));
      return card;
    };
    if (!block.stepOk) return problem("This step can't run until the problem above is fixed.");
    const res = this.resolve(block.path, { ext: ".ts" });
    if (!res.ok) return problem(`This step can't run: ${res.reason}.`);
    watch.add(res.abs);
    const read = readCapped(res.abs);
    if (!read.ok) return problem(read.missing ? `The script ${block.path} doesn't exist.` : read.reason);

    const grants = el("span", "workbook-run-grants");
    try {
      const { grants: g } = parseHeader(read.text);
      grants.textContent = grantSummary(g);
      grants.title = renderGrants(g).join("\n");
    } catch (e) {
      grants.textContent = "no valid permission header";
      grants.title = e.message;
      grants.classList.add("is-error");
    }
    header.append(grants);

    const source = el("details", "workbook-run-source");
    source.dataset.key = `run:${block.id}:source`;
    source.append(el("summary", null, "source"));
    const pre = el("pre");
    pre.append(el("code", null, read.text + (read.truncated ? "\n… (cut at 64 KB)" : "")));
    source.append(pre);
    card.append(source);
    return card;
  }

  // A live view of a data file the workbook names, collapsed to one line.
  fileView(block, watch) {
    const box = el("details", "workbook-file");
    box.dataset.key = `file:${block.path}`;
    const summary = el("summary");
    summary.append(el("span", "workbook-file-path", block.path || "(no path)"));
    box.append(summary);
    const res = this.resolve(block.path);
    if (!res.ok) {
      summary.append(el("span", "workbook-file-state is-error", res.reason));
      return box;
    }
    watch.add(res.abs);
    const read = readCapped(res.abs);
    if (!read.ok) {
      summary.append(el("span", "workbook-file-state", read.missing ? "not written yet" : read.reason));
      return box;
    }
    summary.append(el("span", "workbook-file-state", `changed ${timeOf(read.mtimeMs)}`));
    const pre = el("pre");
    pre.append(el("code", null, read.text + (read.truncated ? "\n… (cut at 64 KB)" : "")));
    box.append(pre);
    return box;
  }

  // Outputs and messages are trusted only when Tranquil's signature checks out, which arrives in
  // step 2. Until then every one is shown as plain text and labelled as unverified.
  unverified(block) {
    const box = el("div", `workbook-block workbook-${block.kind}`);
    const label = block.kind === "reply" ? "reply" : `${block.kind} · not written by Tranquil`;
    box.append(el("div", "workbook-block-label", label));
    box.append(el("pre", null, block.body));
    return box;
  }

  // Links never navigate this window. Web links open in a browser tab; relative links open in
  // Tranquil if they stay in the project; anything else does nothing.
  onClick(e) {
    const a = e.target.closest && e.target.closest("a");
    if (!a || !this.element.contains(a)) return;
    e.preventDefault();
    const link = safeMarkdown.classifyLink(a.getAttribute("href"));
    if (link.kind === "web") {
      atom.workspace.open(link.url);
    } else if (link.kind === "relative") {
      const res = this.resolve(link.path);
      if (res.ok) atom.workspace.open(res.abs);
      else atom.notifications.addWarning("Can't open that link", { detail: res.reason, dismissable: true });
    }
  }

  onToggle(e) {
    const d = e.target;
    if (!d || d.nodeName !== "DETAILS" || !d.dataset.key) return;
    if (d.open) this.openKeys.add(d.dataset.key);
    else this.openKeys.delete(d.dataset.key);
  }

  // Watch the folders of every file the view shows. A folder watch also sees a file replaced by
  // an atomic rename, which a watch on the file itself can miss.
  watch(paths) {
    this.watched = paths;
    const folders = new Set(Array.from(paths, (p) => path.dirname(p)));
    for (const [dir, w] of this.watchers) {
      if (!folders.has(dir)) {
        w.close();
        this.watchers.delete(dir);
      }
    }
    for (const dir of folders) {
      if (this.watchers.has(dir)) continue;
      try {
        const w = fs.watch(dir, (event, name) => {
          if (!name || this.watched.has(path.join(dir, String(name)))) this.scheduleRedraw();
        });
        this.watchers.set(dir, w);
      } catch {
        // A folder that doesn't exist yet is watched once a redraw finds it.
      }
    }
  }

  scheduleRedraw() {
    clearTimeout(this.pendingTimer);
    this.pendingTimer = setTimeout(() => this.redraw(), DEBOUNCE_MS);
  }

  getTitle() {
    return this.title;
  }

  onDidChangeTitle(callback) {
    return this.emitter.on("did-change-title", callback);
  }

  getURI() {
    return this.filePath;
  }

  getPath() {
    return this.filePath;
  }

  getIconName() {
    return "checklist";
  }

  getAllowedLocations() {
    return ["center", "right"];
  }

  terminatePendingState() {
    if (!this.pending) return;
    this.pending = false;
    this.emitter.emit("did-terminate-pending-state");
  }

  onDidTerminatePendingState(callback) {
    return this.emitter.on("did-terminate-pending-state", callback);
  }

  serialize() {
    return { deserializer: WorkbookView.DESERIALIZER, filePath: this.filePath, scrollTop: this.element.scrollTop };
  }

  onDidDestroy(callback) {
    return this.emitter.on("did-destroy", callback);
  }

  destroy() {
    WorkbookView.instances.delete(this);
    clearTimeout(this.pendingTimer);
    for (const w of this.watchers.values()) w.close();
    this.watchers.clear();
    this.disposables.dispose();
    this.element.remove();
    this.emitter.emit("did-destroy");
    this.emitter.dispose();
  }
}

WorkbookView.DESERIALIZER = "TranquilWorkbookView";
WorkbookView.instances = new Set();
// A local file path ending in .workbook.md. URLs (with a scheme) never match.
WorkbookView.isWorkbookPath = (uri) =>
  typeof uri === "string" && path.isAbsolute(uri) && uri.endsWith(".workbook.md");

module.exports = WorkbookView;
