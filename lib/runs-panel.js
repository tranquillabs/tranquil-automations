"use babel";

// Automation Runs — the bottom-dock run history panel (ADR-0022 specific 4). A thin view over
// RunManager's ring buffer: run list on the left (state, duration, trigger), selected run's
// output on the right, Cancel while running. Entries carry `kind` so engine workflow runs
// (ADR-0023) land in this same surface later.
//
// Deserialization timing: the workspace restores BEFORE activate(), so a restored panel is
// built without a RunManager and binds when setRunManager() is called from activate — the
// same late-binding pattern as VerticalTabsView.setFileIconService.
const { CompositeDisposable, Emitter } = require("atom");
const path = require("path");
const paneControls = require("./pane-controls.js");

const STATE_LABELS = {
  running: "running",
  paused: "paused", // a debug session stopped at a breakpoint (ADR-0025)
  succeeded: "ok",
  failed: "failed",
  cancelled: "cancelled",
  "timed-out": "timed out",
};

function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m${s % 60 ? ` ${s % 60}s` : ""}`;
}

function triggerLabel(trigger) {
  if (!trigger || trigger === "manual") return "manual";
  if (trigger.startsWith("command:")) return trigger.slice(8);
  if (trigger.startsWith("url:")) return "url trigger";
  return trigger;
}

class AutomationRunsView {
  constructor(state = {}) {
    this.emitter = new Emitter();
    this.disposables = new CompositeDisposable();
    this.selectedRunId = null;
    this.tickTimer = null;
    this.listWidth = typeof state.listWidth === "number" ? state.listWidth : 240;

    // Incremental-render bookkeeping. Output streams in chunk by chunk, so the
    // panel has to be able to tell "nothing structural changed, just more text"
    // from "the run list actually changed" — see render()/renderList().
    this.pendingRender = null; // Disposable for a coalesced render, if one is queued
    this.listSignature = null; // run ids + states + selection, as last drawn
    this.rowMeta = new Map(); // runId → the row's <span class="run-meta">
    this.detailRunId = null; // which run the detail DOM currently belongs to
    this.renderedOutput = ""; // exact text currently in the <pre>, for delta appends

    this.element = document.createElement("div");
    this.element.classList.add("tranquil-runs-panel");
    this.listEl = document.createElement("ol");
    this.listEl.classList.add("runs-list");
    this.listEl.style.flex = `0 0 ${this.listWidth}px`;
    // Draggable divider between the run list and the selected run's output.
    this.divider = document.createElement("div");
    this.divider.classList.add("runs-divider");
    this.detailEl = document.createElement("div");
    this.detailEl.classList.add("runs-detail");
    this.element.append(this.listEl, this.divider, this.detailEl);
    this.setupResize();

    AutomationRunsView.instances.add(this);
    this.bind();
    this.render();
  }

  // Drag the divider to resize the list column. Width is clamped and persisted.
  setupResize() {
    const MIN_LIST = 140;
    const MIN_DETAIL = 200;
    const onMove = (e) => {
      const rect = this.element.getBoundingClientRect();
      const max = Math.max(MIN_LIST, rect.width - MIN_DETAIL);
      const w = Math.max(MIN_LIST, Math.min(e.clientX - rect.left, max));
      this.listWidth = w;
      this.listEl.style.flex = `0 0 ${w}px`;
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.classList.remove("tranquil-runs-resizing");
    };
    this.endResize = onUp; // so destroy() can drop any in-flight drag
    this.divider.addEventListener("mousedown", (e) => {
      e.preventDefault();
      document.body.classList.add("tranquil-runs-resizing");
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    });
  }

  bind() {
    const rm = AutomationRunsView.runManager;
    if (!rm || this.boundManager === rm) return;
    this.boundManager = rm;
    // Coalesced, not direct: RunManager emits did-update once per stdout/stderr
    // chunk, at whatever rate the OS delivers pipe data. Rendering per chunk made
    // a chatty automation drive a full panel rebuild at a rate the child process
    // controls; one render per frame is all the screen can show anyway.
    this.disposables.add(rm.onDidUpdate(() => this.scheduleRender()));
    // A newly triggered run takes the selection — the panel should show what just started,
    // not whatever run was last clicked.
    this.disposables.add(rm.onDidStartRun((run) => this.selectRun(run.runId)));
  }

  runs() {
    return AutomationRunsView.runManager ? AutomationRunsView.runManager.runs : [];
  }

  selectRun(runId) {
    this.selectedRunId = runId;
    this.render();
    // The Copy and Cancel controls describe the SELECTED run ("nothing to copy", "already
    // finished"), so changing the selection has to re-render the tab-bar strip too — nothing
    // pane-controls watches on its own changes when a row is clicked.
    paneControls.refresh();
  }

  // Queue a render for the next frame, collapsing any number of requests into one.
  // Direct user actions (selecting a run, cancelling, clearing) still call render()
  // synchronously — it's only the streaming did-update firehose that needs damping.
  scheduleRender() {
    if (this.pendingRender) return;
    this.pendingRender = atom.views.updateDocument(() => {
      this.pendingRender = null;
      this.render();
    });
  }

  render() {
    const runs = this.runs();
    if (this.selectedRunId == null && runs.length) this.selectedRunId = runs[0].runId;
    const selected = runs.find((r) => r.runId === this.selectedRunId) || null;

    this.renderList(runs, selected);
    this.renderDetail(selected);

    // Tick durations while anything runs.
    const anyRunning = runs.some((r) => r.state === "running");
    if (anyRunning && !this.tickTimer) {
      this.tickTimer = setInterval(() => this.render(), 1000);
    } else if (!anyRunning && this.tickTimer) {
      clearInterval(this.tickTimer);
      this.tickTimer = null;
    }
  }

  // The list only changes when a run is added, changes state, or the selection moves —
  // never because more output arrived. Rebuilding it per chunk was throwing away and
  // recreating every row (and its mousedown listener) for a change it can't even show.
  renderList(runs, selected) {
    const signature =
      runs.map((r) => `${r.runId}:${r.state}`).join("|") + `#${this.selectedRunId}`;
    if (signature !== this.listSignature) {
      this.listSignature = signature;
      this.rebuildList(runs, selected);
    }
    // Durations do tick every second for in-flight runs, but that's a text change on
    // a node that already exists, not a reason to rebuild anything.
    for (const run of runs) {
      const meta = this.rowMeta.get(run.runId);
      if (!meta) continue;
      const text = this.metaText(run);
      if (meta.textContent !== text) meta.textContent = text;
    }
  }

  metaText(run) {
    const duration = (run.endedAt || Date.now()) - run.startedAt;
    return `${triggerLabel(run.trigger)} · ${formatDuration(duration)}`;
  }

  rebuildList(runs, selected) {
    this.listEl.textContent = "";
    this.rowMeta.clear();
    if (!runs.length) {
      const empty = document.createElement("li");
      empty.classList.add("runs-empty");
      empty.textContent = "No automation runs yet — run a .ts automation with cmd-shift-R.";
      this.listEl.appendChild(empty);
    }
    for (const run of runs) {
      const li = document.createElement("li");
      li.classList.add("runs-row", `state-${run.state}`);
      if (selected && run.runId === selected.runId) li.classList.add("selected");

      const dot = document.createElement("span");
      dot.classList.add("state-dot");
      dot.title = STATE_LABELS[run.state] || run.state;

      const name = document.createElement("span");
      name.classList.add("run-name");
      // A selection run is not the file, and saying so here is what makes an accidental one
      // (a stray double-click selection) obvious instead of mysterious.
      name.textContent =
        path.basename(run.scriptPath) + (run.selection ? " · selection" : "");

      const meta = document.createElement("span");
      meta.classList.add("run-meta");
      meta.textContent = this.metaText(run);
      this.rowMeta.set(run.runId, meta);

      li.append(dot, name, meta);
      li.addEventListener("mousedown", () => this.selectRun(run.runId));
      this.listEl.appendChild(li);
    }
  }

  // Detail: header (script + state) above the output stream. The <pre> is kept across
  // renders and grown by appending the delta — rewriting .textContent re-laid-out the
  // whole buffer (up to MAX_OUTPUT, 64KB) for every chunk that arrived.
  renderDetail(selected) {
    if (!selected) {
      this.detailEl.textContent = "";
      this.titleEl = null;
      this.outputEl = null;
      this.detailRunId = null;
      this.renderedOutput = "";
      return;
    }

    // Read scroll position BEFORE touching the DOM: reading it after a write would
    // force a synchronous layout to answer.
    const sameRun = this.detailRunId === selected.runId && this.outputEl;
    const stickToBottom =
      !sameRun ||
      this.outputEl.scrollTop + this.outputEl.clientHeight >=
        this.outputEl.scrollHeight - 4;

    if (!sameRun) this.buildDetail(selected.runId);

    const scope = selected.selection
      ? ` · selection (${selected.selection} line${selected.selection === 1 ? "" : "s"})`
      : "";
    const titleText = `${path.basename(selected.scriptPath)}${scope} — ${
      STATE_LABELS[selected.state] || selected.state
    }`;
    if (this.titleEl.textContent !== titleText) this.titleEl.textContent = titleText;

    // Copy / Cancel / Clear / Revoke live in the pane's tab-bar control strip
    // (runs-panel-controls.js), not here — one row of buttons for the pane rather than a
    // second set of in-body controls that only exist while a run is selected.
    if (
      this.cancellingRunId === selected.runId &&
      selected.state !== "running" &&
      selected.state !== "paused"
    ) {
      // The run reached a final state; drop the flag so re-selecting it later starts clean.
      this.cancellingRunId = null;
    }

    const text = selected.output || "(no output)";
    if (text !== this.renderedOutput) {
      // The common streaming case is pure growth, so append only what's new. When the
      // ring buffer truncates from the front (output past MAX_OUTPUT) the old text is no
      // longer a prefix, and we fall back to replacing the lot.
      if (this.renderedOutput && text.startsWith(this.renderedOutput)) {
        this.outputEl.appendChild(
          document.createTextNode(text.slice(this.renderedOutput.length))
        );
      } else {
        this.outputEl.textContent = text;
      }
      this.renderedOutput = text;
    }

    if (stickToBottom || selected.state === "running") {
      this.outputEl.scrollTop = this.outputEl.scrollHeight;
    }
  }

  buildDetail(runId) {
    this.detailEl.textContent = "";
    const header = document.createElement("div");
    header.classList.add("run-header");
    this.titleEl = document.createElement("span");
    this.titleEl.classList.add("run-title");
    header.appendChild(this.titleEl);

    const output = document.createElement("pre");
    output.classList.add("run-output");
    // Focusable (tabindex -1) so a mouse selection makes it document.activeElement;
    // that lets the cmd-c/ctrl-c handler below run before Atom's keymap turns the
    // keystroke into `core:copy`, which has no handler outside atom-text-editor and
    // would otherwise swallow it silently.
    output.tabIndex = -1;
    output.addEventListener("keydown", (e) => this.handleOutputKeydown(e));

    this.outputEl = output;
    this.detailRunId = runId;
    this.renderedOutput = "";
    this.detailEl.append(header, output);
  }

  // --- Actions driven by the pane controls ---------------------------------

  selectedRun() {
    return this.runs().find((r) => r.runId === this.selectedRunId) || null;
  }

  // Copy the selected run's full output. Returns whether anything was copied, so the control
  // can show feedback only when there was something to copy.
  copyOutput() {
    const selected = this.selectedRun();
    if (!selected || !selected.output) return false;
    atom.clipboard.write(selected.output);
    return true;
  }

  // True when the selected run can be cancelled right now.
  canCancel() {
    const selected = this.selectedRun();
    return !!selected && (selected.state === "running" || selected.state === "paused");
  }

  // True while a cancel is escalating for the selected run.
  isCancelling() {
    const selected = this.selectedRun();
    return !!selected && this.cancellingRunId === selected.runId;
  }

  // Cancel the selected run. Cancelling is not instant — the runner sends a CANCEL frame, then
  // escalates to SIGTERM and SIGKILL over ~3s — so the flag lets the control report progress
  // rather than looking inert. It lives on the view, not on a DOM node, because output keeps
  // streaming during cancellation and every chunk re-renders.
  cancelSelected() {
    const selected = this.selectedRun();
    if (!selected || !this.canCancel()) return false;
    if (this.cancellingRunId === selected.runId) return false; // already escalating
    this.cancellingRunId = selected.runId;
    AutomationRunsView.runManager?.cancel(selected.runId);
    this.render();
    return true;
  }

  // Drop finished runs. In-flight ones stay (see RunManager.clearRuns). The selection is reset
  // so the panel lands on whatever is left rather than pointing at a run that no longer exists.
  clearRuns() {
    const cleared = AutomationRunsView.runManager?.clearRuns() || 0;
    this.selectedRunId = null;
    this.render();
    return cleared;
  }

  // Copy the current text selection on cmd-c / ctrl-c. Atom binds these to `core:copy` on
  // `body`, which has no handler outside atom-text-editor, so without this the keystroke is
  // swallowed and nothing is copied. Handle it here (like tranquil-browser's find bar) and
  // stop propagation so the keymap doesn't also act on it.
  handleOutputKeydown(e) {
    const isCopy = (e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && e.code === "KeyC";
    if (!isCopy) return;
    const sel = window.getSelection();
    const text = sel && !sel.isCollapsed ? sel.toString() : "";
    if (!text) return; // nothing selected — let the keystroke be
    e.preventDefault();
    e.stopPropagation();
    atom.clipboard.write(text);
  }

  // --- Workspace item contract ---------------------------------------------

  getElement() {
    return this.element;
  }

  getTitle() {
    return "Automation Runs";
  }

  getURI() {
    return AutomationRunsView.URI;
  }

  getIconName() {
    return "playback-play";
  }

  getDefaultLocation() {
    return "bottom";
  }

  getAllowedLocations() {
    return ["bottom"];
  }

  getPreferredHeight() {
    return 220;
  }

  serialize() {
    return { deserializer: AutomationRunsView.DESERIALIZER, listWidth: this.listWidth };
  }

  onDidDestroy(callback) {
    return this.emitter.on("did-destroy", callback);
  }

  destroy() {
    AutomationRunsView.instances.delete(this);
    if (this.tickTimer) clearInterval(this.tickTimer);
    if (this.pendingRender) this.pendingRender.dispose(); // drop a queued frame render
    if (this.endResize) this.endResize(); // drop any in-flight drag listeners
    this.disposables.dispose();
    this.element.remove();
    this.emitter.emit("did-destroy");
    this.emitter.dispose();
  }
}

AutomationRunsView.URI = "tranquil-automations://runs";
AutomationRunsView.DESERIALIZER = "TranquilAutomationRunsView";
AutomationRunsView.instances = new Set();
AutomationRunsView.runManager = null;
AutomationRunsView.setRunManager = function (rm) {
  AutomationRunsView.runManager = rm;
  for (const view of AutomationRunsView.instances) {
    view.bind();
    view.render();
  }
};

module.exports = AutomationRunsView;
