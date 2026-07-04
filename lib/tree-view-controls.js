"use babel";

// Pane controls for the tree-view (left/right dock), rendered by pane-controls.js
// into the dock's tab-bar. tree-view is a Pulsar core package we don't own, so we
// don't touch it — we just drive its existing commands from our own buttons.
//
//   New File / New Folder / Collapse All → dispatched as tree-view commands on the
//     tree-view element (see contextFor().dispatch in pane-controls.js).
//   Refresh → the active item *is* the TreeView instance; there's no command for a
//     from-disk reload, so call its updateRoots() directly.
//
// Icons are codicon names (glyphs come from tranquil-theme-icons' global font).

const paneControls = require("./pane-controls.js");

const isTreeView = (item) => item?.getURI?.() === "atom://tree-view";

function activate() {
  return paneControls.register(isTreeView, [
    {
      id: "tree-view-add-file",
      icon: "new-file",
      title: "New File",
      action: (ctx) => ctx.dispatch("tree-view:add-file"),
    },
    {
      id: "tree-view-add-folder",
      icon: "new-folder",
      title: "New Folder",
      action: (ctx) => ctx.dispatch("tree-view:add-folder"),
    },
    {
      id: "tree-view-refresh",
      icon: "refresh",
      title: "Refresh",
      action: (ctx) => ctx.item?.updateRoots?.(),
    },
    {
      id: "tree-view-collapse-all",
      icon: "collapse-all",
      title: "Collapse All",
      action: (ctx) => ctx.dispatch("tree-view:collapse-all"),
    },
  ]);
}

module.exports = { activate };
