// The Page declaration (ADR-0026): every web API that code running inside a page may use, in
// one reviewable file. DOM tree and form-element types come, type-only, from Tranquil's fork of
// deno-dom, which exports them as module classes; TypeScript cannot scope the global `dom` lib
// to page callbacks, so it is not used at all. Members a parser cannot have (layout, focus,
// live validity, timing, events) are declared below, grouped by purpose.
//
// `Page` is a type contract, not a sandbox: at run time page code receives the real global
// object. Extending this file is an additive change to the SDK contract.
import type * as Dom from "https://raw.githubusercontent.com/tranquillabs/deno-dom/v0.1.56-tq.1/src/api.ts";

// ---- layout, focus and scrolling (every element) ----------------------------------------

export interface Rect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly top: number;
  readonly left: number;
  readonly right: number;
  readonly bottom: number;
}

export interface BrowserElementMembers {
  getBoundingClientRect(): Rect;
  getClientRects(): ArrayLike<Rect>;
  checkVisibility(options?: { checkOpacity?: boolean; checkVisibilityCSS?: boolean }): boolean;
  scrollIntoView(options?: { block?: "start" | "center" | "end" | "nearest"; inline?: string }): void;
  focus(options?: { preventScroll?: boolean }): void;
  blur(): void;
  click(): void;
  readonly isConnected: boolean;
  /** A bitmask of how `other` sits relative to this node (4: follows, 2: precedes). */
  compareDocumentPosition(other: Dom.Node): number;
  dispatchEvent(event: Event): boolean;
  /** Inline style. Typed loosely: any CSS property name, as a camelCase string property. */
  readonly style: StyleDeclaration;
}

export interface StyleDeclaration {
  cssText: string;
  setProperty(name: string, value: string, priority?: string): void;
  removeProperty(name: string): string;
  [property: string]: unknown;
}

/** A static list of elements, as a browser's NodeList is: iterable and indexable, no `.map`. */
export interface ElementList<T> extends Iterable<T>, ArrayLike<T> {
  forEach(callback: (element: T, index: number) => void): void;
  item(index: number): T | null;
}

/** Queries and tree walks that return browser-typed elements (listed first so they win). */
export interface ElementQueries {
  querySelector<T extends Element = Element>(selectors: string): T | null;
  querySelectorAll<T extends Element = Element>(selectors: string): ElementList<T>;
  closest<T extends Element = Element>(selectors: string): T | null;
  readonly parentElement: Element | null;
  readonly children: ElementList<Element>;
  readonly firstElementChild: Element | null;
  readonly lastElementChild: Element | null;
  readonly nextElementSibling: Element | null;
  readonly previousElementSibling: Element | null;
}

export type Element = ElementQueries & Dom.Element & BrowserElementMembers;

// ---- forms: live control state the parser cannot know -----------------------------------

export interface ValidityState {
  readonly valid: boolean;
  readonly valueMissing: boolean;
  readonly typeMismatch: boolean;
  readonly patternMismatch: boolean;
  readonly tooLong: boolean;
  readonly tooShort: boolean;
}

export interface FileListLike {
  readonly length: number;
  [index: number]: { readonly name: string; readonly size: number; readonly type: string };
}

export interface LiveControlMembers {
  readonly validity: ValidityState;
  readonly validationMessage: string;
  readonly willValidate: boolean;
}

export type HTMLInputElement =
  & Dom.HTMLInputElement
  & BrowserElementMembers
  & LiveControlMembers
  & {
    files: FileListLike | null;
    selectionStart: number | null;
    selectionEnd: number | null;
    select(): void;
    setSelectionRange(start: number, end: number): void;
  };

export type HTMLTextAreaElement =
  & Dom.HTMLTextAreaElement
  & BrowserElementMembers
  & LiveControlMembers
  & { select(): void; setSelectionRange(start: number, end: number): void };

export type HTMLSelectElement = Dom.HTMLSelectElement & BrowserElementMembers & LiveControlMembers;
export type HTMLOptionElement = Dom.HTMLOptionElement & BrowserElementMembers;
export type HTMLLabelElement = Dom.HTMLLabelElement & BrowserElementMembers;
export type HTMLButtonElement = Dom.HTMLButtonElement & BrowserElementMembers;
export type HTMLFormElement = Dom.HTMLFormElement & BrowserElementMembers;

export interface DocumentQueries {
  querySelector<T extends Element = Element>(selectors: string): T | null;
  querySelectorAll<T extends Element = Element>(selectors: string): ElementList<T>;
  getElementById<T extends Element = Element>(id: string): T | null;
  createElement<T extends Element = Element>(tagName: string): T;
  readonly body: Element;
  readonly documentElement: Element;
  title: string;
}

export type Document = DocumentQueries & Dom.Document & {
  readonly activeElement: Element | null;
  hasFocus(): boolean;
  elementFromPoint(x: number, y: number): Element | null;
  elementsFromPoint(x: number, y: number): Element[];
};

// ---- timing and observation --------------------------------------------------------------

export interface MutationObserverLike {
  observe(target: Dom.Node, options: { childList?: boolean; subtree?: boolean; attributes?: boolean }): void;
  disconnect(): void;
}

export interface ComputedStyle {
  readonly display: string;
  readonly visibility: string;
  readonly opacity: string;
  readonly pointerEvents: string;
  /** For a `::before`/`::after` pseudo-element: its generated content. */
  readonly content: string;
}

// ---- sensitive groups (listed by the lint plugin and the consent prompt) -----------------

/** Network as the signed-in user. */
export interface NetworkApis {
  fetch: typeof fetch;
}

/** Credentials and storage. */
export interface StorageApis {
  readonly localStorage: Storage;
  readonly sessionStorage: Storage;
}

/** Navigation away from the current document. */
export interface NavigationApis {
  readonly location: { href: string; assign(url: string): void; reload(): void };
  open(url?: string, target?: string): unknown;
  readonly history: { back(): void; forward(): void; readonly length: number };
}

// ---- the page scope ---------------------------------------------------------------------

/** What page code receives as its first argument (`evaluate((page) => …)`). */
export interface Page extends NetworkApis, StorageApis, NavigationApis {
  readonly document: Document & { cookie: string };
  readonly innerWidth: number;
  readonly innerHeight: number;
  readonly scrollX: number;
  readonly scrollY: number;
  getComputedStyle(element: Dom.Element, pseudoElement?: string): ComputedStyle;
  addEventListener(type: string, listener: (event: Event) => void, options?: boolean | { capture?: boolean }): void;
  requestAnimationFrame(callback: (time: number) => void): number;
  setTimeout(callback: () => void, ms?: number): number;
  readonly MutationObserver: new (callback: () => void) => MutationObserverLike;
  readonly InputEvent: new (type: string, init?: { bubbles?: boolean; inputType?: string; data?: string }) => Event;
  readonly Event: typeof Event;
  readonly DataTransfer: new () => { readonly files: FileListLike };
  readonly CSS: { escape(value: string): string };
}
