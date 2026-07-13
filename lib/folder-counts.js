"use babel";
const { CompositeDisposable, Disposable } = require("atom");
const fs = require("fs");
const path = require("path");

// Injects a direct-child count badge onto each COLLAPSED folder row in the
// core tree-view (which can't be modified). The count matches what the tree-view
// would show when expanded: it reads the folder from disk and applies the
// tree-view's own ignore filtering via the Directory model on the row's element
// (`el.directory`, set by tree-view's directory-view.js). Shown only while
// collapsed — expanding a folder reveals its contents, so the badge is removed.

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
  badge.style.visibility = "";
  badge.style.position = "fixed";
  badge.style.right = "auto";
  badge.style.top = Math.round(hRect.top + hRect.height / 2) + "px";
  badge.style.left = Math.round(tvRect.right - badge.offsetWidth - 8) + "px";
}

function processDir(el) {
  const header = el.querySelector(":scope > .header");
  if (!header) return;
  let badge = header.querySelector(":scope > .tranquil-folder-count");

  // "Active" = this folder is selected, or it contains the selected entry (a
  // sub-item is active). Show the count on collapsed folders and on active
  // folders (even when expanded); active folders render the count as a pill.
  const collapsed = el.classList.contains("collapsed");
  const active =
    el.classList.contains("selected") || el.querySelector(".selected") != null;
  if (!collapsed && !active) {
    if (badge) badge.remove();
    return;
  }

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
