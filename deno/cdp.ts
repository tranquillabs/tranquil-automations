// The owned CDP client (ADR-0022 specific 7, amended by ADR-0026), grown from
// tranquil-test-suite's proven smoke/lib/cdp.ts. Scope: target listing, attach by
// webSocketDebuggerUrl, evaluate (expression + function-argument forms) with execution-context
// tracking across navigation, Page.navigate with load/domcontentloaded waiting, and
// exceptionDetails → real Errors. ADR-0026 adds what form filling needs: an isolated world for
// the SDK's page runtime, trusted keyboard input (Input.insertText / dispatchKeyEvent) and focus
// emulation. Still no network interception.
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

// Debug runs get a much longer per-call timeout (ADR-0025). Code inside a `tab.evaluate()`
// callback executes in the BROWSER page, not here, so the automation's own debugger cannot reach
// it — the way to stop in there is a `debugger;` statement with the page's DevTools open. That
// pause blocks the evaluate call for as long as someone is reading the page, and 30 s of human
// attention is nothing; the call would fail with "CDP call timed out" mid-inspection.
//
// Only debug runs are affected: an ordinary run keeps the 30 s ceiling, so a genuinely stuck page
// still fails fast instead of hanging the run.
function isDebugRun(): boolean {
  try {
    return Deno.env.get("TRANQUIL_TRIGGER") === "debug";
  } catch {
    return false;
  }
}
const DEFAULT_CALL_TIMEOUT_MS = isDebugRun() ? 10 * 60_000 : 30000;

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

/**
 * Named keys for pressKey. Printable text never goes through dispatchKeyEvent: Electron webviews
 * reject repeated printable key events, so text uses Input.insertText instead.
 */
const KEYS: Record<string, { key: string; code: string; keyCode: number; text?: string }> = {
  Enter: { key: "Enter", code: "Enter", keyCode: 13, text: "\r" },
  Tab: { key: "Tab", code: "Tab", keyCode: 9 },
  Escape: { key: "Escape", code: "Escape", keyCode: 27 },
  Backspace: { key: "Backspace", code: "Backspace", keyCode: 8 },
  Delete: { key: "Delete", code: "Delete", keyCode: 46 },
  ArrowDown: { key: "ArrowDown", code: "ArrowDown", keyCode: 40 },
  ArrowUp: { key: "ArrowUp", code: "ArrowUp", keyCode: 38 },
  ArrowLeft: { key: "ArrowLeft", code: "ArrowLeft", keyCode: 37 },
  ArrowRight: { key: "ArrowRight", code: "ArrowRight", keyCode: 39 },
  Home: { key: "Home", code: "Home", keyCode: 36 },
  End: { key: "End", code: "End", keyCode: 35 },
  " ": { key: " ", code: "Space", keyCode: 32, text: " " },
};

/** A page-side exception surfaced by evaluate/callFunction, with the page's own description. */
export class PageError extends Error {}

// The part of the Chrome DevTools Protocol the SDK uses, typed from the protocol's own definitions
// (https://chromedevtools.github.io/devtools-protocol/). A command not listed here cannot be sent;
// add it, with its params and result, when the SDK needs it.
type Empty = Record<never, never>;

interface RemoteObject {
  type: string;
  value?: unknown;
  objectId?: string;
  description?: string;
}

interface ExceptionDetails {
  text: string;
  exception?: RemoteObject;
}

/** The result of Runtime.evaluate and Runtime.callFunctionOn. */
interface EvaluateResult {
  result: RemoteObject;
  exceptionDetails?: ExceptionDetails;
}

interface CallFunctionParams {
  functionDeclaration: string;
  arguments: { value: unknown }[];
  executionContextId: number;
  awaitPromise: boolean;
  returnByValue: boolean;
}

interface Commands {
  "Runtime.enable": { params: Empty; result: Empty };
  "Page.enable": { params: Empty; result: Empty };
  "Emulation.setFocusEmulationEnabled": { params: { enabled: boolean }; result: Empty };
  "Runtime.evaluate": {
    params: { expression: string; awaitPromise: boolean; returnByValue: boolean };
    result: EvaluateResult;
  };
  "Runtime.callFunctionOn": { params: CallFunctionParams; result: EvaluateResult };
  "Runtime.releaseObject": { params: { objectId: string }; result: Empty };
  "Page.getFrameTree": { params: Empty; result: { frameTree: { frame: { id: string; url: string } } } };
  "Page.createIsolatedWorld": { params: { frameId: string; worldName: string }; result: { executionContextId: number } };
  "Page.navigate": { params: { url: string }; result: { frameId: string; errorText?: string } };
  "Page.captureScreenshot": { params: { format: "png" | "jpeg" }; result: { data: string } };
  "DOM.setFileInputFiles": { params: { objectId: string; files: string[] }; result: Empty };
  "Input.dispatchMouseEvent": {
    params: {
      type: "mouseMoved" | "mousePressed" | "mouseReleased";
      x: number;
      y: number;
      button?: "none" | "left" | "middle" | "right";
      clickCount?: number;
    };
    result: Empty;
  };
  "Input.insertText": { params: { text: string }; result: Empty };
  "Input.dispatchKeyEvent": {
    params: {
      type: "keyDown" | "rawKeyDown" | "keyUp" | "char";
      key?: string;
      code?: string;
      windowsVirtualKeyCode?: number;
      text?: string;
      unmodifiedText?: string;
    };
    result: Empty;
  };
}
type Command = keyof Commands;

interface Events {
  "Runtime.executionContextCreated": { context: { id: number; auxData?: { isDefault?: boolean } } };
  "Runtime.executionContextDestroyed": { executionContextId: number };
  "Runtime.executionContextsCleared": Empty;
  "Page.loadEventFired": { timestamp: number };
  "Page.domContentEventFired": { timestamp: number };
}
type Event = keyof Events;

interface CallOptions {
  timeout?: number;
}
/** A command's params may be left out only when it has none that are required. */
type SendArgs<M extends Command> = Empty extends Commands[M]["params"]
  ? [params?: Commands[M]["params"], options?: CallOptions]
  : [params: Commands[M]["params"], options?: CallOptions];

/** A message off the socket: a reply (id) or an event (method). Its payloads are the protocol's. */
interface CdpMessage {
  id?: number;
  method?: string;
  params?: unknown;
  result?: unknown;
  error?: { message: string; data?: string };
}

interface Pending {
  resolve: (result: unknown) => void;
  reject: (e: unknown) => void;
  timer: ReturnType<typeof setTimeout>;
}

function isContextError(e: unknown): boolean {
  const msg = String((e as Error)?.message ?? e);
  return /execution context|Cannot find context|context was destroyed|Inspected target navigated/i
    .test(msg);
}

function pageErrorFrom(exceptionDetails: ExceptionDetails): PageError {
  const exception = exceptionDetails?.exception;
  const message = exception?.description || exception?.value || exceptionDetails?.text ||
    "Script threw in page";
  return new PageError(String(message));
}

export class CdpConnection {
  #ws: WebSocket;
  #nextId = 1;
  #pending = new Map<number, Pending>();
  #handlers = new Map<string, Set<(params: unknown) => void>>();
  #contextId: number | null = null;
  #worldId: number | null = null; // the SDK's isolated world in this target's main frame
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
    // Track the page's default context and the SDK's world. Registered first, so these run before
    // any other handler for the same event.
    this.on("Runtime.executionContextCreated", ({ context }) => {
      if (context.auxData?.isDefault) this.#contextId = context.id;
    });
    this.on("Runtime.executionContextDestroyed", ({ executionContextId }) => {
      if (executionContextId === this.#contextId) this.#contextId = null;
      if (executionContextId === this.#worldId) this.#worldId = null;
    });
    this.on("Runtime.executionContextsCleared", () => {
      this.#contextId = null;
      this.#worldId = null;
    });
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
    // Pages in unfocused windows and background tabs get no focus/blur events without this, and
    // many pages validate a field when focus leaves it (ADR-0026 spike question 3).
    await conn.send("Emulation.setFocusEmulationEnabled", { enabled: true }).catch(() => {});
    return conn;
  }

  get closed(): boolean {
    return this.#closed;
  }

  send<M extends Command>(method: M, ...[params, options]: SendArgs<M>): Promise<Commands[M]["result"]> {
    if (this.#closed) return Promise.reject(new CdpError("CDP socket closed"));
    const { timeout = DEFAULT_CALL_TIMEOUT_MS } = options ?? {};
    const id = this.#nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.#pending.delete(id);
        reject(new CdpError(`CDP call timed out: ${method}`));
      }, timeout);
      // The reply's result is the protocol's for this method (Commands).
      this.#pending.set(id, { resolve: (result) => resolve(result as Commands[M]["result"]), reject, timer });
      this.#ws.send(JSON.stringify({ id, method, params: params ?? {} }));
    });
  }

  /** Subscribe to a CDP event. Returns an unsubscribe function. */
  on<E extends Event>(method: E, handler: (params: Events[E]) => void): () => void {
    // An event's params are the protocol's for that event (Events).
    const h = handler as (params: unknown) => void;
    if (!this.#handlers.has(method)) this.#handlers.set(method, new Set());
    this.#handlers.get(method)!.add(h);
    return () => this.#handlers.get(method)?.delete(h);
  }

  waitForEvent<E extends Event>(method: E, { timeout = DEFAULT_CALL_TIMEOUT_MS } = {}): Promise<Events[E]> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        off();
        reject(new CdpError(`Timed out waiting for ${method}`));
      }, timeout);
      const off = this.on(method, (params) => {
        clearTimeout(timer);
        off();
        resolve(params);
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
  async callFunction<T>(functionDeclaration: string, args: unknown[] = []): Promise<T> {
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

  async #worldContextId(): Promise<number> {
    if (this.#worldId != null) return this.#worldId;
    const { frameTree } = await this.send("Page.getFrameTree");
    const { executionContextId } = await this.send("Page.createIsolatedWorld", {
      frameId: frameTree.frame.id,
      worldName: "tranquil-sdk", // a label only: names this context in DevTools; nothing looks it up
    });
    this.#worldId = executionContextId;
    return executionContextId;
  }

  /**
   * Call a function (by source) in the SDK's isolated world: same DOM as the page, separate
   * globals, so nothing the SDK installs is visible to page scripts and page prototype
   * tampering cannot reach it. The world is re-created after navigation.
   */
  async callInWorld<T>(functionDeclaration: string, args: unknown[] = []): Promise<T> {
    const call = async () => {
      const executionContextId = await this.#worldContextId();
      const result = await this.send("Runtime.callFunctionOn", {
        functionDeclaration,
        arguments: args.map((value) => ({ value })),
        executionContextId,
        awaitPromise: true,
        returnByValue: true,
      });
      if (result.exceptionDetails) throw pageErrorFrom(result.exceptionDetails);
      return result.result?.value as T;
    };
    try {
      return await call();
    } catch (e) {
      if (!isContextError(e)) throw e;
      this.#worldId = null;
      await new Promise((r) => setTimeout(r, 150));
      return await call();
    }
  }

  /**
   * Call a function in the isolated world and get a handle to the object it returns (for CDP
   * methods that take an objectId). Release it with releaseObject, or use withObject.
   */
  async callInWorldForObject(functionDeclaration: string, args: unknown[] = []): Promise<string | null> {
    const executionContextId = await this.#worldContextId();
    const result = await this.send("Runtime.callFunctionOn", {
      functionDeclaration,
      arguments: args.map((value) => ({ value })),
      executionContextId,
      awaitPromise: true,
      returnByValue: false,
    });
    if (result.exceptionDetails) throw pageErrorFrom(result.exceptionDetails);
    return result.result?.objectId ?? null;
  }

  async releaseObject(objectId: string): Promise<void> {
    await this.send("Runtime.releaseObject", { objectId }).catch(() => {});
  }

  /** Put files on an <input type=file> (trusted input + change). Paths are read by the browser. */
  async setFileInputFiles(objectId: string, files: string[]): Promise<void> {
    await this.send("DOM.setFileInputFiles", { objectId, files });
  }

  /** A trusted left click at viewport coordinates of this target's page. */
  async mouseClick(x: number, y: number): Promise<void> {
    // The hover move lets hover-driven menus respond as they would to a person, but in a
    // background webview its acknowledgement can be held for ~5 s (measured, ADR-0026). The
    // press and release do not depend on it, so don't wait for it.
    await this.send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y }, { timeout: 250 }).catch(() => {});
    await this.send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
    await this.send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
  }

  /** Insert text into the focused element as a trusted edit (beforeinput + input, no keys). */
  async insertText(text: string): Promise<void> {
    await this.send("Input.insertText", { text });
  }

  /** Press and release a named key (see KEYS) as trusted keyboard input. */
  async pressKey(name: string): Promise<void> {
    const key = KEYS[name];
    if (!key) throw new CdpError(`Unknown key "${name}". Known keys: ${Object.keys(KEYS).join(", ")}`);
    const base = { key: key.key, code: key.code, windowsVirtualKeyCode: key.keyCode };
    await this.send("Input.dispatchKeyEvent", {
      type: key.text ? "keyDown" : "rawKeyDown",
      ...base,
      ...(key.text ? { text: key.text, unmodifiedText: key.text } : {}),
    });
    await this.send("Input.dispatchKeyEvent", { type: "keyUp", ...base });
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
