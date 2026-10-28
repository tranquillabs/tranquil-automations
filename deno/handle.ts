// The form API shared by Tab and Frame (ADR-0026). Both are a document reached over one CDP
// connection; they differ only in how that connection is found and how host focus is given.
//
// Every page verb goes through #page: the grant it needs, the site it acts on (`sites=`), the
// parts check for writes, and the per-run action log. The coverage test (test/deno/grants_test.ts) fails if a
// public method skips it.
import { CdpError } from "./cdp.ts";
import type { CdpConnection } from "./cdp.ts";
import type { Page } from "./page.ts";
import { requireGrant } from "./rpc.ts";
import type { Capability } from "./grants.ts";
import { checkingParts } from "./context.ts";
import { canSubmit, requireSite } from "./guard.ts";
import { logAction } from "./log.ts";
import { createFormsRuntime } from "./forms/runtime.ts";
import * as forms from "./forms/actions.ts";
import { draftCustomParts } from "./forms/map.ts";
import { describeTarget, FieldError, toWireParts } from "./forms/types.ts";
import type { Clickable, CustomPartsMap, Field, Filled, Target, Value, WireCustomParts } from "./forms/types.ts";

// A short hash of a source text: FNV-1a, 32 bits. Any change to the text changes it; it is not a
// security measure, only a way to tell two builds of the runtime apart.
function sourceHash(text: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16);
}

// The page runtime is shipped as source on each call and created once per document, kept on the
// isolated world's global (re-created after navigation, which drops it). It is kept with the hash
// of the source it was built from, so a page holding a runtime from any other build of the SDK (an
// update, or an edit in development) gets a fresh one: nothing to bump by hand.
const RUNTIME_SOURCE = createFormsRuntime.toString();
const RUNTIME_HASH = sourceHash(RUNTIME_SOURCE);
// The script's custom parts maps travel with every call, as data: they never change the source.
const RUNTIME_CALL = `function (hash, name, args, customParts) {
  if (!globalThis.__tqForms || globalThis.__tqFormsHash !== hash) {
    globalThis.__tqForms = (${RUNTIME_SOURCE})(globalThis);
    globalThis.__tqFormsHash = hash;
  }
  globalThis.__tqForms.useCustomParts(customParts);
  return globalThis.__tqForms[name](...args);
}`;

// Page code as the script wrote it. It is only ever sent as source text, so any function fits.
type PageFn = (...args: never[]) => unknown;

export function hostOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

export abstract class PageHandle {
  /** The CDP connection to this document's target. */
  protected abstract connection(): Promise<CdpConnection>;
  /** Give this document host-level keyboard focus (keys are dropped otherwise). */
  protected abstract focusHost(): Promise<void>;

  #customParts: CustomPartsMap[] = [];
  #wireParts: WireCustomParts = {};

  /**
   * Tell the form verbs where this page keeps what web standards don't describe: a field's shown
   * value, what opens it, its clear button. Optional, and only for a form that isn't built to
   * standards when the default verbs should still drive it. Plain data, never code; it applies to
   * every later call on this tab or frame, and `tab.frame()` starts with the tab's maps.
   *
   *     tab.useCustomParts({ value: ".picker__value", open: ".picker__control" });
   *
   * Several maps combine. Calling it again replaces the maps; with no arguments, it clears them.
   */
  useCustomParts(...maps: CustomPartsMap[]): void {
    this.#wireParts = toWireParts(maps); // throws on a malformed map, before anything is kept
    this.#customParts = [...maps];
  }

  /** @internal The maps in use, for a frame to start from. */
  _customParts(): CustomPartsMap[] {
    return [...this.#customParts];
  }

  #driver(): forms.Driver {
    // Opt-in timing trace for diagnosing slow steps: set globalThis.__tqSdkTrace = true.
    const trace = async <T>(what: string, fn: () => Promise<T>): Promise<T> => {
      if (!(globalThis as { __tqSdkTrace?: boolean }).__tqSdkTrace) return await fn();
      const t0 = performance.now();
      try {
        return await fn();
      } finally {
        console.log(`  [sdk] ${what} ${Math.round(performance.now() - t0)}ms`);
      }
    };
    return {
      runtime: (name, ...args) =>
        trace(`runtime.${name}`, async () =>
          (await this.connection()).callInWorld(RUNTIME_CALL, [RUNTIME_HASH, name, args, this.#wireParts])),
      insertText: (text) => trace("insertText", async () => (await this.connection()).insertText(text)),
      pressKey: (key) => trace(`pressKey ${key}`, async () => (await this.connection()).pressKey(key)),
      click: (x, y) => trace("click", async () => (await this.connection()).mouseClick(x, y)),
      setFiles: async (paths) => {
        const conn = await this.connection();
        const objectId = await conn.callInWorldForObject(
          "function () { return globalThis.__tqForms.pendingUploadElement(); }",
        );
        if (!objectId) throw new Error("upload target vanished before files could be set");
        try {
          await conn.setFileInputFiles(objectId, paths);
        } finally {
          await conn.releaseObject(objectId);
        }
      },
      focusHost: () => this.focusHost(),
    };
  }

  /**
   * Run one page verb: check its grant, then the page's site, then act (or, for a write in a
   * parts check, check its target and parts instead), and log the outcome. Refusals are logged too.
   */
  async #page<T>(verb: string, grant: Capability, target: Target | undefined, act: () => Promise<T>, check?: () => Promise<T>): Promise<T> {
    requireGrant(grant, `${verb}()`);
    const t0 = performance.now();
    let url = "";
    let outcome = "ok";
    try {
      url = await this.#evaluate<string>("location.href", []);
      requireSite(url, `${verb}${target !== undefined ? ` ${describeTarget(target)}` : ""}`);
      if (check && checkingParts) {
        outcome = "checked";
        return await check();
      }
      return await act();
    } catch (e) {
      outcome = e instanceof FieldError ? e.code : "error";
      throw e;
    } finally {
      await logAction({
        verb,
        ...(target !== undefined ? { target: describeTarget(target) } : {}),
        site: hostOf(url),
        outcome,
        ms: Math.round(performance.now() - t0),
      });
    }
  }

  /**
   * Run page code (needs `page-js`). Tabs and frames both have it. A function receives the page
   * scope first, typed by the `Page` declaration, then the JSON-serializable arguments; a
   * string is an expression.
   *
   *     const title = await tab.evaluate((page) => page.document.title);
   *     const n = await tab.evaluate((page, sel: string) => page.document.querySelectorAll(sel).length, "p");
   *
   * Typing: with no type argument, a function's arguments are checked against its parameters and
   * its return type is the result's. Naming the result (`evaluate<string[]>(fn, n)`) checks the
   * function's return against it, but not the arguments, since TypeScript cannot infer some type
   * arguments and take others. A string's result is `unknown` unless named, by a type argument
   * (`evaluate<string>("document.title")`) or by the type of the variable it is assigned to.
   */
  evaluate<T, A extends unknown[]>(fn: (page: Page, ...args: A) => T | Promise<T>, ...args: A): Promise<T>;
  // Only with a named result: T defaults to never and is not inferred, so an unnamed call skips this.
  evaluate<T = never>(fn: (page: Page, ...args: never[]) => NoInfer<T> | Promise<NoInfer<T>>, ...args: unknown[]): Promise<T>;
  evaluate<T = unknown>(expression: string): Promise<T>;
  async evaluate<T>(fn: PageFn | string, ...args: unknown[]): Promise<T> {
    return await this.#page("evaluate", "page-js", undefined, () => this.#evaluate<T>(fn, args));
  }

  async #evaluate<T>(fn: PageFn | string, args: unknown[]): Promise<T> {
    const conn = await this.connection();
    if (typeof fn === "string") return await conn.evaluate<T>(fn);
    // The callback gets the page scope first (ADR-0026), then the script's arguments.
    return await conn.callFunction<T>(`function (...args) { return (${fn.toString()})(globalThis, ...args); }`, args);
  }

  /**
   * Wait for a target to be visible, or with `state: "hidden"` to be gone or hidden. Unlike the
   * verbs that act, it needs no unique match: any visible match will do ("wait for results").
   * Throws a FieldError `timeout` saying what it found instead. A function is page code
   * instead: it is polled until it returns something truthy (needs `page-js`).
   *
   *     await tab.waitFor({ role: "button", name: "Next" });
   *     await tab.waitFor({ text: "Saving…" }, { state: "hidden", timeout: 15000 });
   */
  async waitFor(
    target: Target | ((page: Page) => unknown),
    opts: { state?: "visible" | "hidden"; timeout?: number; interval?: number } = {},
  ): Promise<void> {
    if (typeof target !== "function") {
      return await this.#page("waitFor", "tabs", target, () => forms.waitFor(this.#driver(), target, opts));
    }
    await this.#page("waitFor", "page-js", undefined, async () => {
      const { timeout = 8000, interval = 200 } = opts;
      const t0 = Date.now();
      for (;;) {
        if (await this.#evaluate<boolean>(target, [])) return;
        if (Date.now() - t0 > timeout) throw new CdpError(`waitFor timed out: ${target.toString().slice(0, 80)}`);
        await new Promise((r) => setTimeout(r, interval));
      }
    });
  }

  /**
   * The visible text of the element a target names, with line breaks kept: a confirmation
   * number, a status message, a result. Needs only `tabs`, and the same exactly-one-match rule
   * as the verbs. (A field's value is in `fields()`, not here: inputs have no text.)
   *
   *     const ref = await tab.text({ text: /^Application ID/ });
   */
  async text(target: Target, opts: { timeout?: number } = {}): Promise<string> {
    return await this.#page("text", "tabs", target, () => forms.text(this.#driver(), target, opts));
  }

  /** An attribute of the element a target names (`href`, `data-id`, …), or null. Needs `tabs`. */
  async attr(target: Target, name: string, opts: { timeout?: number } = {}): Promise<string | null> {
    return await this.#page("attr", "tabs", target, () => forms.attr(this.#driver(), target, name, opts));
  }

  /**
   * The buttons, links, tabs and menu items on the page, each with a verified target: the
   * things to `click` that are not fields. Links outside the form's own area are left out
   * unless `all` is set. At most 80 are listed; `total` says how many there are.
   */
  async clickables(opts: { within?: Target; all?: boolean } = {}): Promise<{ clickables: Clickable[]; total: number }> {
    return await this.#page("clickables", "tabs", opts.within, () => forms.clickables(this.#driver(), opts));
  }

  /**
   * The form fields on the page (or inside `within`): each with a verified `target` that
   * matches it and nothing else, its kind, value, constraints and validation state. Refs are
   * valid for the current document only; targets are what scripts keep.
   */
  async fields(opts: { within?: Target } = {}): Promise<Field[]> {
    return await this.#page("fields", "tabs", opts.within, () => forms.fields(this.#driver(), opts.within));
  }

  /**
   * @internal For SDK: Map Custom Parts (the built-in script), not the script API: a
   * draft custom parts map for this page, as TypeScript. Only reads the page.
   */
  async _mapCustomParts(): Promise<string> {
    return await this.#page("mapCustomParts", "tabs", undefined, async () =>
      draftCustomParts(this.#driver(), hostOf(await this.#evaluate<string>("location.href", []))));
  }

  /**
   * Set one field and verify it: text, a select or combobox option, checkbox state, a radio or
   * Yes/No choice, or a file. Commits with a real blur so the page's validation runs. Throws a
   * FieldError (with a `code`) when it cannot. A password, card or one-time-code field is
   * treated as `sensitive` automatically.
   *
   *     await tab.fill({ label: "Email" }, "ada@example.com");
   *     await tab.fill({ label: "Do you need sponsorship?" }, "No");
   *     await tab.fill({ label: "Skills" }, ["TypeScript", "Go"]);
   */
  async fill(target: Target, value: Value, opts: { sensitive?: boolean; timeout?: number } = {}): Promise<Filled> {
    return await this.#page(
      "fill",
      "forms",
      target,
      () => forms.fill(this.#driver(), target, value, opts),
      () => forms.checkTarget(this.#driver(), "fill", target, value, opts),
    );
  }

  /** Empty a field: text, selection, checkboxes or attached files. */
  async clear(target: Target, opts: { timeout?: number } = {}): Promise<Filled> {
    return await this.#page(
      "clear",
      "forms",
      target,
      () => forms.clear(this.#driver(), target, opts),
      () => forms.checkTarget(this.#driver(), "clear", target, null, opts),
    );
  }

  /**
   * Attach files to a file input, or to the one behind a styled Upload button. Paths resolve
   * against the script's folder and must be readable under its `read=` grant. An input already
   * holding the same files is left alone.
   */
  async upload(target: Target, path: string | string[], opts: { timeout?: number } = {}): Promise<Filled> {
    return await this.#page(
      "upload",
      "forms",
      target,
      () => forms.upload(this.#driver(), target, path, opts),
      () => forms.checkTarget(this.#driver(), "upload", target, path, opts),
    );
  }

  /**
   * A trusted click on an element. Refused with `covered` if something else is on top. Without
   * the `submit` grant and a yes to the run's most recent ui.confirm, a click that would submit a
   * form is stopped and refused with `not_permitted`, as is one on a button named like Submit,
   * Send, Pay or Place order.
   */
  async click(target: Target, opts: { timeout?: number } = {}): Promise<void> {
    const maySubmit = canSubmit();
    await this.#page(
      "click",
      "forms",
      target,
      () => forms.click(this.#driver(), target, { ...opts, maySubmit }),
      async () => void (await forms.checkTarget(this.#driver(), "click", target, null, { ...opts, maySubmit })),
    );
  }

  /**
   * Press a key in the focused element: "Enter", "Escape", "Tab", "ArrowDown", … Without the
   * `submit` grant and a yes to the run's most recent ui.confirm, a key that submits a form
   * (Enter in a field) is stopped and refused.
   */
  async press(key: string): Promise<void> {
    const maySubmit = canSubmit();
    await this.#page(
      "press",
      "forms",
      undefined,
      () => forms.press(this.#driver(), key, { maySubmit }),
      async () => void (await forms.checkTarget(this.#driver(), "press", null, key)),
    );
  }
}

