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

const paneControls = require("./pane-controls.js");
const VerticalTabsView = require("./vertical-tabs-view.js");

const isTabsView = (item) => item?.getURI?.() === VerticalTabsView.URI;

function closeAllCenterTabs() {
  const pane = atom.workspace.getCenter().getActivePane();
  if (!pane || !pane.getItems().length) return;
  atom.commands.dispatch(pane.getElement(), "tabs:close-all-tabs");
}

function activate() {
  return paneControls.register(isTabsView, [
    {
      id: "tabs-close-all",
      icon: "close-all",
      title: "Close All Tabs",
      action: () => closeAllCenterTabs(),
    },
  ]);
}

module.exports = { activate };
