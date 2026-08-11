"use babel";
const { CompositeDisposable, Disposable } = require("atom");
const fs = require("fs");
const path = require("path");

// Injects a direct-child count badge onto every folder row in the core
// tree-view (which can't be modified). The count reads the folder from disk and
// applies the tree-view's own ignore filtering via the Directory model on the
// row's element (`el.directory`, set by tree-view's directory-view.js). Shown on
// collapsed and expanded folders alike; selected folders render it as a pill.

const OBSERVE_OPTS = {
  subtree: true,
  childList: true,
  attributes: true,
  attributeFilter: ["class"],
};

// Direct children of a directory, filtered the same way the tree-view filters
// (hideVcsIgnoredFiles / hideIgnoredNames), via the model's isPathIgnored.
function directChildCount(model) {
  if (!model || !model.path) return 0;
  let names;
  try {
    names = fs.readdirSync(model.path);
  } catch (e) {
    return 0;
  }
  let count = 0;
  for (const name of names) {
    try {
      if (!model.isPathIgnored(path.join(model.path, name))) count++;
    } catch (e) {
      count++;
    }
  }
  return count;
}

// Pin the badge to the tree-view's visible right edge at the header's row. The
// tree-view scrolls horizontally (rows are min-content wide), so the theme's
// row-relative `right:` runs off-screen for long filenames — position:fixed +
// JS keeps it visible. Setting style (not class) doesn't trip the observer
// (attributeFilter is ['class']). Hidden (not removed) when scrolled out of view
// so it stays measurable and reappears on scroll-back.
function positionBadge(header, badge) {
  // The row's hover rename/delete buttons (row-actions.js) share this right edge;
  // yield to them so they don't overlap. Their appear/disappear mutates the
  // header, so the observer re-runs this and the badge returns on leave.
  if (header.querySelector(":scope > .tq-row-actions")) {
    badge.style.visibility = "hidden";
    return;
  }
  const tv = header.closest(".tree-view");
  if (!tv) return;
  const tvRect = tv.getBoundingClientRect();
  const hRect = header.getBoundingClientRect();
  if (hRect.bottom <= tvRect.top || hRect.top >= tvRect.bottom) {
    badge.style.visibility = "hidden";
    return;
  }
  // tvRect.right is the outer border-box edge, which sits behind the vertical
  // scrollbar when the tree overflows — pin the badge inside it so the count
  // never overlaps the scrollbar. (offsetWidth - clientWidth is 0 with no
  // scrollbar, so this is a no-op in the non-overflow case.)
  const scrollbarWidth = tv.offsetWidth - tv.clientWidth;
  const left = Math.round(
    tvRect.right - scrollbarWidth - badge.offsetWidth - 10
  );
  // A hidden (or closing) dock clips its content via the .atom-dock-mask, whose
  // width animates to 0 while the content wrapper keeps its size — but
  // position:fixed escapes that clip. Hide the badge whenever its pinned spot
  // falls outside the mask's visible rect so counts don't float over the
  // workspace.
  const mask = tv.closest(".atom-dock-mask");
  if (mask) {
    const mRect = mask.getBoundingClientRect();
    if (
      hRect.bottom <= mRect.top ||
      hRect.top >= mRect.bottom ||
      left < mRect.left ||
      left + badge.offsetWidth > mRect.right
    ) {
      badge.style.visibility = "hidden";
      return;
    }
  }
  badge.style.visibility = "";
  badge.style.position = "fixed";
  badge.style.right = "auto";
  badge.style.top = Math.round(hRect.top + hRect.height / 2) + "px";
  badge.style.left = left + "px";
}

function processDir(el) {
  const header = el.querySelector(":scope > .header");
  if (!header) return;
  let badge = header.querySelector(":scope > .tranquil-folder-count");

  // "Active" = this folder is selected, or it contains the selected entry (a
  // sub-item is active). The count shows on every folder with children —
  // collapsed or expanded, selected or not — and active folders render it as a
  // pill (plain count otherwise).
  const active =
    el.classList.contains("selected") || el.querySelector(".selected") != null;

  const count = directChildCount(el.directory);
  if (count <= 0) {
    if (badge) badge.remove();
    return;
  }

  if (!badge) {
    badge = document.createElement("span");
    badge.className = "tranquil-folder-count";
    header.appendChild(badge);
  }
  badge.classList.toggle("is-pill", active);
  const text = String(count);
  if (badge.textContent !== text) badge.textContent = text;
  positionBadge(header, badge);
}

function refreshAll(treeView) {
  treeView.querySelectorAll(".entry.directory").forEach(processDir);
}

// Re-pin every badge to the right edge — on scroll (horizontal keeps them at the
// edge; vertical follows the row) and on resize.
function repositionAll(treeView) {
  treeView.querySelectorAll(".tranquil-folder-count").forEach((badge) => {
    const header = badge.closest(".header");
    if (header) positionBadge(header, badge);
  });
}

// The position:fixed badges (and the hover row-actions) promote the tree-view to
// a composited layer that Chromium leaves stale when the dock is drag-resized or
// re-rendered — rows/badges don't re-raster until a full repaint (what toggling
// DevTools forces). Toggling an identity transform for one frame invalidates the
// layer so it re-rasters at the current geometry; we clear it and re-pin the
// badges next frame. translateZ(0) is visually a no-op for the rows (it only
// reparents the fixed badges for that single frame, hence the re-pin after).
function forceRepaint(treeView) {
  treeView.style.transform = "translateZ(0)";
  requestAnimationFrame(() => {
    treeView.style.transform = "";
    repositionAll(treeView);
  });
}

function attach(treeView, subscriptions) {
  let observer;
  let queued = false;
  const refresh = () => {
    queued = false;
    // Detach while we mutate so our own badge writes don't retrigger us.
    observer.disconnect();
    refreshAll(treeView);
    observer.observe(treeView, OBSERVE_OPTS);
  };
  observer = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(refresh);
  });

  refreshAll(treeView);
  observer.observe(treeView, OBSERVE_OPTS);
  subscriptions.add(new Disposable(() => observer.disconnect()));

  // Keep badges pinned to the visible right edge as the tree scrolls/resizes.
  const onScroll = () => repositionAll(treeView);
  document.addEventListener("scroll", onScroll, true);
  window.addEventListener("resize", onScroll);
  subscriptions.add(
    new Disposable(() => {
      document.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    })
  );

  // A dock drag-resize changes the tree-view's size without firing window
  // 'resize', so watch the element itself: re-pin the badges and force the
  // (stale) composited layer to re-raster so the rows redraw at the new width.
  const resizeObserver = new ResizeObserver(() => forceRepaint(treeView));
  resizeObserver.observe(treeView);
  // Hiding/showing the dock resizes only the .atom-dock-mask (the content
  // wrapper — and the tree-view — keep their size), so watch the mask too:
  // repositioning as it animates hides the badges once they'd overflow it.
  const mask = treeView.closest(".atom-dock-mask");
  if (mask) resizeObserver.observe(mask);
  subscriptions.add(new Disposable(() => resizeObserver.disconnect()));

  // Closing tabs (e.g. the Close All Tabs control) re-renders the tree-view
  // selection; the same stale-layer bug drops the badges until a repaint. Nudge
  // on item removal in the center so they come back without a DevTools toggle.
  const center = atom.workspace.getCenter();
  subscriptions.add(
    center.observePanes((pane) => {
      subscriptions.add(pane.onDidRemoveItem(() => forceRepaint(treeView)));
    })
  );
}

// Sets up folder-count badges. Returns a Disposable.
function activate() {
  const subscriptions = new CompositeDisposable();

  const tryAttach = () => {
    const treeView = document.querySelector(".tree-view");
    if (treeView) {
      attach(treeView, subscriptions);
      return true;
    }
    return false;
  };

  // The tree-view may not be in the DOM yet at activation — watch for it.
  if (!tryAttach()) {
    const bodyObserver = new MutationObserver(() => {
      if (tryAttach()) bodyObserver.disconnect();
    });
    bodyObserver.observe(document.body, { childList: true, subtree: true });
    subscriptions.add(new Disposable(() => bodyObserver.disconnect()));
  }

  subscriptions.add(
    new Disposable(() => {
      document
        .querySelectorAll(".tranquil-folder-count")
        .forEach((el) => el.remove());
    })
  );

  return subscriptions;
}

module.exports = { activate };
