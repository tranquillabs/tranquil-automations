"use babel";

// Pane control for automation editors: a one-click "run" button on the tab-bar of any `.ts`
// file, the mouse equivalent of Cmd-Shift-R. Mirrors markdown-preview-control.js. The button
// runs the editor it belongs to (not "the active editor"), so it does the right thing even
// when focus is elsewhere.

const paneControls = require("./pane-controls.js");

// A saved TypeScript editor. `.tsv` output files don't match (they don't end in ".ts"), and
// unsaved buffers have no path.
const isAutomationEditor = (item) =>
  typeof item?.getPath === "function" &&
  !!item.getPath() &&
  item.getPath().endsWith(".ts");

// `run(editor)` runs that editor as an automation (see runAutomation in the main module).
// `isDebugging(path)` hides this button while that file is under the debugger (ADR-0025): the
// debug transport row takes over the same strip, and starting a second run of a script you are
// currently stepping through is never what was meant. The matcher is re-evaluated on every
// render, so the button returns by itself when the session ends.
function activate(run, isDebugging = () => false) {
  return paneControls.register(
    (item) => isAutomationEditor(item) && !isDebugging(item.getPath()),
    [
      {
        id: "run-automation",
        icon: "play",
        title: "Run Automation (Cmd-Shift-R)",
        action: (ctx) => run(ctx.item),
      },
    ]
  );
}

module.exports = { activate };
