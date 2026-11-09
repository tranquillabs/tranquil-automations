// What lib/browser-pages.js hands the rest of the package: tranquil-browser's tabs, as this package
// sees them, typed against just the parts it uses. The module is plain JavaScript, checked through
// JSDoc that points here. Types only.

/** A browser tab's <webview> element. */
export interface Webview {
  readonly isConnected: boolean;
  /** The tab's session partition (tranquil-browser lib/pages.js windowPartition). */
  readonly partition: string;
  getURL(): string;
  getWebContentsId(): number;
  isLoading(): boolean;
  executeJavaScript(code: string): Promise<unknown>;
  capturePage(): Promise<{ toPNG(): { toString(encoding: "base64"): string } }>;
  reload(): void;
  focus(): void;
  remove(): void;
}

/** A browser tab's pane item (tranquil-browser's model and view). */
export interface BrowserItem {
  view?: {
    /** The <webview>, wrapped by space-pen as an outlet. */
    htmlv?: Webview[];
    /** The address bar: a space-pen outlet (array-like) or the element itself. */
    urlbar?: ArrayLike<AddressBar> | AddressBar;
    toggleURLBar?(): void;
  };
  /** The options the tab was opened with; serialized, so they survive a window reload. */
  opt?: { hideURLBar?: boolean };
}

/** The address bar element: what hiding and showing it needs. */
export interface AddressBar {
  classList: { contains(name: string): boolean; toggle(name: string, force: boolean): void };
}
