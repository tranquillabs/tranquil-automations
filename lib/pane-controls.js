"use babel";
const { CompositeDisposable, Disposable } = require("atom");

// Custom right-aligned tab-bar controls injected into the center + right-dock
// panes' existing `.tab-bar` from this owned package. The tabs package is only
// read from / appended to, never modified.
//
// A file/URI populates its own controls through the registry (`register()` —
// exposed on the package, as a service, and on the automation `tranquil` API).
// Each pane renders the items registered for its *active* item's URL; if nothing
// is registered, it falls back to the static placeholder mimics below.
//
// Right-alignment is done with `margin-left:auto` + a high flex `order`, so the
// injected node stays pinned right regardless of where the tabs package inserts
// new tab <li>s in the DOM.

const LOCATIONS = ["center", "right"];
const INJECTED_FLAG = "tranquilPaneControls"; // dataset key on the tab-bar

// Fallback visual mimics (no action) shown when nothing is registered.
const DEFAULT_ITEMS = [
  { id: "search", glyph: "⌕", title: "Search" },
  { id: "toggle-width", glyph: "⤢", title: "Toggle width" },
  { id: "favorite", glyph: "☆", title: "Favorite" },
  { id: "more", glyph: "⋯", title: "More" },
];

// Registry of { match, items }. match: url string (exact) | RegExp | (item)=>bool.
const registry = [];
// Live re-render callbacks, one per injected pane; invoked when the registry
// changes so open panes pick up new/removed registrations immediately.
const rerenderers = new Set();

// Public: register control items for panes whose active item matches. Returns a
// Disposable that unregisters. `items` is an array of
// { id, glyph, title, action? } — action(ctx) is called on click.
function register(match, items) {
  const entry = { match, items: Array.isArray(items) ? items : [items] };
  registry.push(entry);
  refreshAll();
  return new Disposable(() => {
    const i = registry.indexOf(entry);
    if (i !== -1) registry.splice(i, 1);
    refreshAll();
  });
}

function refreshAll() {
  for (const render of rerenderers) render();
}

function urlOf(item) {
  return (item && (item.getURL?.() || item.getURI?.())) || "";
}

function matchesItem(match, item, url) {
  if (typeof match === "function") {
    try {
      return !!match(item);
    } catch (e) {
      return false;
    }
  }
  if (match instanceof RegExp) return match.test(url);
  if (typeof match === "string") return url === match;
  return false;
}

function itemsForPane(pane) {
  const item = pane.getActiveItem();
  const url = urlOf(item);
  const matched = [];
  for (const entry of registry) {
    if (matchesItem(entry.match, item, url)) matched.push(...entry.items);
  }
  return matched.length ? matched : DEFAULT_ITEMS;
}

// Context handed to an item's action(ctx).
function contextFor(item, pane) {
  const webview = item && item.view && item.view.htmlv && item.view.htmlv[0];
  return {
    item,
    pane,
    webview,
    executeJavaScript: (code) =>
      webview ? webview.executeJavaScript(code) : undefined,
    dispatch: (command) =>
      atom.commands.dispatch(
        (item && atom.views.getView(item)) || pane.getElement(),
        command
      ),
  };
}

// (Re)build a pane's cluster from the registry for its current active item.
function renderCluster(pane, cluster) {
  const item = pane.getActiveItem();
  const defs = itemsForPane(pane);
  cluster.textContent = "";

  for (const def of defs) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.tabIndex = -1;
    btn.className = "tranquil-pane-controls-item";
    btn.title = def.title || "";
    btn.setAttribute("aria-label", def.title || def.id || "");
    btn.textContent = def.glyph || "";

    if (typeof def.action === "function") {
      // Wired items get the -item-action modifier (vs. static placeholders).
      btn.classList.add("tranquil-pane-controls-item-action");
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        try {
          def.action(contextFor(pane.getActiveItem(), pane));
        } catch (err) {
          console.error(
            "[tranquil-automations] pane control action failed:",
            err
          );
        }
      });
    }
    cluster.appendChild(btn);
  }

  // A closed/empty pane keeps its tab-bar; hide the cluster when there's nothing
  // to show for it.
  cluster.style.display = pane.getItems().length && defs.length ? "" : "none";
}

// Injects the cluster into a tab-bar (once) and keeps it re-rendered as the
// pane's active item changes and as the registry changes; removed on destroy.
function injectInto(tabBar, pane, disposables) {
  if (!tabBar || tabBar.dataset[INJECTED_FLAG]) return;
  tabBar.dataset[INJECTED_FLAG] = "1";
  const cluster = document.createElement("div");
  cluster.className = "tranquil-pane-controls";
  tabBar.appendChild(cluster);

  const render = () => renderCluster(pane, cluster);
  rerenderers.add(render);
  render();

  disposables.add(pane.onDidChangeActiveItem(render));
  disposables.add(pane.onDidAddItem(render));
  disposables.add(pane.onDidRemoveItem(render));
  disposables.add(
    pane.onDidDestroy(() => {
      rerenderers.delete(render);
      cluster.remove();
      delete tabBar.dataset[INJECTED_FLAG];
    })
  );
}

// The tabs package may build the `.tab-bar` after our observePanes callback
// fires, so if it's missing we watch the pane element for it to appear.
function injectWhenReady(pane, disposables) {
  const paneEl = pane.getElement();
  if (!paneEl) return;

  const existing = paneEl.querySelector(".tab-bar");
  if (existing) {
    injectInto(existing, pane, disposables);
    return;
  }

  const observer = new MutationObserver(() => {
    const tabBar = paneEl.querySelector(".tab-bar");
    if (tabBar) {
      injectInto(tabBar, pane, disposables);
      observer.disconnect();
    }
  });
  observer.observe(paneEl, { childList: true, subtree: true });
  disposables.add(new Disposable(() => observer.disconnect()));
}

// Sets up injection across the center + right containers. Returns a Disposable.
function activate() {
  const subscriptions = new CompositeDisposable();

  const containers = [
    atom.workspace.getCenter(),
    atom.workspace.getRightDock(),
  ];

  for (const container of containers) {
    subscriptions.add(
      container.observePanes((pane) => {
        if (!LOCATIONS.includes(pane.getContainer().getLocation())) return;
        injectWhenReady(pane, subscriptions);
      })
    );
  }

  // Remove injected clusters on teardown.
  subscriptions.add(
    new Disposable(() => {
      document
        .querySelectorAll(".tranquil-pane-controls")
        .forEach((el) => el.remove());
    })
  );

  return subscriptions;
}

module.exports = { activate, register };
