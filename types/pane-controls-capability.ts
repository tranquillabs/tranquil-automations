// What lib/pane-controls-capability.js works with, typed against just the parts it uses. The module
// is plain JavaScript, checked through JSDoc that points here. The browser's tabs are in
// ./browser-pages.ts, and tranquil-rpc's session context in tranquil-rpc's own declarations. Types
// only.
import type { BrowserItem } from "./browser-pages.ts";

/** A retained action: calling it runs the page's function; it's disposed with the session. */
export type RetainedAction = (() => unknown) & { [Symbol.dispose](): void };

/** A page's action as Cap'n Web hands it over: a stub the page answers when it's called. */
export interface ActionStub {
  /** A copy this side owns: Cap'n Web disposes the original when the register() call returns. */
  dup(): RetainedAction;
}

/** One control a trusted page registers for its own pane (host.paneControls.register). */
export interface PageControl {
  id: string;
  /** A codicon name (preferred). */
  icon?: string;
  /** A literal Unicode fallback. */
  glyph?: string;
  title?: string;
  action: ActionStub;
}

/** A pane item that may know its address: a browser tab, or another item with a URI. */
export interface AddressedItem {
  getURL?(): string;
  getURI?(): string;
}

/** What pane-controls.js hands a control's action on a click: the pane's active item. */
export interface ControlContext {
  item?: BrowserItem & AddressedItem;
}
