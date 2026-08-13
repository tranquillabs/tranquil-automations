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
const path = require("path");
const { Disposable } = require("atom");
const { RpcTarget } = require("tranquil-rpc");
const { notify } = require("./notify.js");

const BACKGROUND_CAP = 4;
const OPEN_TIMEOUT_MS = 15000;

let lastWebView = null; // most-recent browser webview (see observer at the bottom)

function webviewOf(item) {
  return (item && item.view && item.view.htmlv && item.view.htmlv[0]) || null;
}

function userError(message) {
  return Object.assign(new Error(message), { userFacing: true });
}

function windowPartition() {
  const id = atom.getLoadSettings().windowSessionId;
  return id ? `persist:tb-window-${id}` : null;
}

// Wait until a webview can execute script (attached + current load finished).
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
  constructor(ctx) {
    super();
    this.ctx = ctx;
    this.handles = new Map(); // tabId → { webview, background, item }
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

  async _mint(webview, { background = false, item = null } = {}) {
    await whenLoaded(webview);
    const tabId = crypto.randomBytes(8).toString("hex");
    const nonce = crypto.randomBytes(16).toString("hex");
    await webview.executeJavaScript(`window.__tqTab = ${JSON.stringify(nonce)}; undefined`);
    this.handles.set(tabId, { webview, background, item });
    return { tabId, url: webview.getURL(), nonce };
  }

  _entry(tabId) {
    const entry = this.handles.get(tabId);
    if (!entry) throw userError("Unknown tab handle (tab closed?)");
    return entry;
  }

  _paneWebviews() {
    const out = [];
    for (const item of atom.workspace.getPaneItems()) {
      const webview = webviewOf(item);
      if (webview) out.push({ webview, item });
    }
    return out;
  }

  async active() {
    const activeItem = atom.workspace.getActivePaneItem();
    const webview = webviewOf(activeItem) || lastWebView;
    if (!webview || !webview.isConnected) throw userError("No active browser tab");
    return this._mint(webview);
  }

  // query: a full URL string, or { regex, flags } for pattern matching.
  async find(query) {
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
      if (url && matches(url)) return this._mint(webview, { item });
    }
    throw userError(
      `No open tab matches ${typeof query === "string" ? query : `/${query.regex}/`}`
    );
  }

  async all() {
    const out = [];
    for (const { webview, item } of this._paneWebviews()) {
      try {
        if (/^https?:/.test(webview.getURL())) out.push(await this._mint(webview, { item }));
      } catch (e) {
        /* skip detached */
      }
    }
    return out;
  }

  async open(url, options) {
    if (!url) throw userError("tabs.open requires a url");
    const background = !!(options && options.background);
    if (!background) {
      await atom.workspace.open(url);
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
    await new Promise((resolve) => {
      if (this.backgroundLive < BACKGROUND_CAP) {
        this.backgroundLive++;
        resolve();
      } else {
        this.backgroundQueue.push(resolve);
      }
    });
    const webview = document.createElement("webview");
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

  _releaseBackground(webview) {
    webview.remove();
    this.backgroundLive--;
    const next = this.backgroundQueue.shift();
    if (next) {
      this.backgroundLive++;
      next();
    }
  }

  async close(tabId) {
    const entry = this._entry(tabId);
    this.handles.delete(tabId);
    if (entry.background) {
      this._releaseBackground(entry.webview);
      return;
    }
    const item =
      entry.item || atom.workspace.getPaneItems().find((it) => webviewOf(it) === entry.webview);
    if (item) {
      const pane = atom.workspace.paneForItem(item);
      if (pane) pane.destroyItem(item);
    }
  }

  async url(tabId) {
    return this._entry(tabId).webview.getURL();
  }

  // Screenshots go through the host, not CDP: Electron's CDP cannot captureScreenshot a
  // <webview> guest (verified — times out even for visible tabs, an OOPIF-family limit).
  // capturePage() on the element works. Returns base64 PNG.
  async screenshot(tabId) {
    const { webview } = this._entry(tabId);
    const image = await webview.capturePage();
    return image.toPNG().toString("base64");
  }
}

class UiCap extends RpcTarget {
  async open(filePath, options) {
    const opts = options || {};
    const abs = path.resolve(filePath);
    // Already open → refresh from disk and reveal in place (same UX as the old runner).
    const existing = atom.workspace.getPaneItems().find((item) => item?.getPath?.() === abs);
    if (existing) {
      existing.getBuffer?.()?.reload?.();
      const pane = atom.workspace.paneForItem(existing);
      pane?.activateItem(existing);
      pane?.activate();
      return;
    }
    await atom.workspace.open(abs, opts.split ? { split: opts.split } : {});
  }

  notify(message, level) {
    const kind =
      { info: "addInfo", success: "addSuccess", warning: "addWarning", error: "addError" }[
        level || "info"
      ] || "addInfo";
    notify(kind, String(message));
  }
}

class ClipboardCap extends RpcTarget {
  read() {
    return atom.clipboard.read();
  }
  write(text) {
    atom.clipboard.write(String(text));
  }
}

class WorkspaceCap extends RpcTarget {
  projectDir() {
    return atom.project.getPaths()[0] || "";
  }
}

// Deliberate tightening vs the old runner: scripts read/write only their own namespaced state,
// never arbitrary app config.
const SCRIPT_STATE_PREFIX = "tranquil-automations.scriptState.";
class ConfigCap extends RpcTarget {
  _key(key) {
    if (typeof key !== "string" || key === "" || key.includes("..")) {
      throw userError("Bad config key");
    }
    return SCRIPT_STATE_PREFIX + key;
  }
  get(key) {
    return atom.config.get(this._key(key));
  }
  set(key, value) {
    atom.config.set(this._key(key), value);
  }
}

// Register everything under the runner audience. Returns a Disposable (the active-item
// observer that keeps tabs.active() honest).
function registerRunnerCapabilities(rpc) {
  const audience = { audience: ["runner"] };
  rpc.registerCapability("tabs", (ctx) => new TabsCap(ctx), audience);
  rpc.registerCapability("ui", () => new UiCap(), audience);
  rpc.registerCapability("clipboard", () => new ClipboardCap(), audience);
  rpc.registerCapability("workspace", () => new WorkspaceCap(), audience);
  rpc.registerCapability("config", () => new ConfigCap(), audience);

  // Track the most-recent browser webview for tabs.active() — the single, contained
  // remaining use of "last focused" (the old _lastWebView URL-matching heuristic is gone).
  return atom.workspace.observeActivePaneItem((item) => {
    const webview = webviewOf(item);
    if (webview) lastWebView = webview;
  });
}

module.exports = { registerRunnerCapabilities };
