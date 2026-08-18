"use babel";

// Tab-bar controls for the Automation Runs pane: Copy, Cancel, Clear, Revoke Permissions.
//
// Copy and Cancel used to be in-body buttons in the detail header, which meant they existed only
// while a run was selected and sat in a different place from every other control in the app. They
// are pane controls now, so the pane has one row of buttons in the same strip as everywhere else.
//
// pane-controls has no disabled state, so an action that is not currently available is a no-op
// whose tooltip says why — the same approach tranquil-debug takes for its step buttons.

const paneControls = require("./pane-controls.js");
const AutomationRunsView = require("./runs-panel.js");
const { revokeAllApprovals } = require("./consent.js");
const { notify } = require("./notify.js");

const COPY_FEEDBACK_MS = 1200;

// `icon` and `title` are invoked with no arguments, so they cannot be told which pane they are
// rendering for — only actions get a context. There is one runs panel per window, so read state
// off the live instance. Actions still prefer their own ctx.item.
function currentView() {
  for (const view of AutomationRunsView.instances) return view;
  return null;
}

function viewFor(ctx) {
  const item = ctx && ctx.item;
  return item instanceof AutomationRunsView ? item : currentView();
}

function activate() {
  let copiedUntil = 0;
  let copyTimer = null;
  const showCopied = () => {
    copiedUntil = Date.now() + COPY_FEEDBACK_MS;
    paneControls.refresh();
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => {
      copiedUntil = 0;
      paneControls.refresh();
    }, COPY_FEEDBACK_MS);
  };
  const justCopied = () => Date.now() < copiedUntil;

  const disposable = paneControls.register((item) => item instanceof AutomationRunsView, [
    {
      id: "runs-copy",
      // Glyph choices are partly about size: measured at 14px, most codicons paint 11px of ink
      // but `clippy` and `trash` reach 12 and `output` 13, so a cluster built only from 11s reads
      // smaller than its neighbours. `clippy` is also the more literal "copy to clipboard".
      icon: () => (justCopied() ? "check" : "clippy"),
      title: () => {
        if (justCopied()) return "Copied";
        const run = currentView()?.selectedRun();
        return run && run.output ? "Copy Output" : "Copy Output — nothing to copy";
      },
      action: (ctx) => {
        if (viewFor(ctx)?.copyOutput()) showCopied();
      },
    },
    {
      id: "runs-cancel",
      // `circle-slash` over `debug-stop`, which paints as a bare square and matched nothing else
      // in any cluster; same ink height, clearer as "cancel".
      icon: "circle-slash",
      // Three states, one class: pulsing green while there is something to cancel, solid green
      // with a spinner while the kill escalates, and nothing at all when the selected run has
      // already finished — so the button advertises itself only when pressing it would do
      // something. Re-evaluated per render; the refreshes that keep it honest are a run starting
      // (via the panel's selectRun), a run reaching a final state, and the click itself.
      className: () => {
        const view = currentView();
        if (view?.isCancelling()) return "runs-cancelling";
        return view?.canCancel() ? "runs-can-cancel" : "";
      },
      title: () => {
        const view = currentView();
        if (view?.isCancelling()) return "Cancelling…";
        return view?.canCancel() ? "Cancel Run" : "Cancel Run — the selected run has finished";
      },
      action: (ctx) => {
        if (viewFor(ctx)?.cancelSelected()) paneControls.refresh();
      },
    },
    {
      id: "runs-clear",
      icon: "trash",
      title: "Clear Finished Runs",
      action: (ctx) => {
        const cleared = viewFor(ctx)?.clearRuns() || 0;
        if (cleared === 0) notify("addInfo", "No finished runs to clear");
        paneControls.refresh();
      },
    },
    {
      id: "runs-revoke",
      // A closed padlock: revoking locks every script back down to needing approval. Reads as an
      // action, where a shield reads as a status.
      icon: "lock",
      title: "Revoke All Permissions",
      action: () => {
        const revoked = revokeAllApprovals();
        if (revoked === 0) return notify("addInfo", "No stored permissions to revoke");
        notify("addSuccess", `Revoked permissions for ${revoked} script${revoked === 1 ? "" : "s"}`, {
          detail: "Each will ask for approval again the next time it runs.",
        });
      },
    },
  ]);

  return {
    dispose() {
      clearTimeout(copyTimer);
      disposable.dispose();
    },
  };
}

module.exports = { activate };
