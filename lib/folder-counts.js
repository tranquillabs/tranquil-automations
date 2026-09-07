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
//
// Positioning is split into a measure pass and an apply pass on purpose. Reading
// a layout value (getBoundingClientRect/offsetWidth) after writing a style forces
// the browser to recompute layout synchronously to answer the read, so the old
// read-write-read-write loop cost one full layout PER FOLDER. Measuring every
// badge first and only then writing costs one.

// Everything that is the same for every badge in one pass — measured once by
// measureAll rather than re-read per badge.
function measureContext(treeView) {
  const tvRect = treeView.getBoundingClientRect();
  // tvRect.right is the outer border-box edge, which sits behind the vertical
  // scrollbar when the tree overflows — pin badges inside it so the count never
  // overlaps the scrollbar. (offsetWidth - clientWidth is 0 with no scrollbar,
  // so this is a no-op in the non-overflow case.)
  const scrollbarWidth = treeView.offsetWidth - treeView.clientWidth;
  // A hidden (or closing) dock clips its content via the .atom-dock-mask, whose
  // width animates to 0 while the content wrapper keeps its size — but
  // position:fixed escapes that clip. Badges whose pinned spot falls outside the
  // mask's visible rect are hidden so counts don't float over the workspace.
  const mask = treeView.closest(".atom-dock-mask");
  return {
    tvRect,
    scrollbarWidth,
    maskRect: mask ? mask.getBoundingClientRect() : null,
  };
}

// Reads only. Returns the style the badge should get, without writing it.
function measureBadge(header, badge, ctx) {
  // The row's hover rename/delete buttons (row-actions.js) share this right edge;
  // yield to them so they don't overlap. Their appear/disappear mutates the
  // header, so the observer re-runs this and the badge returns on leave.
  if (header.querySelector(":scope > .tq-row-actions")) {
    return { badge, hidden: true };
  }
  const hRect = header.getBoundingClientRect();
  if (hRect.bottom <= ctx.tvRect.top || hRect.top >= ctx.tvRect.bottom) {
    return { badge, hidden: true };
  }
  const badgeWidth = badge.offsetWidth;
  const left = Math.round(
    ctx.tvRect.right - ctx.scrollbarWidth - badgeWidth - 10
  );
  const m = ctx.maskRect;
  if (
    m &&
    (hRect.bottom <= m.top ||
      hRect.top >= m.bottom ||
      left < m.left ||
      left + badgeWidth > m.right)
  ) {
    return { badge, hidden: true };
  }
  return {
    badge,
    hidden: false,
    top: Math.round(hRect.top + hRect.height / 2),
    left,
  };
}

// Writes only.
function applyBadge(plan) {
  const { badge } = plan;
  if (plan.hidden) {
    badge.style.visibility = "hidden";
    return;
  }
  badge.style.visibility = "";
  badge.style.position = "fixed";
  badge.style.right = "auto";
  badge.style.top = plan.top + "px";
  badge.style.left = plan.left + "px";
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
  // Positioning is deliberately NOT done here — refreshAll positions every badge
  // in one measure/apply pass once the content of all of them has settled.
}

function refreshAll(treeView) {
  treeView.querySelectorAll(".entry.directory").forEach(processDir);
  repositionAll(treeView);
}

// Measure every badge (reads only). Returns null when there's nothing to place.
function measureAll(treeView) {
  if (!treeView.isConnected) return null;
  const badges = treeView.querySelectorAll(".tranquil-folder-count");
  if (!badges.length) return null;
  const ctx = measureContext(treeView);
  const plans = [];
  for (const badge of badges) {
    const header = badge.closest(".header");
    if (header) plans.push(measureBadge(header, badge, ctx));
  }
  return plans;
}

// Re-pin every badge to the right edge — on scroll (horizontal keeps them at the
// edge; vertical follows the row) and on resize. Synchronous: one layout for the
// whole pass, not one per badge.
function repositionAll(treeView) {
  const plans = measureAll(treeView);
  if (plans) plans.forEach(applyBadge);
}

// Coalesced form, for the high-frequency scroll/resize path. Runs at most once per
// frame, and splits the passes across atom.views' document phases: readDocument
// callbacks run after that frame's writers, and an updateDocument queued from
// inside a reader is drained in the same frame (see performDocumentUpdate in
// src/view-registry.js) — so the badges still land this frame, not the next.
function scheduleReposition(treeView, state) {
  if (state.repositionQueued) return;
  state.repositionQueued = true;
  atom.views.readDocument(() => {
    state.repositionQueued = false;
    const plans = measureAll(treeView);
    if (plans) atom.views.updateDocument(() => plans.forEach(applyBadge));
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
  const state = { repositionQueued: false };
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
  // Capture-phase on `document` means EVERY scrollable container in the workspace
  // fires this, not just the tree-view, so it has to be coalesced to one pass per
  // frame — a scroll burst would otherwise run a full measure/apply per event.
  const onScroll = () => scheduleReposition(treeView, state);
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
