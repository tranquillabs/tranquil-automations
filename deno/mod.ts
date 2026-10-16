// tranquil/automation — the script API (ADR-0022 specific 6). Scripts are plain Deno
// TypeScript run in a sandboxed subprocess; app capabilities go over the token bridge to the
// host renderer, browser control goes direct over CDP.
//
//   import { tabs, ui, files } from "tranquil/automation";
//
//   const tab = await tabs.active();
//   const title = await tab.evaluate((page) => page.document.title);
//   await ui.open(files.write("title.txt", title), { split: "down" });
import { context } from "./context.ts";
import { host, hostCall } from "./rpc.ts";

export { context } from "./context.ts";
export type { Trigger } from "./context.ts";
export { Frame, Tab, tabs } from "./tabs.ts";
export type { TabDescriptor } from "./tabs.ts";
export { FieldError } from "./forms/types.ts";
export type {
  Clickable,
  CustomPartsMap,
  ErrorCode,
  Field,
  FieldRef,
  Filled,
  Kind,
  Target,
  Value,
} from "./forms/types.ts";
export type { Page } from "./page.ts";

// Connect the bridge eagerly (fire-and-forget): this wires protocol-level cancel for every
// script that imports the runtime, even ones that never call a host capability. Failures
// surface on first actual use — host() caches the same rejected promise.
void host().catch(() => {});

function resolveInScriptDir(name: string): string {
  return name.startsWith("/") ? name : `${context.scriptDir}/${name}`;
}

/** Local files, relative to the script's directory (the run's fs sandbox). */
export const files = {
  /** Write text; returns the absolute path (feeds ui.open). */
  write(name: string, content: string): string {
    const abs = resolveInScriptDir(name);
    Deno.writeTextFileSync(abs, content);
    return abs;
  },
  read(name: string): string {
    return Deno.readTextFileSync(resolveInScriptDir(name));
  },
};

/** Host UI: open a file in the editor, show a toast. */
export const ui = {
  async open(path: string, options: { split?: "up" | "down" | "left" | "right" } = {}) {
    await hostCall((h) => h.ui.open(resolveInScriptDir(path), options));
  },
  /**
   * Tell the user something: a popup AND a line in the run output.
   *
   * It always logs as well as popping, because a toast is gone in a few seconds and a run you
   * come back to should still say what happened — the same reason a refused run is recorded in
   * the Runs panel and not just toasted. Use plain `console.log` for anything that belongs in
   * the output but does not deserve to interrupt.
   *
   * (This absorbed the old `ui.status()`, which was exactly this function's body: two channels
   * for one message was a distinction without a difference.)
   */
  async notify(
    message: string,
    options: { level?: "info" | "success" | "warning" | "error" } = {},
  ) {
    const level = options.level ?? "info";
    if (level === "error" || level === "warning") console.error(message);
    else console.log(message);
    await hostCall((h) => h.ui.notify(message, level));
  },
  /**
   * Ask the person running the script, before something that cannot be undone (submitting a
   * form, sending a message). Resolves true only if they choose Allow. It is false when nobody
   * answers within `timeout` (default 60 s) and at once when the run was not started by hand
   * (a URL trigger), so an unattended run can never be waved through.
   *
   *     if (!(await ui.confirm("Submit the application to Acme?"))) return;
   *     await tab.click({ role: "button", name: "Submit application" });
   */
  async confirm(message: string, options: { timeout?: number } = {}): Promise<boolean> {
    return Boolean(await hostCall((h) => h.ui.confirm(String(message), options.timeout ?? 60_000)));
  },
};

/** The app clipboard. */
export const clipboard = {
  async read(): Promise<string> {
    return await hostCall((h) => h.clipboard.read(), { capability: "clipboard", grant: "clipboard" });
  },
  async write(text: string): Promise<void> {
    await hostCall((h) => h.clipboard.write(text), { capability: "clipboard", grant: "clipboard" });
  },
};

/** The host workspace. */
export const workspace = {
  async projectDir(): Promise<string> {
    return await hostCall((h) => h.workspace.projectDir(), { capability: "workspace", grant: "tabs" });
  },
};

/**
 * Per-script persistent state, kept under the app's config in a section of its own for each
 * script (keyed by the script's path, as the host knows it). A script cannot read or write
 * app config, or another script's state.
 */
export const config = {
  /** The value stored under `key`, or undefined. Name its type: `config.get<string[]>("seen")`. */
  async get<T = unknown>(key: string): Promise<T | undefined> {
    return await hostCall((h) => h.config.get(key)) as T | undefined;
  },
  async set(key: string, value: unknown): Promise<void> {
    await hostCall((h) => h.config.set(key, value));
  },
};

/** Reserved — pane-control registration from scripts arrives after Phase 1. */
export const paneControls = {
  register(): never {
    throw new Error(
      "paneControls is not available in Phase 1 — pane-control registration from scripts " +
        "is planned for a later phase.",
    );
  },
};
