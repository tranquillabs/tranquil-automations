// The owned CDP client (ADR-0022 specific 7) — grown from tranquil-test-suite's proven
// smoke/lib/cdp.ts. Scope, deliberately: target listing, attach by webSocketDebuggerUrl,
// evaluate (expression + function-argument forms) with execution-context tracking across
// navigation, Page.navigate with load/domcontentloaded waiting, screenshots, and
// exceptionDetails → real Errors. No frames, no input events, no network interception —
// needing those is the re-evaluation trigger toward a full driver.
//
// Navigation destroys and recreates the page's default execution context; evaluate calls
// retry once across that window — the exact bookkeeping puppeteer used to hide.

// The host app's CDP port arrives via env (the run manager grants exactly this port).
// Guarded: reading an ungranted var throws under --no-prompt, and a standalone import
// (outside the runner) must not die at module load.
function envCdpPort(): string {
  try {
    return Deno.env.get("TRANQUIL_CDP_PORT") ?? "9222";
  } catch {
    return "9222";
  }
}
const CDP_BASE = `http://127.0.0.1:${envCdpPort()}`;
const DEFAULT_CALL_TIMEOUT_MS = 30000;

export interface TargetInfo {
  id: string;
  type: string; // "page" (host windows) | "webview" (browser tabs) | ...
  url: string;
  title: string;
  webSocketDebuggerUrl: string;
  parentId?: string;
}

/** One entry per debuggable target, webview guests included (verified against this build). */
export async function listTargets(): Promise<TargetInfo[]> {
  const res = await fetch(`${CDP_BASE}/json`, { signal: AbortSignal.timeout(3000) });
  if (!res.ok) throw new CdpError(`CDP target list failed: HTTP ${res.status}`);
  return await res.json();
}

export class CdpError extends Error {}

/** A page-side exception surfaced by evaluate/callFunction, with the page's own description. */
export class PageError extends Error {}

interface CdpMessage {
  id?: number;
  method?: string;
  // deno-lint-ignore no-explicit-any
  params?: any;
  // deno-lint-ignore no-explicit-any
  result?: any;
  error?: { message: string; data?: string };
}

interface Pending {
  // deno-lint-ignore no-explicit-any
  resolve: (v: any) => void;
  reject: (e: unknown) => void;
  timer: ReturnType<typeof setTimeout>;
}

// deno-lint-ignore no-explicit-any
type EventHandler = (params: any) => void;

function isContextError(e: unknown): boolean {
  const msg = String((e as Error)?.message ?? e);
  return /execution context|Cannot find context|context was destroyed|Inspected target navigated/i
    .test(msg);
}

// deno-lint-ignore no-explicit-any
function pageErrorFrom(exceptionDetails: any): PageError {
  const exception = exceptionDetails?.exception;
  const message = exception?.description || exception?.value || exceptionDetails?.text ||
    "Script threw in page";
  return new PageError(String(message));
}

export class CdpConnection {
  #ws: WebSocket;
  #nextId = 1;
  #pending = new Map<number, Pending>();
  #handlers = new Map<string, Set<EventHandler>>();
  #contextId: number | null = null;
  #closed = false;

  private constructor(ws: WebSocket) {
    this.#ws = ws;
    ws.onmessage = (e) => {
      let msg: CdpMessage;
      try {
        msg = JSON.parse(String(e.data));
      } catch {
        return;
      }
      if (msg.id != null) {
        const p = this.#pending.get(msg.id);
        if (!p) return;
        this.#pending.delete(msg.id);
        clearTimeout(p.timer);
        if (msg.error) p.reject(new CdpError(msg.error.message + (msg.error.data ? `: ${msg.error.data}` : "")));
        else p.resolve(msg.result);
        return;
      }
      if (msg.method) {
        this.#trackContexts(msg.method, msg.params);
        for (const h of this.#handlers.get(msg.method) ?? []) h(msg.params);
      }
    };
    ws.onclose = () => {
      this.#closed = true;
      const err = new CdpError("CDP socket closed");
      for (const p of this.#pending.values()) {
        clearTimeout(p.timer);
        p.reject(err);
      }
      this.#pending.clear();
    };
  }

  // deno-lint-ignore no-explicit-any
  #trackContexts(method: string, params: any): void {
    if (method === "Runtime.executionContextCreated") {
      const ctx = params?.context;
      if (ctx?.auxData?.isDefault) this.#contextId = ctx.id;
    } else if (method === "Runtime.executionContextDestroyed") {
      if (params?.executionContextId === this.#contextId) this.#contextId = null;
    } else if (method === "Runtime.executionContextsCleared") {
      this.#contextId = null;
    }
  }

  /** Attach to a target and enable the Runtime + Page domains. */
  static async open(target: TargetInfo | string): Promise<CdpConnection> {
    const wsUrl = typeof target === "string" ? target : target.webSocketDebuggerUrl;
    const ws = new WebSocket(wsUrl);
    await new Promise<void>((resolve, reject) => {
      ws.onopen = () => resolve();
      ws.onerror = () => reject(new CdpError(`CDP connect failed: ${wsUrl}`));
    });
    const conn = new CdpConnection(ws);
    await conn.send("Runtime.enable"); // replays executionContextCreated for live contexts
    await conn.send("Page.enable");
    return conn;
  }

  get closed(): boolean {
    return this.#closed;
  }

  // deno-lint-ignore no-explicit-any
  send<T = any>(
    method: string,
    // deno-lint-ignore no-explicit-any
    params?: Record<string, any>,
    { timeout = DEFAULT_CALL_TIMEOUT_MS }: { timeout?: number } = {},
  ): Promise<T> {
    if (this.#closed) return Promise.reject(new CdpError("CDP socket closed"));
    const id = this.#nextId++;
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.#pending.delete(id);
        reject(new CdpError(`CDP call timed out: ${method}`));
      }, timeout);
      this.#pending.set(id, { resolve, reject, timer });
      this.#ws.send(JSON.stringify({ id, method, params: params ?? {} }));
    });
  }

  /** Subscribe to a CDP event. Returns an unsubscribe function. */
  on(method: string, handler: EventHandler): () => void {
    if (!this.#handlers.has(method)) this.#handlers.set(method, new Set());
    this.#handlers.get(method)!.add(handler);
    return () => this.#handlers.get(method)?.delete(handler);
  }

  // deno-lint-ignore no-explicit-any
  waitForEvent<T = any>(method: string, { timeout = DEFAULT_CALL_TIMEOUT_MS } = {}): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        off();
        reject(new CdpError(`Timed out waiting for ${method}`));
      }, timeout);
      const off = this.on(method, (params) => {
        clearTimeout(timer);
        off();
        resolve(params as T);
      });
    });
  }

  async #currentContextId(): Promise<number> {
    const t0 = Date.now();
    while (this.#contextId == null) {
      if (Date.now() - t0 > 2000) throw new CdpError("No execution context (page still loading?)");
      await new Promise((r) => setTimeout(r, 50));
    }
    return this.#contextId;
  }

  // Retry once across execution-context recreation (navigation races).
  async #withContextRetry<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (e) {
      if (!isContextError(e)) throw e;
      await new Promise((r) => setTimeout(r, 150));
      return await fn();
    }
  }

  /** Evaluate a JS expression in the page; resolves its (JSON-serializable) value. */
  async evaluate<T>(expression: string): Promise<T> {
    return await this.#withContextRetry(async () => {
      const result = await this.send("Runtime.evaluate", {
        expression,
        awaitPromise: true,
        returnByValue: true,
      });
      if (result.exceptionDetails) throw pageErrorFrom(result.exceptionDetails);
      return result.result?.value as T;
    });
  }

  /** Call a function (by source) in the page with JSON-serializable arguments. */
  // deno-lint-ignore no-explicit-any
  async callFunction<T>(functionDeclaration: string, args: any[] = []): Promise<T> {
    return await this.#withContextRetry(async () => {
      const executionContextId = await this.#currentContextId();
      const result = await this.send("Runtime.callFunctionOn", {
        functionDeclaration,
        arguments: args.map((value) => ({ value })),
        executionContextId,
        awaitPromise: true,
        returnByValue: true,
      });
      if (result.exceptionDetails) throw pageErrorFrom(result.exceptionDetails);
      return result.result?.value as T;
    });
  }

  /**
   * Wait for the current/next navigation to reach `waitUntil`. Call AFTER initiating the
   * navigation (or use navigate(), which sequences it correctly).
   */
  async waitForLoad(
    { waitUntil = "load", timeout = DEFAULT_CALL_TIMEOUT_MS }: {
      waitUntil?: "load" | "domcontentloaded";
      timeout?: number;
    } = {},
  ): Promise<void> {
    const event = waitUntil === "domcontentloaded"
      ? "Page.domContentEventFired"
      : "Page.loadEventFired";
    await this.waitForEvent(event, { timeout });
  }

  /** Navigate the page and wait for load/domcontentloaded. */
  async navigate(
    url: string,
    { waitUntil = "load", timeout = DEFAULT_CALL_TIMEOUT_MS }: {
      waitUntil?: "load" | "domcontentloaded";
      timeout?: number;
    } = {},
  ): Promise<void> {
    const loaded = this.waitForLoad({ waitUntil, timeout });
    loaded.catch(() => {}); // surfaced via the await below; avoid unhandled-rejection noise
    const result = await this.send("Page.navigate", { url });
    if (result.errorText) throw new CdpError(`Navigation failed: ${result.errorText}`);
    await loaded;
  }

  /** PNG screenshot of the page. */
  async screenshot(): Promise<Uint8Array> {
    const { data } = await this.send("Page.captureScreenshot", { format: "png" });
    return Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
  }

  close(): void {
    this.#closed = true;
    try {
      this.#ws.close();
    } catch {
      /* ignore */
    }
  }
}
