"use babel";

// Host capabilities served to the runner principal (ADR-0022 specific 6) — registered with
// { audience: ["runner"] } so webview guests never see them. The control plane lives here
// (which tab is active, open/close tab, notify, open-in-editor), answered from the workspace
// model; the data plane (evaluate/navigate/screenshot) is direct CDP from the Deno child.
//
// Tab identity: each handle is minted with a nonce the host stamps into the page
// (window.__tqTab); the child resolves it to a CDP targetId once, then holds that socket —
// identity survives navigation, URL matching is only the initial-lookup convenience.
//
// RpcTarget MUST come from tranquil-rpc (capnweb detects capabilities via instanceof against
// the exact class bundled into the host runtime) — same rule as pane-controls-capability.js.
const crypto = require("crypto");
const { setting } = require("./settings.js");
const path = require("path");
const { Disposable } = require("atom");
const { RpcTarget } = require("tranquil-rpc");
const { callInPage } = require("./call-in-page.js");
const { escapeMarkdown, notify } = require("./notify.js");
const { isWebURL, webviewOf, windowPartition } = require("./browser-pages.js");

// The shapes this file works with: its own in types/runner-capabilities.ts, the browser's tabs in
// types/browser-pages.ts, and tranquil-rpc's in tranquil-rpc's own declarations.
/** @typedef {import("../types/browser-pages.ts").Webview} Webview */
/** @typedef {import("../types/browser-pages.ts").BrowserItem} BrowserItem */
/** @typedef {import("../types/runner-capabilities.ts").EditorItem} EditorItem */
/** @typedef {import("../types/runner-capabilities.ts").TabEntry} TabEntry */
/** @typedef {import("../types/runner-capabilities.ts").TabDescriptor} TabDescriptor */
/** @typedef {import("../types/runner-capabilities.ts").OpenOptions} OpenOptions */
/** @typedef {import("../types/runner-capabilities.ts").PaneLocation} PaneLocation */
/** @typedef {import("../types/runner-capabilities.ts").TabQuery} TabQuery */
/** @typedef {import("../types/runner-capabilities.ts").RunsLike} RunsLike */
/** @typedef {import("tranquil-rpc").RunnerContext} RunnerContext */
/** @typedef {import("tranquil-rpc").RunnerCapabilityOptions} RunnerCapabilityOptions */

const BACKGROUND_CAP = 4;
const OPEN_TIMEOUT_MS = 15000;
// Where a tab may be opened. The left dock is deliberately absent: that is the tree-view's, and
// the browser model's getAllowedLocations() excludes it for the same reason.
/** @type {readonly string[]} */
const PANE_LOCATIONS = ["center", "right", "bottom"];
/**
 * @param {string} location as a script sent it
 * @returns {location is PaneLocation}
 */
const isPaneLocation = (location) => PANE_LOCATIONS.includes(location);
/** @type {Readonly<Record<string, string>>} */
const NOTIFY_KINDS = { info: "addInfo", success: "addSuccess", warning: "addWarning", error: "addError" };

/** @type {Webview | null} */
let lastWebView = null; // most-recent browser webview (see observer at the bottom)

/** @param {string} message */
function userError(message) {
  return Object.assign(new Error(message), { userFacing: true });
}

// Stamps a handle's nonce into the page, so the script finds this tab's CDP target by it. It runs
// in the page (callInPage sends its source), so it may use nothing from this file.
/** @param {string} nonce */
function stampTab(nonce) {
  /** @type {Window & { __tqTab?: string }} */ (window).__tqTab = nonce;
}

/**
 * Wait until a webview can execute script (attached + current load finished).
 * @param {Webview} webview
 * @param {number} [timeoutMs]
 * @returns {Promise<Webview>}
 */
function whenLoaded(webview, timeoutMs = OPEN_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const t0 = Date.now();
    const poll = () => {
      let ready = false;
      try {
        webview.getWebContentsId();
        ready = !webview.isLoading();
      } catch (e) {
        ready = false;
      }
      if (ready) return resolve(webview);
      if (Date.now() - t0 > timeoutMs) return reject(userError("Tab did not finish loading"));
      setTimeout(poll, 100);
    };
    poll();
  });
}

// tabs — handle minting and host-side tab lifecycle. One instance per run session; handles
// die with the session (ctx.subscriptions), which also reclaims background webviews.
class TabsCap extends RpcTarget {
  /** @param {RunnerContext} ctx */
  constructor(ctx) {
    super();
    this.ctx = ctx;
    /** @type {Map<string, TabEntry>} */
    this.handles = new Map(); // tabId → { webview, background, item }
    /** @type {(() => void)[]} */
    this.backgroundQueue = [];
    this.backgroundLive = 0;
    ctx.subscriptions.add(
      new Disposable(() => {
        for (const { webview, background } of this.handles.values()) {
          if (background) webview.remove();
        }
        this.handles.clear();
      })
    );
  }

  /**
   * @param {Webview} webview
   * @param {{ background?: boolean, item?: BrowserItem | null }} [options]
   * @returns {Promise<TabDescriptor>}
   */
  async _mint(webview, { background = false, item = null } = {}) {
    await whenLoaded(webview);
    const tabId = crypto.randomBytes(8).toString("hex");
    const nonce = crypto.randomBytes(16).toString("hex");
    await callInPage(webview, stampTab, nonce);
    this.handles.set(tabId, { webview, background, item });
    return { tabId, url: webview.getURL(), nonce };
  }

  /**
   * @param {string} tabId
   * @returns {TabEntry}
   */
  _entry(tabId) {
    const entry = this.handles.get(tabId);
    if (!entry) throw userError("Unknown tab handle (tab closed?)");
    return entry;
  }

  /** @returns {{ webview: Webview, item: BrowserItem }[]} */
  _paneWebviews() {
    /** @type {{ webview: Webview, item: BrowserItem }[]} */
    const out = [];
    for (const item of atom.workspace.getPaneItems()) {
      const webview = webviewOf(item);
      if (webview) out.push({ webview, item: /** @type {BrowserItem} */ (item) });
    }
    return out;
  }

  /**
   * The pane item showing a handle's webview: the one it was minted with, else found again.
   * @param {TabEntry} entry
   * @returns {BrowserItem | undefined}
   */
  _itemOf(entry) {
    if (entry.item) return entry.item;
    const found = atom.workspace.getPaneItems().find((it) => webviewOf(it) === entry.webview);
    return /** @type {BrowserItem | undefined} */ (found);
  }

  // The tab the user is looking at: the browser tab in front, else the last one that was. With
  // neither, it fails rather than opening one. A new tab would come to the front, taking the
  // window from whatever the person was using (a workbook, say), and it would land on the start
  // page, which no script may read (deno/guard.ts).
  /** @returns {Promise<TabDescriptor>} */
  async active() {
    const activeItem = atom.workspace.getActivePaneItem();
    const webview = webviewOf(activeItem) || lastWebView;
    if (webview && webview.isConnected) return this._mint(webview);
    throw userError(
      "tabs.active(): there is no current page, since no open browser tab has been in front since " +
        "the window loaded. Click the page's tab before running the script, or have the script " +
        "open its site with tabs.open(url)."
    );
  }

  // query: a full URL string, or { regex, flags } for pattern matching. Web tabs only, as in
  // all(): local files and the browser's own pages are never a script's (deno/guard.ts).
  /**
   * @param {TabQuery} query
   * @returns {Promise<TabDescriptor>}
   */
  async find(query) {
    /** @type {(url: string) => boolean} */
    const matches =
      typeof query === "string"
        ? (url) => url === query
        : (url) => new RegExp(query.regex, query.flags || "").test(url);
    for (const { webview, item } of this._paneWebviews()) {
      let url;
      try {
        url = webview.getURL();
      } catch (e) {
        continue;
      }
      if (isWebURL(url) && matches(url)) return this._mint(webview, { item });
    }
    throw userError(
      `No open tab matches ${typeof query === "string" ? query : `/${query.regex}/`}`
    );
  }

  /** @returns {Promise<TabDescriptor[]>} */
  async all() {
    /** @type {TabDescriptor[]} */
    const out = [];
    for (const { webview, item } of this._paneWebviews()) {
      try {
        if (isWebURL(webview.getURL())) out.push(await this._mint(webview, { item }));
      } catch (e) {
        /* skip detached */
      }
    }
    return out;
  }

  /**
   * @param {string} url
   * @param {OpenOptions} [options] location: "center", "right" or "bottom"
   * @returns {Promise<TabDescriptor>}
   */
  async open(url, options) {
    if (!url) throw userError("tabs.open requires a url");
    const opts = options || {};
    const background = !!opts.background;
    if (!background) {
      const location = opts.location;
      if (location && !isPaneLocation(location)) {
        throw userError(
          `Unknown tab location "${location}" — use ${PANE_LOCATIONS.join(", ")}`
        );
      }
      /** @type {{ location?: PaneLocation, activatePane?: boolean, hideURLBar?: boolean }} */
      const openOptions = {};
      // The workspace filters `location` through the item's own getAllowedLocations(), and the
      // browser model allows center/right/bottom — so a location it rejects lands in the center
      // rather than failing, which is the forgiving behavior we want here.
      if (location && isPaneLocation(location)) openOptions.location = location;
      // activate:false leaves focus where the user put it (open a panel beside their work without
      // yanking the cursor out of it).
      if (opts.activate === false) openOptions.activatePane = false;
      // The opener hands its whole options object to the browser model as `opt`, and the view
      // reads opt.hideURLBar — so this both hides the bar now and survives a window reload,
      // because the model serializes the flag.
      if (opts.hideURLBar) openOptions.hideURLBar = true;
      const opened = await atom.workspace.open(url, openOptions);
      // A dock only reveals itself as a side effect of activating its pane, so an unactivated
      // open into one is invisible until the user drags the dock out. Show it explicitly.
      const container = opened && atom.workspace.paneContainerForItem(opened);
      if (container && "show" in container) container.show(); // a dock; the center has no show()
      // The opener created (or focused) a browser item; find its webview by URL.
      const t0 = Date.now();
      for (;;) {
        for (const { webview, item } of this._paneWebviews()) {
          try {
            if (webview.getURL() === url) return await this._mint(webview, { item });
          } catch (e) {
            /* not attached yet */
          }
        }
        if (Date.now() - t0 > OPEN_TIMEOUT_MS) throw userError(`Tab for ${url} did not appear`);
        await new Promise((r) => setTimeout(r, 100));
      }
    }

    // Background: an off-screen <webview> (Electron CDP lacks Target.createTarget), capped at
    // BACKGROUND_CAP concurrent with a FIFO queue, inheriting this window's session partition
    // so authenticated flows work.
    await /** @type {Promise<void>} */ (
      new Promise((resolve) => {
        if (this.backgroundLive < BACKGROUND_CAP) {
          this.backgroundLive++;
          resolve();
        } else {
          this.backgroundQueue.push(resolve);
        }
      })
    );
    const webview = /** @type {HTMLElement & Webview} */ (document.createElement("webview"));
    const partition = windowPartition();
    if (partition) webview.setAttribute("partition", partition); // must precede src
    webview.setAttribute("src", url);
    webview.style.cssText = "position:absolute;left:-10000px;top:0;width:1024px;height:768px;";
    document.body.appendChild(webview);
    try {
      return await this._mint(webview, { background });
    } catch (e) {
      this._releaseBackground(webview);
      throw e;
    }
  }

  /** @param {Webview} webview */
  _releaseBackground(webview) {
    webview.remove();
    this.backgroundLive--;
    const next = this.backgroundQueue.shift();
    if (next) {
      this.backgroundLive++;
      next();
    }
  }

  /** @param {string} tabId */
  async close(tabId) {
    const entry = this._entry(tabId);
    this.handles.delete(tabId);
    if (entry.background) {
      this._releaseBackground(entry.webview);
      return;
    }
    const item = this._itemOf(entry);
    if (item) {
      const pane = atom.workspace.paneForItem(item);
      if (pane) pane.destroyItem(item);
    }
  }

  /** @param {string} tabId */
  async url(tabId) {
    return this._entry(tabId).webview.getURL();
  }

  // Give the tab's <webview> host-level focus. CDP keyboard input (Input.insertText,
  // Input.dispatchKeyEvent) is routed to whichever frame tree has window focus, and is silently
  // dropped when that is a host element rather than this guest (ADR-0026 spike). Focusing the
  // element is enough; it also brings the window forward on macOS.
  /** @param {string} tabId */
  async focus(tabId) {
    const { webview } = this._entry(tabId);
    webview.focus();
    return true;
  }

  // Re-stamp the identity nonce after the guest document was replaced. A reload creates a new
  // CDP target for the same <webview> element (ADR-0026 spike), so the script side re-resolves
  // the handle by nonce and needs a fresh one in the new document.
  /**
   * @param {string} tabId
   * @returns {Promise<TabDescriptor>}
   */
  async restamp(tabId) {
    const { webview } = this._entry(tabId);
    await whenLoaded(webview);
    const nonce = crypto.randomBytes(16).toString("hex");
    await callInPage(webview, stampTab, nonce);
    return { tabId, url: webview.getURL(), nonce };
  }

  // Hide or show a tab's address bar after the fact. `hidden` null means flip. The open-time
  // option only reaches the view when it is built, so this is the same flag applied live: the
  // class the view stamps on its `urlbar` outlet, plus the model's own copy so the state
  // survives serialization (a reloaded window rebuilds the view from opt).
  /**
   * @param {string} tabId
   * @param {boolean | null} [hidden]
   * @returns {Promise<boolean>}
   */
  async setURLBarHidden(tabId, hidden) {
    const item = this._itemOf(this._entry(tabId));
    const bar = item && item.view && item.view.urlbar;
    const element = bar && ("classList" in bar ? bar : bar[0]); // space-pen outlets are jQuery-wrapped
    if (!item || !element || !element.classList) throw userError("That tab has no address bar");
    const next = hidden === null || hidden === undefined
      ? !element.classList.contains("hideURLBar")
      : !!hidden;
    element.classList.toggle("hideURLBar", next);
    item.opt = item.opt || {};
    item.opt.hideURLBar = next;
    return next;
  }

  // Screenshots go through the host, not CDP: Electron's CDP cannot captureScreenshot a
  // <webview> guest (verified — times out even for visible tabs, an OOPIF-family limit).
  // capturePage() on the element works. Returns base64 PNG.
  /**
   * @param {string} tabId
   * @returns {Promise<string>}
   */
  async screenshot(tabId) {
    const { webview } = this._entry(tabId);
    const image = await webview.capturePage();
    return image.toPNG().toString("base64");
  }
}

class UiCap extends RpcTarget {
  /**
   * @param {RunnerContext} ctx
   * @param {RunsLike} runs
   */
  constructor(ctx, runs) {
    super();
    this.ctx = ctx;
    this.runs = runs;
  }

  /**
   * @param {string} filePath
   * @param {{ split?: "left" | "right" | "up" | "down" }} [options]
   */
  async open(filePath, options) {
    const opts = options || {};
    const abs = path.resolve(filePath);
    // Already open → refresh from disk and reveal in place (same UX as the old runner).
    const items = /** @type {EditorItem[]} */ (atom.workspace.getPaneItems());
    const existing = items.find((item) => item?.getPath?.() === abs);
    if (existing) {
      existing.getBuffer?.()?.reload?.();
      const pane = atom.workspace.paneForItem(existing);
      pane?.activateItem(existing);
      pane?.activate();
      return;
    }
    await atom.workspace.open(abs, opts.split ? { split: opts.split } : {});
  }

  /**
   * @param {unknown} message
   * @param {string} [level] "info", "success", "warning" or "error"
   */
  notify(message, level) {
    const kind = NOTIFY_KINDS[level || "info"] || "addInfo";
    // The notification renders its message as Markdown with HTML on, and a script's message can
    // hold text taken from a web page. Escaped, it shows exactly as written.
    notify(kind, escapeMarkdown(String(message)));
  }

  // ui.confirm (ADR-0026): ask the person running the script before something irreversible.
  // A notification with Allow / Deny rather than a modal dialog, so it can be dismissed when it
  // times out. Resolves false on Deny, on timeout, and at once for runs nobody started by hand
  // (URL triggers): an unattended run must never be waved through. A debug run, and a workbook
  // step (ADR-0030), are started by hand, so they ask too.
  /**
   * @param {unknown} message
   * @param {number} [timeoutMs]
   * @returns {Promise<boolean>}
   */
  confirm(message, timeoutMs) {
    const record = this.runs && this.ctx ? this.runs.find(this.ctx.runId) : null;
    const trigger = (record && record.trigger) || "manual";
    const attended = trigger === "manual" || trigger === "debug" || /^(command|workbook):/.test(String(trigger));
    if (!attended) return Promise.resolve(false);
    const script = record ? path.basename(record.scriptPath) : "An automation";
    const wait = Math.min(Math.max(Number(timeoutMs) || 60000, 1000), 10 * 60 * 1000);
    return new Promise((resolve) => {
      let settled = false;
      /** @type {ReturnType<typeof atom.notifications.addWarning> | null} */
      let notification = null;
      /** @param {boolean} answer */
      const finish = (answer) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        if (notification) notification.dismiss();
        resolve(answer);
      };
      const timer = setTimeout(() => finish(false), wait);
      // The title renders as Markdown; the detail (the script's question) is plain text already.
      notification = atom.notifications.addWarning(`${escapeMarkdown(script)} asks:`, {
        detail: `${String(message)}\n\n(No answer in ${Math.round(wait / 1000)} s counts as Deny.)`,
        dismissable: true,
        buttons: [
          { text: "Allow", onDidClick: () => finish(true) },
          { text: "Deny", onDidClick: () => finish(false) },
        ],
      });
      notification.onDidDismiss(() => finish(false));
    });
  }
}

// run (ADR-0026): the SDK reports each page action (no values) and the script's result here,
// onto the run record the Runs panel reads.
class RunCap extends RpcTarget {
  /**
   * @param {RunnerContext} ctx
   * @param {RunsLike} runs
   */
  constructor(ctx, runs) {
    super();
    this.ctx = ctx;
    this.runs = runs;
  }

  /** @param {unknown} entry one page action, as the SDK reports it (the run manager checks it) */
  action(entry) {
    if (this.runs && this.ctx) this.runs.recordAction(this.ctx.runId, entry);
  }

  /** @param {unknown} value the script's result, as it sent it */
  result(value) {
    if (this.runs && this.ctx) this.runs.setResult(this.ctx.runId, value);
  }
}

class ClipboardCap extends RpcTarget {
  read() {
    return atom.clipboard.read();
  }
  /** @param {unknown} text */
  write(text) {
    atom.clipboard.write(String(text));
  }
}

class WorkspaceCap extends RpcTarget {
  projectDir() {
    return atom.project.getPaths()[0] || "";
  }
}

// Scripts read and write only their own state, never app config and never another script's.
// Each script's state sits under its own id, a hash of its path as the host knows it (from the
// run token, not from the script), so one automation cannot read what another saved.
class ConfigCap extends RpcTarget {
  /** @param {RunnerContext} ctx */
  constructor(ctx) {
    super();
    const id = crypto.createHash("sha256").update(String(ctx.scriptPath)).digest("hex").slice(0, 16);
    this.prefix = `${setting("scriptState")}.${id}.`;
  }
  /**
   * @param {unknown} key as the script sent it
   * @returns {string}
   */
  _key(key) {
    if (typeof key !== "string" || key === "" || key.includes("..") || /^\.|\.$/.test(key)) {
      throw userError("Bad config key");
    }
    return this.prefix + key;
  }
  /** @param {unknown} key */
  get(key) {
    return atom.config.get(this._key(key));
  }
  /**
   * @param {unknown} key
   * @param {unknown} value
   */
  set(key, value) {
    atom.config.set(this._key(key), value);
  }
}

// Register everything under the runner audience. Returns a Disposable (the active-item
// observer that keeps tabs.active() honest).
/**
 * @param {typeof import("tranquil-rpc")} rpc
 * @param {RunsLike} runs
 */
function registerRunnerCapabilities(rpc, runs) {
  /** @type {RunnerCapabilityOptions} */
  const audience = { audience: ["runner"] };
  // `requires` gates a capability on a declared grant (ADR-0025). `tabs` and `workspace` reach
  // the browser — opening pages and reading what is in them, inside whatever sessions the user
  // is signed in to — and the clipboard is a read/write channel to everything the user copies.
  // Both are omitted entirely from an ungranted run, so there is nothing to call.
  //
  // `ui` and `config` stay ungated: notifications and a script's own namespaced state are
  // bounded by construction, and gating them would make every script declare a grant to say
  // anything at all.
  // Every browser grant (tabs, forms, page-js, browser) implies `tabs` (ADR-0026).
  /** @type {RunnerCapabilityOptions} */
  const browser = { audience: ["runner"], requires: "tabs" };
  rpc.registerCapability("tabs", (ctx) => new TabsCap(ctx), browser);
  rpc.registerCapability("workspace", () => new WorkspaceCap(), browser);
  rpc.registerCapability("clipboard", () => new ClipboardCap(), {
    audience: ["runner"],
    requires: "clipboard",
  });
  rpc.registerCapability("ui", (ctx) => new UiCap(ctx, runs), audience);
  rpc.registerCapability("run", (ctx) => new RunCap(ctx, runs), audience);
  rpc.registerCapability("config", (ctx) => new ConfigCap(ctx), audience);

  // Track the most-recent browser webview for tabs.active() — the single, contained
  // remaining use of "last focused" (the old _lastWebView URL-matching heuristic is gone).
  return atom.workspace.observeActivePaneItem((item) => {
    const webview = webviewOf(item);
    if (webview) lastWebView = webview;
  });
}

module.exports = { registerRunnerCapabilities };
