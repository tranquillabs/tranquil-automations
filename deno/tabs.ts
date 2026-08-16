// Tab handles (ADR-0022 specific 6): stable identity, first-class navigation, capped
// background fan-out. The host mints a handle descriptor and stamps a nonce into the page
// (window.__tqTab); this side resolves the nonce to a CDP target ONCE and then holds that
// socket for the handle's life — identity survives navigation, unlike the old runner's
// URL-matched lookup. The control plane (open/close/active) is RPC to the host; the data
// plane (evaluate/waitFor/goto/screenshot) is direct CDP.
import { CdpConnection, CdpError, listTargets } from "./cdp.ts";
import { hostCall } from "./rpc.ts";
import { context } from "./context.ts";

const RESOLVE_ATTEMPTS = 3;
const RESOLVE_DELAY_MS = 300;

export interface TabDescriptor {
  tabId: string;
  url: string;
  nonce: string;
}

// deno-lint-ignore no-explicit-any
type Fn = (...args: any[]) => any;

export class Tab implements AsyncDisposable {
  #descriptor: TabDescriptor;
  #conn: Promise<CdpConnection> | null = null;

  constructor(descriptor: TabDescriptor) {
    this.#descriptor = descriptor;
  }

  #connection(): Promise<CdpConnection> {
    if (!this.#conn) this.#conn = this.#resolve();
    return this.#conn;
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
    return this.#connection().then((c) => c.evaluate<string>("location.href"));
  }

  async title(): Promise<string> {
    return await (await this.#connection()).evaluate<string>("document.title");
  }

  /** Evaluate a function (with JSON-serializable args) or an expression string in the page. */
  // deno-lint-ignore no-explicit-any
  async evaluate<T = any>(fn: Fn | string, ...args: any[]): Promise<T> {
    const conn = await this.#connection();
    if (typeof fn === "string") return await conn.evaluate<T>(fn);
    return await conn.callFunction<T>(fn.toString(), args);
  }

  /** Poll until a selector matches (string) or a predicate returns truthy (function). */
  async waitFor(
    selectorOrFn: string | Fn,
    { timeout = 8000, interval = 200 }: { timeout?: number; interval?: number } = {},
  ): Promise<void> {
    const t0 = Date.now();
    for (;;) {
      const hit = typeof selectorOrFn === "string"
        ? await this.evaluate<boolean>((s: string) => !!document.querySelector(s), selectorOrFn)
        : await this.evaluate<boolean>(selectorOrFn);
      if (hit) return;
      if (Date.now() - t0 > timeout) {
        throw new CdpError(`waitFor timed out: ${selectorOrFn.toString().slice(0, 80)}`);
      }
      await new Promise((r) => setTimeout(r, interval));
    }
  }

  /** Navigate this tab. The single-tab sequential crawl is a goto loop over URLs. */
  async goto(
    url: string,
    opts: { waitUntil?: "load" | "domcontentloaded"; timeout?: number } = {},
  ): Promise<void> {
    await (await this.#connection()).navigate(url, opts);
  }

  /** Wait for a navigation someone else triggers (a click, a redirect). */
  async waitForNavigation(
    opts: { waitUntil?: "load" | "domcontentloaded"; timeout?: number } = {},
  ): Promise<void> {
    await (await this.#connection()).waitForLoad(opts);
  }

  /**
   * PNG screenshot bytes. Host-mediated (webview.capturePage): Electron's CDP cannot
   * captureScreenshot webview guests — verified, it times out even for visible tabs.
   */
  async screenshot(): Promise<Uint8Array> {
    const b64: string = await hostCall((h) => h.tabs.screenshot(this.#descriptor.tabId), { capability: "tabs", grant: "browser" });
    return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  }

  /** Close the tab (host-side) and drop the CDP socket. */
  async close(): Promise<void> {
    if (this.#conn) {
      try {
        (await this.#conn).close();
      } catch {
        /* already gone */
      }
      this.#conn = null;
    }
    await hostCall((h) => h.tabs.close(this.#descriptor.tabId), { capability: "tabs", grant: "browser" });
  }

  async [Symbol.asyncDispose](): Promise<void> {
    await this.close();
  }
}

export const tabs = {
  /** The tab the user is looking at (or most recently was). */
  async active(): Promise<Tab> {
    return new Tab(await hostCall((h) => h.tabs.active(), { capability: "tabs", grant: "browser" }));
  },

  /** Find an open tab by exact URL or RegExp. */
  async find(query: string | RegExp): Promise<Tab> {
    const q = typeof query === "string" ? query : { regex: query.source, flags: query.flags };
    return new Tab(await hostCall((h) => h.tabs.find(q), { capability: "tabs", grant: "browser" }));
  },

  /** All open http(s) browser tabs. */
  async all(): Promise<Tab[]> {
    const descriptors: TabDescriptor[] = await hostCall((h) => h.tabs.all(), { capability: "tabs", grant: "browser" });
    return descriptors.map((d) => new Tab(d));
  },

  /**
   * Open a tab. `background: true` opens an off-screen tab (capped at ~4 concurrent,
   * FIFO beyond, same session partition as this window). Handles are AsyncDisposable:
   * `await using tab = await tabs.open(url, { background: true })` auto-closes it.
   */
  async open(url: string, options: { background?: boolean } = {}): Promise<Tab> {
    return new Tab(await hostCall((h) => h.tabs.open(url, options), { capability: "tabs", grant: "browser" }));
  },

  /** For url-triggered runs: the tab whose navigation triggered this script. */
  async triggered(): Promise<Tab> {
    if (context.trigger.kind !== "url") {
      throw new Error("tabs.triggered() is only available in url-triggered runs");
    }
    return await this.find(context.trigger.url);
  },
};
