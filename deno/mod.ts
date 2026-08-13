// tranquil/automation — the script API (ADR-0022 specific 6). Scripts are plain Deno
// TypeScript run in a sandboxed subprocess; app capabilities go over the token bridge to the
// host renderer, browser control goes direct over CDP.
//
//   import { tabs, ui, files } from "tranquil/automation";
//
//   const tab = await tabs.active();
//   const title = await tab.evaluate(() => document.title);
//   await ui.open(files.write("title.txt", title), { split: "down" });
import { context } from "./context.ts";
import { host, hostCall } from "./rpc.ts";

export { context } from "./context.ts";
export type { Trigger } from "./context.ts";
export { Tab, tabs } from "./tabs.ts";
export type { TabDescriptor } from "./tabs.ts";

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
  async notify(
    message: string,
    options: { level?: "info" | "success" | "warning" | "error" } = {},
  ) {
    await hostCall((h) => h.ui.notify(message, options.level ?? "info"));
  },
  /** Terminal-style status line: log to the run output AND surface a popup. */
  async status(
    message: string,
    options: { level?: "info" | "success" | "warning" | "error" } = {},
  ) {
    const level = options.level ?? "info";
    if (level === "error" || level === "warning") console.error(message);
    else console.log(message);
    await ui.notify(message, { level });
  },
};

/** The app clipboard. */
export const clipboard = {
  async read(): Promise<string> {
    return await hostCall((h) => h.clipboard.read());
  },
  async write(text: string): Promise<void> {
    await hostCall((h) => h.clipboard.write(text));
  },
};

/** The host workspace. */
export const workspace = {
  async projectDir(): Promise<string> {
    return await hostCall((h) => h.workspace.projectDir());
  },
};

/**
 * Per-script persistent state, namespaced under the app's config
 * (tranquil-automations.scriptState.*). Scripts can no longer write arbitrary app config —
 * a deliberate tightening over the old runner.
 */
export const config = {
  // deno-lint-ignore no-explicit-any
  async get(key: string): Promise<any> {
    return await hostCall((h) => h.config.get(key));
  },
  // deno-lint-ignore no-explicit-any
  async set(key: string, value: any): Promise<void> {
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
