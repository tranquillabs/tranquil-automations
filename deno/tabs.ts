// Tab handles (ADR-0022 specific 6): stable identity, first-class navigation, capped
// background fan-out. The host mints a handle descriptor and stamps a nonce into the page
// (window.__tqTab); this side resolves the nonce to a CDP target ONCE and then holds that
// socket for the handle's life — identity survives navigation, unlike the old runner's
// URL-matched lookup. The control plane (open/close/active) is RPC to the host; the data
// plane (evaluate/waitFor/goto/screenshot) is direct CDP.
import { CdpConnection, CdpError, listTargets } from "./cdp.ts";
import { hostCall, requireGrant } from "./rpc.ts";
import { requireSite } from "./guard.ts";
import { logAction } from "./log.ts";
import { hostOf } from "./handle.ts";

/** Log a tab-level action (navigation, opening, closing) like the page verbs do. */
async function logged<T>(verb: string, url: string, act: () => Promise<T>): Promise<T> {
  const t0 = performance.now();
  let outcome = "ok";
  try {
    return await act();
  } catch (e) {
    outcome = e instanceof Error && "code" in e ? String((e as { code: unknown }).code) : "error";
    throw e;
  } finally {
    await logAction({ verb, target: url, site: hostOf(url), outcome, ms: Math.round(performance.now() - t0) });
  }
}
import { context } from "./context.ts";
import { PageHandle } from "./handle.ts";

const RESOLVE_ATTEMPTS = 3;
const RESOLVE_DELAY_MS = 300;

export interface TabDescriptor {
  tabId: string;
  url: string;
  nonce: string;
}

export class Tab extends PageHandle implements AsyncDisposable {
  #descriptor: TabDescriptor;
  #conn: Promise<CdpConnection> | null = null;

  constructor(descriptor: TabDescriptor) {
    super();
    this.#descriptor = descriptor;
  }

  /**
   * The tab's CDP connection, re-resolved if the socket closed. A page reload replaces the
   * webview's CDP target (ADR-0026 spike), so the handle asks the host to re-stamp its identity
   * nonce in the new document and resolves again; it is the same tab to the script.
   */
  protected async connection(): Promise<CdpConnection> {
    if (this.#conn) {
      const current = await this.#conn.catch(() => null);
      if (current && !current.closed) return current;
      this.#conn = null;
      this.#descriptor = await hostCall(
        (h) => h.tabs.restamp(this.#descriptor.tabId),
        { capability: "tabs", grant: "tabs" },
      );
    }
    this.#conn = this.#resolve();
    return await this.#conn;
  }

  protected async focusHost(): Promise<void> {
    await hostCall((h) => h.tabs.focus(this.#descriptor.tabId), { capability: "tabs", grant: "tabs" });
  }

  /**
   * The document of an iframe in this tab whose URL matches, or null. Cross-origin frames are
   * their own CDP targets; the frame has the same form API as the tab.
   *
   *     const form = (await tab.frame(/forms\.example\.com/)) ?? tab;
   */
  async frame(url: string | RegExp | URLPattern, opts: { timeout?: number } = {}): Promise<Frame | null> {
    requireGrant("tabs", "tab.frame()");
    const test = (u: string) =>
      typeof url === "string" ? u === url || u.startsWith(url) : url instanceof RegExp ? url.test(u) : url.test(u);
    const deadline = Date.now() + (opts.timeout ?? 0);
    for (;;) {
      const hit = (await listTargets()).find((t) => t.type === "iframe" && test(t.url));
      if (hit) return new Frame(hit.id, this);
      if (Date.now() >= deadline) return null;
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  /** @internal Host focus for frames inside this tab. */
  _focusHost(): Promise<void> {
    return this.focusHost();
  }

  async #resolve(): Promise<CdpConnection> {
    const { url, nonce } = this.#descriptor;
    for (let attempt = 0; attempt < RESOLVE_ATTEMPTS; attempt++) {
      const candidates = (await listTargets()).filter((t) => t.type === "webview");
      // URL prefilter is only an ordering optimization — the nonce decides.
      const ordered = [
        ...candidates.filter((t) => t.url === url),
        ...candidates.filter((t) => t.url !== url),
      ];
      for (const target of ordered) {
        let conn: CdpConnection | null = null;
        try {
          conn = await CdpConnection.open(target);
          const tag = await conn.evaluate<string | undefined>("window.__tqTab");
          if (tag === nonce) return conn;
          conn.close();
        } catch {
          conn?.close();
        }
      }
      await new Promise((r) => setTimeout(r, RESOLVE_DELAY_MS));
    }
    // Fallback: a UNIQUE URL match (the nonce can lose a race with an immediate navigation).
    const byUrl = (await listTargets()).filter((t) => t.type === "webview" && t.url === url);
    if (byUrl.length === 1) return await CdpConnection.open(byUrl[0]);
    throw new CdpError(
      byUrl.length === 0
        ? `Tab vanished before it could be resolved (${url})`
        : `Ambiguous tab: ${byUrl.length} tabs at ${url} and the identity tag was lost`,
    );
  }

  /** Live URL — a CDP read, never a snapshot. */
  get url(): Promise<string> {
    requireGrant("tabs", "tab.url");
    return this.connection().then((c) => c.evaluate<string>("location.href"));
  }

  async title(): Promise<string> {
    requireGrant("tabs", "tab.title()");
    return await (await this.connection()).evaluate<string>("document.title");
  }

  /** Navigate this tab. The single-tab sequential crawl is a goto loop over URLs. */
  async goto(
    url: string,
    opts: { waitUntil?: "load" | "domcontentloaded"; timeout?: number } = {},
  ): Promise<void> {
    requireGrant("tabs", "tab.goto()");
    await logged("goto", url, async () => {
      requireSite(url, `goto ${url}`);
      await (await this.connection()).navigate(url, opts);
    });
  }

  /** Wait for a navigation someone else triggers (a click, a redirect). */
  async waitForNavigation(
    opts: { waitUntil?: "load" | "domcontentloaded"; timeout?: number } = {},
  ): Promise<void> {
    requireGrant("tabs", "tab.waitForNavigation()");
    await (await this.connection()).waitForLoad(opts);
  }

  /**
   * PNG screenshot bytes. Host-mediated (webview.capturePage): Electron's CDP cannot
   * captureScreenshot webview guests — verified, it times out even for visible tabs.
   */
  async screenshot(): Promise<Uint8Array> {
    requireGrant("tabs", "tab.screenshot()");
    requireSite(await this.url, "screenshot");
    const b64: string = await hostCall((h) => h.tabs.screenshot(this.#descriptor.tabId), { capability: "tabs", grant: "tabs" });
    return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  }

  /**
   * Hide or show this tab's address bar — the strip with the URL field and the nav buttons, not
   * the tab itself. Called with no argument it flips; returns the new state (true = hidden).
   * The state is kept on the item, so it survives a window reload.
   */
  async toggleURLBar(hidden?: boolean): Promise<boolean> {
    requireGrant("tabs", "tab.toggleURLBar()");
    return await hostCall(
      (h) => h.tabs.setURLBarHidden(this.#descriptor.tabId, hidden ?? null),
      { capability: "tabs", grant: "tabs" },
    );
  }

  /** Close the tab (host-side) and drop the CDP socket. */
  async close(): Promise<void> {
    requireGrant("tabs", "tab.close()");
    if (this.#conn) {
      try {
        (await this.#conn).close();
      } catch {
        /* already gone */
      }
      this.#conn = null;
    }
    await hostCall((h) => h.tabs.close(this.#descriptor.tabId), { capability: "tabs", grant: "tabs" });
  }

  async [Symbol.asyncDispose](): Promise<void> {
    await this.close();
  }
}

/** An iframe's document, with the same form API as a tab. From `tab.frame()`. */
export class Frame extends PageHandle {
  #targetId: string;
  #tab: Tab;
  #conn: Promise<CdpConnection> | null = null;

  constructor(targetId: string, tab: Tab) {
    super();
    this.#targetId = targetId;
    this.#tab = tab;
    this.useCustomParts(...tab._customParts());
  }

  protected async connection(): Promise<CdpConnection> {
    if (this.#conn) {
      const current = await this.#conn.catch(() => null);
      if (current && !current.closed) return current;
    }
    this.#conn = (async () => {
      const target = (await listTargets()).find((t) => t.id === this.#targetId);
      if (!target) throw new CdpError("The frame is gone (navigated away or removed); call tab.frame() again");
      return await CdpConnection.open(target);
    })();
    return await this.#conn;
  }

  protected focusHost(): Promise<void> {
    return this.#tab._focusHost();
  }

  /** The frame's current URL. */
  get url(): Promise<string> {
    requireGrant("tabs", "frame.url");
    return this.connection().then((c) => c.evaluate<string>("location.href"));
  }
}

export const tabs = {
  /**
   * The tab the user is looking at (or most recently was). Opens a tab on the browser's start
   * page when none is open, so a script does not have to guard for it.
   */
  async active(): Promise<Tab> {
    return new Tab(await hostCall((h) => h.tabs.active(), { capability: "tabs", grant: "tabs" }));
  },

  /** Find an open tab by exact URL or RegExp. */
  async find(query: string | RegExp): Promise<Tab> {
    const q = typeof query === "string" ? query : { regex: query.source, flags: query.flags };
    return new Tab(await hostCall((h) => h.tabs.find(q), { capability: "tabs", grant: "tabs" }));
  },

  /** All open http(s) browser tabs. */
  async all(): Promise<Tab[]> {
    const descriptors: TabDescriptor[] = await hostCall((h) => h.tabs.all(), { capability: "tabs", grant: "tabs" });
    return descriptors.map((d) => new Tab(d));
  },

  /**
   * Open a tab. `background: true` opens an off-screen tab (capped at ~4 concurrent,
   * FIFO beyond, same session partition as this window). Handles are AsyncDisposable:
   * `await using tab = await tabs.open(url, { background: true })` auto-closes it.
   *
   * `location` puts the tab somewhere other than the center — `"right"` or `"bottom"` opens it
   * in that dock and reveals the dock. `activate: false` opens without taking focus, which is
   * what makes a side panel appear beside the work rather than in front of it. `hideURLBar`
   * drops the address bar, for a tab presented as a panel rather than as a browser:
   *
   *     await tabs.open(url, { location: "right", activate: false, hideURLBar: true });
   */
  async open(
    url: string,
    options: {
      background?: boolean;
      location?: "center" | "right" | "bottom";
      activate?: boolean;
      hideURLBar?: boolean;
    } = {},
  ): Promise<Tab> {
    requireGrant("tabs", "tabs.open()");
    return await logged("open", url, async () => {
      requireSite(url, `tabs.open ${url}`);
      return new Tab(await hostCall((h) => h.tabs.open(url, options), { capability: "tabs", grant: "tabs" }));
    });
  },

  /** For url-triggered runs: the tab whose navigation triggered this script. */
  async triggered(): Promise<Tab> {
    if (context.trigger.kind !== "url") {
      throw new Error("tabs.triggered() is only available in url-triggered runs");
    }
    return await this.find(context.trigger.url);
  },
};
