"use babel";
const { CompositeDisposable, Disposable } = require("atom");

// Hover rename/delete buttons on tree-view rows, so those don't require the
// right-click context menu. The core tree-view can't be modified, so we inject
// our own group into the hovered row (only one row is decorated at a time).
//
// Positioning: the tree-view scrolls horizontally (rows are min-content wide, so
// long filenames run off the right edge), and rows are not flex — so neither a
// row-relative `right:` nor `position: sticky` can pin the group to the visible
// right edge. Instead the group is `position: fixed` and placed by JS from the
// tree-view's viewport rect, re-run on hover/scroll/resize. It stays a DOM child
// of the row so it inherits the row's text color and so hovering the buttons
// still counts as hovering the row.
//
// We deliberately use a delegated `mouseover` (not a MutationObserver): the group
// is added only on hover and folder-counts.js already observes+mutates the tree;
// a second observer would cross-trigger it. The buttons reuse the native
// `tree-view:rename` / `tree-view:remove` commands (rename dialog + delete
// confirmation) after selecting the row.

// Feather-style stroke icons; stroke=currentColor so CSS controls the color.
const PENCIL_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>';
const TRASH_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>';

const ACTIONS = [
  ["rename", "Rename", PENCIL_SVG, "tree-view:rename"],
  ["delete", "Delete", TRASH_SVG, "tree-view:remove"],
];

let currentWrap = null;
let currentEntry = null;

function getTreeViewInstance() {
  return (
    atom.packages.getActivePackage("tree-view")?.mainModule?.getTreeViewInstance?.() ||
    null
  );
}

// The row element the group belongs to: a directory's `.header`, or the file
// `<li>` itself. Project roots are skipped.
function rowFor(entry) {
  if (!entry || entry.classList.contains("project-root")) return null;
  return entry.classList.contains("directory")
    ? entry.querySelector(":scope > .header")
    : entry;
}

// mousedown (not click): tree-view selects on mousedown and file rows are
// draggable — stopping/preventing here keeps the click from selecting/opening
// the row or starting a drag. We select the row so the native command (which
// acts on the selection) targets it.
function onActionMouseDown(event) {
  event.preventDefault();
  event.stopPropagation();
  const treeView = getTreeViewInstance();
  if (!currentEntry || !treeView) return;
  treeView.selectEntry(currentEntry);
  atom.commands.dispatch(currentEntry, event.currentTarget.dataset.command);
}

function buildWrap() {
  const wrap = document.createElement("div");
  wrap.className = "tq-row-actions";
  for (const [action, title, svg, command] of ACTIONS) {
    const btn = document.createElement("button");
    btn.className = "tq-row-action";
    btn.dataset.action = action;
    btn.dataset.command = command;
    btn.title = title;
    btn.innerHTML = svg;
    btn.addEventListener("mousedown", onActionMouseDown);
    wrap.appendChild(btn);
  }
  return wrap;
}

// Pin the group to the tree-view's visible right edge, vertically centered on the
// row. Dismiss if the row has scrolled out of (or been detached from) the tree.
function reposition() {
  if (!currentWrap || !currentEntry) return;
  const row = rowFor(currentEntry);
  const tv = row && row.closest(".tree-view");
  if (!tv || !tv.contains(row)) return dismiss();
  const tvRect = tv.getBoundingClientRect();
  const rowRect = row.getBoundingClientRect();
  if (rowRect.bottom <= tvRect.top || rowRect.top >= tvRect.bottom) return dismiss();
  currentWrap.style.top = Math.round(rowRect.top + rowRect.height / 2) + "px";
  currentWrap.style.left =
    Math.round(tvRect.right - currentWrap.offsetWidth - 6) + "px";
}

function showFor(entry) {
  if (currentEntry === entry) return reposition();
  dismiss();
  const row = rowFor(entry);
  if (!row) return;
  currentEntry = entry;
  currentWrap = buildWrap();
  row.appendChild(currentWrap);
  // Opaque backdrop matching the tree-view's panel color (theme-agnostic — the
  // business themes don't export ui-variables) so the filename doesn't show
  // through the icons.
  const tv = row.closest(".tree-view");
  if (tv) currentWrap.style.background = getComputedStyle(tv).backgroundColor;
  reposition();
}

function dismiss() {
  if (currentWrap) currentWrap.remove();
  currentWrap = null;
  currentEntry = null;
}

// Re-evaluate on every pointer move: over a tree row (or the buttons, which are
// children of the row) → show/keep; anywhere else → dismiss.
function onMouseOver(event) {
  const entry = event.target?.closest?.(".entry.file, .entry.directory");
  if (entry && entry.closest(".tree-view")) return showFor(entry);
  dismiss();
}

function onScrollOrResize() {
  reposition();
}

// Sets up hover row-action buttons. Returns a Disposable.
function activate() {
  const subscriptions = new CompositeDisposable();

  document.addEventListener("mouseover", onMouseOver, true);
  document.addEventListener("scroll", onScrollOrResize, true);
  window.addEventListener("resize", onScrollOrResize);

  subscriptions.add(
    new Disposable(() => {
      document.removeEventListener("mouseover", onMouseOver, true);
      document.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
      dismiss();
    })
  );

  return subscriptions;
}

module.exports = { activate };
