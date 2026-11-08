"use babel";

// Opens a `*.workbook.md` as a workbook pane (ADR-0030, ADR-0032). The workbook's view and its
// service are TypeScript and Svelte, built from ui/workbook into dist/; they're loaded when the
// first workbook opens, so a problem with the build affects workbooks only, not the rest of the
// package. This file hands them what they need from Pulsar and the rest of the package.

const fs = require("fs");
const path = require("path");
const { parseHeader, renderGrants } = require("./permissions.js");
const { STATE_LABELS, formatDuration, runText } = require("./run-text.js");

const DESERIALIZER = "TranquilWorkbookView";

let runManager = null;
/** Called on activation (lib/tranquil-automations.js); restored panes exist before that. */
function setRunManager(rm) {
  runManager = rm;
}

let built = null;
function workbookUi() {
  if (!built) {
    const ui = require("../dist/workbook-ui.js");
    built = {
      ui,
      css: fs.readFileSync(path.join(__dirname, "..", "dist", "workbook-ui.css"), "utf8"),
      service: ui.createWorkbookService({
        pulsar: atom,
        runManager: () => runManager,
        runText,
        stateLabels: STATE_LABELS,
        formatDuration,
        parseHeader,
        renderGrants,
      }),
    };
  }
  return built;
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

/** A local file path ending in .workbook.md. URLs (with a scheme) never match. */
const isWorkbookPath = (uri) => typeof uri === "string" && path.isAbsolute(uri) && uri.endsWith(".workbook.md");

/** A workbook pane for `saved` (`filePath`, and `scrollTop` when restoring). */
function openWorkbookPane(saved) {
  const { ui, css, service } = workbookUi();
  return ui.workbookPane(saved, { service, composer: createComposer(), css, deserializer: DESERIALIZER });
}

module.exports = { DESERIALIZER, isWorkbookPath, openWorkbookPane, setRunManager };
