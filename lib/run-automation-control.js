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
function activate(run) {
  return paneControls.register(isAutomationEditor, [
    {
      id: "run-automation",
      icon: "play",
      title: "Run Automation (Cmd-Shift-R)",
      action: (ctx) => run(ctx.item),
    },
  ]);
}

module.exports = { activate };
