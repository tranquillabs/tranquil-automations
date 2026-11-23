// What lib/run-tab.js decides: which browser tab a run's `tabs.active()` acts on, captured when the
// run starts. Types only.
import type { Webview } from "./browser-pages.ts";

/** The workspace when a run starts: the item with focus, and the item showing in each visible pane. */
export interface RunStartView {
  focusedItem: unknown;
  shownItems: readonly unknown[];
}

/** The browser bits the picker needs, passed in so it stays free of Pulsar. */
export interface RunTabHelpers {
  webviewOf(item: unknown): Webview | null;
  isWebURL(url: unknown): boolean;
}

/** The run's tab, or why there is none. */
export type RunTab = { ok: true; webview: Webview } | { ok: false; message: string };

/** What lib/run-tab.js exports, for the TypeScript that loads it (the tests). */
export interface RunTabModule {
  pickRunTab(view: RunStartView, helpers: RunTabHelpers): RunTab;
}
