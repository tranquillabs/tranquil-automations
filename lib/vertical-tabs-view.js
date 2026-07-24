"use babel";
const { CompositeDisposable, Disposable, Emitter } = require("atom");

// A webview's getTitle() returns the page URL — sans scheme and trailing slash —
// while the page is mid-load or has no <title>. Detect that so we don't mistake
// it for a real title (and cache it): compare scheme/slash-normalized.
function sameAsUrl(candidate, url) {
  if (!candidate || !url) return false;
  const norm = (value) =>
    String(value)
      .trim()
      .replace(/^[a-z][a-z0-9+.-]*:\/\//i, "")
      .replace(/\/+$/, "")
      .toLowerCase();
  return norm(candidate) === norm(url);
}

// A right-dock panel that mirrors the main (center) view's open tabs as a
// vertical list. Clicking a row activates that tab in the center pane; content
// stays in the center — this is a navigator, not a second editor. It reflects
// the center's *active* pane (so with a split, it follows the focused side).
//
// Implemented as a plain workspace item: getDefaultLocation() puts it in the
// right dock, getURI()/serialize() let it dedupe and restore across reloads.
class VerticalTabsView {
  constructor(state) {
    this.emitter = new Emitter();
    this.disposables = new CompositeDisposable();
    // Last-known real page title per item URI, persisted in serialize(). Lets a
    // restored browser tab show its saved <title> immediately, before its
    // webview re-navigates (until then getTitle()/the webview report the URL).
    // Drop any entry that is really just the URL (self-heals a poisoned cache;
    // the key is the item URI, which for browser tabs is the URL).
    this.titleCache = new Map();
    for (const [uri, title] of Object.entries((state && state.titles) || {})) {
      if (title && !sameAsUrl(title, uri)) this.titleCache.set(uri, title);
    }
    // Subscriptions tied to the currently-watched center pane; replaced whenever
    // the active center pane changes.
    this.paneSubs = new CompositeDisposable();
    // Per-item title/modified subscriptions; rebuilt on every render.
    this.itemSubs = new CompositeDisposable();

    // Track live instances so a late-arriving file-icons service can re-render.
    VerticalTabsView.instances.add(this);

    this.element = document.createElement("div");
    this.element.classList.add("tranquil-vertical-tabs");
    this.element.tabIndex = -1;

    this.list = document.createElement("ul");
    this.list.classList.add("tranquil-vertical-tabs-list");
    this.element.appendChild(this.list);

    const center = atom.workspace.getCenter();
    // Follow the center's active pane; re-watch it and re-render on change.
    this.disposables.add(
      center.observeActivePane((pane) => {
        this.watchPane(pane);
        this.render();
      })
    );

    // A dock drag-resize changes this panel's width without triggering render(),
    // and the stale composited scroll layer keeps its old width. Re-raster on any
    // size change so the panel tracks the dock width.
    this.resizeObserver = new ResizeObserver(() => this.forceRepaint());
    this.resizeObserver.observe(this.element);
  }

  // (Re)subscribe to the pane whose tabs we mirror.
  watchPane(pane) {
    this.paneSubs.dispose();
    this.paneSubs = new CompositeDisposable();
    if (!pane) return;
    const rerender = () => this.render();
    // A new tab (e.g. cmd-click a link, opening a background browser tab) is
    // appended at the bottom. Re-render, then reveal it so the user sees the
    // list grow rather than the new row landing off-screen below the fold.
    this.paneSubs.add(
      pane.onDidAddItem(() => {
        this.render();
        this.scrollToBottom();
      })
    );
    this.paneSubs.add(pane.onDidRemoveItem(rerender));
    this.paneSubs.add(pane.onDidMoveItem(rerender));
    this.paneSubs.add(pane.onDidChangeActiveItem(rerender));
  }

  render() {
    this.itemSubs.dispose();
    this.itemSubs = new CompositeDisposable();
    this.list.innerHTML = "";

    const pane = atom.workspace.getCenter().getActivePane();
    if (!pane) return;
    const activeItem = pane.getActiveItem();

    for (const item of pane.getItems()) {
      // Don't list ourselves if we ever end up in the center.
      if (item === this) continue;

      const row = document.createElement("li");
      row.classList.add("tranquil-vertical-tab");
      if (item === activeItem) row.classList.add("active");
      if (typeof item.isModified === "function" && item.isModified()) {
        row.classList.add("modified");
      }

      // Icon slot (fixed size so labels align whether or not an icon shows).
      // Browser tabs → the page favicon (item.favIcon). Other items → the
      // tree-view file icon via the atom.file-icons service (tranquil-theme-icons),
      // which returns an octicon class that renders globally.
      const icon = document.createElement("span");
      icon.classList.add("tab-icon");
      if (typeof item.getURL === "function") {
        if (item.favIcon) {
          const img = document.createElement("img");
          img.src = item.favIcon;
          img.onerror = () => img.remove();
          icon.appendChild(img);
        }
      } else {
        const service = VerticalTabsView.fileIconService;
        const filePath =
          typeof item.getPath === "function" ? item.getPath() : null;
        if (service && filePath) {
          let names = service.iconClassForPath(filePath, "tranquil-vertical-tabs");
          names = Array.isArray(names) ? names : String(names || "").split(/\s+/);
          const classes = names.filter(Boolean);
          if (classes.length) icon.classList.add("icon", ...classes);
        }
      }
      row.appendChild(icon);

      const title = document.createElement("span");
      title.classList.add("title");
      title.textContent = this.labelFor(item);
      title.title = title.textContent;
      row.appendChild(title);

      const close = document.createElement("button");
      close.classList.add("close");
      close.setAttribute("aria-label", "Close tab");
      close.addEventListener("mousedown", (event) => {
        // mousedown + stopPropagation so the row's click (activate) never fires.
        event.preventDefault();
        event.stopPropagation();
        pane.destroyItem(item);
      });
      row.appendChild(close);

      row.addEventListener("click", () => {
        pane.activateItem(item);
        pane.activate();
      });

      const rerender = () => this.render();
      // Title/modified can arrive via Atom-style methods (editors) or the legacy
      // theorist events (browser tabs — HTMLEditor extends theorist Model and
      // emits 'title-changed'/'modified-status-changed'). Bind whichever exists,
      // exactly as the tabs package does, so browser tabs show their page title
      // rather than the URL once it loads.
      this.bindItemEvent(item, "onDidChangeTitle", "title-changed", rerender);
      this.bindItemEvent(
        item,
        "onDidChangeModified",
        "modified-status-changed",
        rerender
      );
      // Favicon updates: browser tabs emit the legacy 'icon-changed'.
      this.bindItemEvent(item, "onDidChangeIcon", "icon-changed", rerender);

      this.list.appendChild(row);
    }

    // Once the list overflows, `overflow-y: auto` promotes this panel to its own
    // composited scroll layer that Chromium leaves stale on width changes (dock
    // resize / reload) and re-renders — the panel keeps its old width and the
    // center pane bleeds through the gap. Nudge the layer to re-raster.
    this.forceRepaint();
  }

  // Row label. For browser tabs, read the live page <title> straight off the
  // guest <webview> (item.view.htmlv[0].getTitle() === document.title) — full
  // and current, whereas the model's getTitle() truncates and falls back to the
  // URL. A real title is cached per URI (and persisted) so a restored, not-yet-
  // loaded tab shows its saved title instead of the URL. Editors and everything
  // else use their getTitle().
  labelFor(item) {
    const uri = typeof item.getURI === "function" ? item.getURI() : null;
    const url = typeof item.getURL === "function" ? item.getURL() : null;
    const webview =
      item && item.view && item.view.htmlv && item.view.htmlv[0];
    if (webview && typeof webview.getTitle === "function") {
      try {
        const title = webview.getTitle();
        // Trust it only if it's a real page title, not the URL the webview
        // reports (sans scheme) before/around navigation. Cache real titles.
        if (title && title.trim() && !sameAsUrl(title, url)) {
          if (uri) this.titleCache.set(uri, title);
          return title;
        }
      } catch (e) {
        // webview not attached yet — fall through.
      }
    }
    if (uri && this.titleCache.has(uri)) return this.titleCache.get(uri);
    if (typeof item.getTitle === "function") {
      const title = item.getTitle();
      if (title) return title;
    }
    return "untitled";
  }

  // Subscribe to an item change via the Atom-style method if present, else the
  // legacy theorist `.on(event)`/`.off(event)` pair. Cleanup is added to
  // itemSubs (rebuilt each render).
  bindItemEvent(item, atomMethod, legacyEvent, callback) {
    if (typeof item[atomMethod] === "function") {
      const disposable = item[atomMethod](callback);
      if (disposable && typeof disposable.dispose === "function") {
        this.itemSubs.add(disposable);
        return;
      }
    }
    if (typeof item.on === "function") {
      item.on(legacyEvent, callback);
      this.itemSubs.add(
        new Disposable(() => {
          if (typeof item.off === "function") item.off(legacyEvent, callback);
        })
      );
    }
  }

  // Toggle an identity transform for one frame to invalidate this panel's
  // composited scroll layer so it re-rasters at its current width/scroll offset.
  // Visually a no-op; the only defense against the stale-layer bleed-through that
  // Chromium leaves when a scrollable panel is resized or re-rendered (mirrors
  // folder-counts.js forceRepaint). Called from render() and the ResizeObserver.
  forceRepaint() {
    this.element.style.transform = "translateZ(0)";
    requestAnimationFrame(() => {
      this.element.style.transform = "";
    });
  }

  // Scroll the list to reveal the last (newest) row. Only meaningful once the
  // list overflows; a no-op otherwise. render() rebuilds synchronously, so
  // scrollHeight already reflects the freshly appended row.
  scrollToBottom() {
    this.element.scrollTop = this.element.scrollHeight;
  }

  // --- Workspace item contract ---------------------------------------------

  getElement() {
    return this.element;
  }

  getTitle() {
    return "Tabs";
  }

  getURI() {
    return VerticalTabsView.URI;
  }

  getIconName() {
    return "list-unordered";
  }

  getDefaultLocation() {
    return "right";
  }

  // Right dock is only the default — the panel can be dragged to any dock or the
  // center. Returning every location (rather than restricting) is what lets the
  // tabs package move it there on tab drag.
  getAllowedLocations() {
    return ["center", "left", "right", "bottom"];
  }

  getPreferredWidth() {
    return 220;
  }

  getPreferredHeight() {
    return 150;
  }

  serialize() {
    // Persist last-known titles (pruned to the tabs currently open) so restored
    // browser tabs show their page title before their webview reloads.
    const titles = {};
    const pane = atom.workspace.getCenter().getActivePane();
    for (const item of pane ? pane.getItems() : []) {
      const uri = typeof item.getURI === "function" ? item.getURI() : null;
      if (uri && this.titleCache.has(uri)) titles[uri] = this.titleCache.get(uri);
    }
    return { deserializer: VerticalTabsView.DESERIALIZER, titles };
  }

  onDidDestroy(callback) {
    return this.emitter.on("did-destroy", callback);
  }

  destroy() {
    VerticalTabsView.instances.delete(this);
    if (this.resizeObserver) this.resizeObserver.disconnect();
    this.disposables.dispose();
    this.paneSubs.dispose();
    this.itemSubs.dispose();
    this.element.remove();
    this.emitter.emit("did-destroy");
    this.emitter.dispose();
  }
}

VerticalTabsView.URI = "tranquil-automations://vertical-tabs";
VerticalTabsView.DESERIALIZER = "TranquilVerticalTabsView";

// Live instances + the shared atom.file-icons service (tranquil-theme-icons).
// The service is consumed in the package main module and may arrive after a
// panel is built, so re-render any open panels when it (re)sets.
VerticalTabsView.instances = new Set();
VerticalTabsView.fileIconService = null;
VerticalTabsView.setFileIconService = function (service) {
  VerticalTabsView.fileIconService = service || null;
  for (const view of VerticalTabsView.instances) view.render();
};

module.exports = VerticalTabsView;
