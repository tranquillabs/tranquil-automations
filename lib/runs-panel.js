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

const STATE_LABELS = {
  running: "running",
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
    this.disposables.add(rm.onDidUpdate(() => this.render()));
  }

  runs() {
    return AutomationRunsView.runManager ? AutomationRunsView.runManager.runs : [];
  }

  selectRun(runId) {
    this.selectedRunId = runId;
    this.render();
  }

  render() {
    const runs = this.runs();
    if (this.selectedRunId == null && runs.length) this.selectedRunId = runs[0].runId;
    const selected = runs.find((r) => r.runId === this.selectedRunId) || null;

    // Run list.
    this.listEl.textContent = "";
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
      name.textContent = path.basename(run.scriptPath);

      const meta = document.createElement("span");
      meta.classList.add("run-meta");
      const duration = (run.endedAt || Date.now()) - run.startedAt;
      meta.textContent = `${triggerLabel(run.trigger)} · ${formatDuration(duration)}`;

      li.append(dot, name, meta);
      li.addEventListener("mousedown", () => this.selectRun(run.runId));
      this.listEl.appendChild(li);
    }

    // Detail: header (script + state + cancel) above the output stream.
    const stickToBottom =
      this.outputEl &&
      this.outputEl.scrollTop + this.outputEl.clientHeight >= this.outputEl.scrollHeight - 4;
    this.detailEl.textContent = "";
    if (selected) {
      const header = document.createElement("div");
      header.classList.add("run-header");
      const title = document.createElement("span");
      title.classList.add("run-title");
      title.textContent = `${path.basename(selected.scriptPath)} — ${
        STATE_LABELS[selected.state] || selected.state
      }`;
      header.appendChild(title);

      // Right-aligned actions: Copy the whole output, and Cancel while running.
      const actions = document.createElement("span");
      actions.classList.add("run-actions");

      const copy = document.createElement("button");
      copy.classList.add("btn", "btn-sm", "run-copy");
      copy.textContent = "Copy";
      copy.title = "Copy output to clipboard";
      copy.disabled = !selected.output;
      // mousedown, not click: while a run streams output the panel re-renders on every
      // chunk (RunManager did-update), rebuilding these buttons. A click needs mousedown
      // AND mouseup on the same element instance, so a re-render between press and release
      // eats it — mousedown fires on press, before the rebuild. Same reason the list rows
      // below use mousedown.
      copy.addEventListener("mousedown", (e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        this.copyOutput(copy);
      });
      actions.appendChild(copy);

      if (selected.state === "running") {
        const cancel = document.createElement("button");
        cancel.classList.add("btn", "btn-sm", "run-cancel");
        cancel.textContent = "Cancel";
        cancel.addEventListener("mousedown", (e) => {
          if (e.button !== 0) return;
          e.preventDefault();
          AutomationRunsView.runManager?.cancel(selected.runId);
        });
        actions.appendChild(cancel);
      }
      header.appendChild(actions);

      const output = document.createElement("pre");
      output.classList.add("run-output");
      // Focusable (tabindex -1) so a mouse selection makes it document.activeElement;
      // that lets the cmd-c/ctrl-c handler below run before Atom's keymap turns the
      // keystroke into `core:copy`, which has no handler outside atom-text-editor and
      // would otherwise swallow it silently.
      output.tabIndex = -1;
      output.textContent = selected.output || "(no output)";
      output.addEventListener("keydown", (e) => this.handleOutputKeydown(e));
      this.outputEl = output;
      this.detailEl.append(header, output);
      if (stickToBottom || selected.state === "running") {
        output.scrollTop = output.scrollHeight;
      }
    }

    // Tick durations while anything runs.
    const anyRunning = runs.some((r) => r.state === "running");
    if (anyRunning && !this.tickTimer) {
      this.tickTimer = setInterval(() => this.render(), 1000);
    } else if (!anyRunning && this.tickTimer) {
      clearInterval(this.tickTimer);
      this.tickTimer = null;
    }
  }

  // Copy the selected run's full output to the clipboard, with brief button feedback.
  copyOutput(button) {
    const selected = this.runs().find((r) => r.runId === this.selectedRunId) || null;
    if (!selected || !selected.output) return;
    atom.clipboard.write(selected.output);
    if (!button) return;
    const prev = button.textContent;
    button.textContent = "Copied";
    button.classList.add("copied");
    clearTimeout(this.copyFeedbackTimer);
    this.copyFeedbackTimer = setTimeout(() => {
      button.textContent = prev;
      button.classList.remove("copied");
    }, 1200);
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
    if (this.copyFeedbackTimer) clearTimeout(this.copyFeedbackTimer);
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
