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

function processDir(el) {
  const header = el.querySelector(":scope > .header");
  if (!header) return;
  let badge = header.querySelector(":scope > .tranquil-folder-count");

  // Show the count on collapsed folders, and on the selected folder even when
  // expanded (the active folder keeps its count, styled as a pill).
  const show =
    el.classList.contains("collapsed") || el.classList.contains("selected");
  if (!show) {
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
  const text = String(count);
  if (badge.textContent !== text) badge.textContent = text;
}

function refreshAll(treeView) {
  treeView.querySelectorAll(".entry.directory").forEach(processDir);
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
