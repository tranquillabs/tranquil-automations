"use babel";

// Pane controls for automation editors: a one-click "run" button on the tab-bar of any `.ts`
// file, the mouse equivalent of Cmd-Shift-R, plus a toggle for the Automation Runs panel.
// Mirrors markdown-preview-control.js. The run button runs the editor it belongs to (not "the
// active editor"), so it does the right thing even when focus is elsewhere.

const { CompositeDisposable } = require("atom");
const paneControls = require("./pane-controls.js");

// A saved TypeScript editor. `.tsv` output files don't match (they don't end in ".ts"), and
// unsaved buffers have no path.
const isAutomationEditor = (item) =>
  typeof item?.getPath === "function" &&
  !!item.getPath() &&
  item.getPath().endsWith(".ts");

// `run(editor)` runs that editor as an automation (see runAutomation in the main module).
//
// `isDebugging(path)` hides this button while that file is under the debugger (ADR-0025). Clicking
// Run mid-session would spawn a SECOND Deno child for the same script — an ordinary run alongside
// the paused one, both driving the same browser tab — so there is no sensible thing for the click
// to do. The transport row takes over the same strip instead.
//
// The matcher is re-evaluated on every render, so the button returns by itself when the session
// ends. That return is only as reliable as `isDebugging()`, which is why it is answered from live
// child processes rather than from a record's `state` field — see RunManager.isDebugging.
function activate(run, isDebugging = () => false) {
  const subscriptions = new CompositeDisposable();

  subscriptions.add(
    paneControls.register(
      (item) => isAutomationEditor(item) && !isDebugging(item.getPath()),
      [
        {
          id: "run-automation",
          icon: "play",
          title: "Run Automation (Cmd-Shift-R)",
          action: (ctx) => run(ctx.item),
        },
      ]
    )
  );

  // The runs panel is where a script's output and its stack traces land, so this stays reachable
  // during a debug session too. Registration order is render order, so it sits right of Run.
  subscriptions.add(
    paneControls.register(isAutomationEditor, [
      {
        id: "toggle-runs-panel",
        icon: "output",
        title: "Toggle Runs Panel",
        // Dispatched at the workspace element, where the command is registered — not at the
        // editor, whose own element would work only by bubbling.
        action: () =>
          atom.commands.dispatch(
            atom.views.getView(atom.workspace),
            "tranquil-automations:toggle-runs-panel"
          ),
      },
    ])
  );

  return subscriptions;
}

module.exports = { activate };
