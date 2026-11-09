// What lib/runner-capabilities.js works with, typed against just the parts it uses. The module is
// plain JavaScript, checked through JSDoc that points here, so the editor knows each shape. The
// browser's tabs are in ./browser-pages.ts, and tranquil-rpc's session context and registration in
// tranquil-rpc's own declarations. Types only.
import type { BrowserItem, Webview } from "./browser-pages.ts";

/** A pane item that may be a text editor (ui.open reveals one that's already open). */
export interface EditorItem {
  getPath?(): string | undefined;
  getBuffer?(): { reload?(): void } | undefined;
}

/** One tab handle a run holds: its webview, whether it's off-screen, and its pane item. */
export interface TabEntry {
  webview: Webview;
  background: boolean;
  item: BrowserItem | null;
}

/** What a script gets for a tab: the handle's id, the page's address, the nonce in the page. */
export interface TabDescriptor {
  tabId: string;
  url: string;
  nonce: string;
}

/** Where tabs.open may put a tab: PANE_LOCATIONS in lib/runner-capabilities.js. */
export type PaneLocation = "center" | "right" | "bottom";

/** tabs.open's options, as the SDK sends them (deno/tabs.ts `tabs.open`). */
export interface OpenOptions {
  background?: boolean;
  /** "center", "right" or "bottom"; checked against PANE_LOCATIONS, since a script sends it. */
  location?: string;
  activate?: boolean;
  hideURLBar?: boolean;
}

/** A tabs.find query: an exact address, or a pattern sent as its source and flags. */
export type TabQuery = string | { regex: string; flags?: string };

/** A run's record (lib/run-manager.js), as far as ui.confirm reads it. */
export interface RunRecordLike {
  trigger: string;
  scriptPath: string;
}

/** The run manager (lib/run-manager.js), as far as the capabilities use it. */
export interface RunsLike {
  find(runId: string): RunRecordLike | undefined;
  recordAction(runId: string, entry: unknown): void;
  setResult(runId: string, value: unknown): void;
}
