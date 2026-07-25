"use babel";

// Pane control for the "Tabs" navigator (VerticalTabsView — defaults to the
// right dock), rendered by pane-controls.js into that pane's tab-bar. A single
// "Close All Tabs" button.
//
// The Tabs view mirrors the center's *active* pane, so the button closes every
// tab in that center pane — not in the dock the button lives in. We drive the
// tabs package's existing `tabs:close-all-tabs` command (tabs is Pulsar core, so
// we don't touch it) dispatched on the center pane's element, which is where the
// command is registered; it prompts to save any modified editors.
//
// Icon is a codicon name (glyph comes from tranquil-theme-icons' global font).

const { CompositeDisposable } = require("atom");
const paneControls = require("./pane-controls.js");
const VerticalTabsView = require("./vertical-tabs-view.js");

const isTabsView = (item) => item?.getURI?.() === VerticalTabsView.URI;

function closeAllCenterTabs() {
  const pane = atom.workspace.getCenter().getActivePane();
  if (!pane || !pane.getItems().length) return;
  atom.commands.dispatch(pane.getElement(), "tabs:close-all-tabs");
}

// The live Tabs view, or null.
function tabsView() {
  return atom.workspace.getPaneItems().find(isTabsView) || null;
}

// Which dock the Tabs view currently lives in ('left' | 'right'); defaults to
// 'right' (its getDefaultLocation) when it can't be resolved.
function tabsLocation() {
  const view = tabsView();
  const pane = view && atom.workspace.paneForItem(view);
  return pane ? pane.getContainer().getLocation() : "right";
}

function dockFor(location) {
  return location === "left"
    ? atom.workspace.getLeftDock()
    : atom.workspace.getRightDock();
}

// Move the Tabs view to the opposite side dock (right ⇄ left) and reveal it,
// preserving the dock width. Removing the last item resets the source dock's
// size to null (dock.js handleDidRemovePaneItem), so the target would otherwise
// fall back to the item's preferred width — noticeably narrow. Read the source
// dock's current size first and reapply it to the target after the move.
// (Dock exposes no public size getter/setter, hence the state/setState access.)
function toggleTabsDock() {
  const view = tabsView();
  if (!view) return;
  const pane = atom.workspace.paneForItem(view);
  if (!pane) return;
  const sourceLoc = pane.getContainer().getLocation();
  if (sourceLoc !== "left" && sourceLoc !== "right") return;
  const targetLoc = sourceLoc === "left" ? "right" : "left";
  const sourceDock = dockFor(sourceLoc);
  const targetDock = dockFor(targetLoc);
  const size = sourceDock && sourceDock.state ? sourceDock.state.size : null;

  const targetPane = targetDock.getActivePane();
  pane.moveItemToPane(view, targetPane, targetPane.getItems().length);
  targetDock.show();
  if (size != null && typeof targetDock.setState === "function") {
    targetDock.setState({ size });
  }
  targetPane.activateItem(view);
  targetPane.activate();
}

function activate() {
  const subscriptions = new CompositeDisposable();

  // Same action as the "Close All Tabs" pane-control button, exposed as a
  // command so it can be keybound (⌥⌘W). Acts on the center's active pane, so
  // it works regardless of which dock currently has focus.
  subscriptions.add(
    atom.commands.add("atom-workspace", {
      "tranquil-automations:close-all-center-tabs": {
        displayName: "Tabs: Close All Tabs",
        didDispatch: () => closeAllCenterTabs(),
      },
    })
  );

  subscriptions.add(
    paneControls.register(isTabsView, [
    {
      id: "tabs-toggle-dock",
      // Show the side it will move TO: sidebar-left glyph while on the right,
      // sidebar-right while on the left. Functions so the button flips after a
      // move (the source/target panes re-render on the item leaving/arriving).
      icon: () =>
        tabsLocation() === "left" ? "layout-sidebar-right" : "layout-sidebar-left",
      title: () =>
        tabsLocation() === "left"
          ? "Move Tabs to right dock"
          : "Move Tabs to left dock",
      action: () => toggleTabsDock(),
    },
    {
      id: "tabs-close-all",
      icon: "close-all",
      title: "Close All Tabs",
      action: () => closeAllCenterTabs(),
    },
    ])
  );

  return subscriptions;
}

module.exports = { activate };
