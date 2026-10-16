// The form API's contract types (ADR-0026). Changes here are additive only; an ErrorCode is
// never removed or repurposed.

/** An opaque reference to a field, from `fields()`. Valid for the current document only. */
export interface FieldRef {
  readonly ref: string;
}

/**
 * What a form method acts on.
 *
 * - a CSS selector string;
 * - `{ label }`: the field's label or question text (case-, accent- and whitespace-insensitive,
 *   a trailing required marker such as `*` ignored), or a RegExp tested against it;
 * - `{ role, name }`: an ARIA role, optionally with its accessible name;
 * - `{ text }`: the visible text of an element, for things with no role or label (a clickable
 *   div, a link styled as a button). Text that belongs to a `<label>` means its field;
 * - a `FieldRef` from `fields()`.
 *
 * Text and names match exactly after ignoring case, accents, extra spaces and a trailing `*`,
 * `:` or "(optional)"; a RegExp matches anything it tests true on. A target matches only
 * elements a person could see, and must match exactly one.
 *
 * `within` narrows the search to inside another target, to tell apart repeated questions.
 */
export type Target =
  | string
  | { label: string | RegExp; within?: Target }
  | { role: string; name?: string | RegExp; within?: Target }
  | { text: string | RegExp; within?: Target }
  | FieldRef;

/** A value to fill: text or an option, a checkbox state, or several options/checkboxes. */
export type Value = string | boolean | string[];

export type Kind = "text" | "select" | "checkbox" | "radio" | "buttons" | "file" | "other";

export interface Field {
  ref: FieldRef;
  label: string;
  /**
   * A ready-to-paste target that matched this field and nothing else when `fields()` ran:
   * `{ label }` when the label is unique, `{ label, within }` when it repeats, a CSS selector
   * on a stable attribute otherwise. Absent when no unique target could be built (two identical
   * fields with nothing stable around them): use the ref within this run, or write a selector.
   */
  target?: Target;
  /**
   * Other targets, verified the same way, that survive copy changes and translations: stable
   * ids, `name` attributes, test hooks. Use one when the label is likely to change.
   */
  alternates?: Target[];
  kind: Kind;
  required: boolean;
  /** Takes several values (a multi-select, a checkbox group, a multi-file input): pass a `string[]`. */
  multiple: boolean;
  value: Value | null;
  options?: string[];
  /** For text fields: the input type ("email", "tel", "date", "textarea", …). */
  inputType?: string;
  maxLength?: number;
  /** The `pattern` attribute, a regular expression the value must match. */
  pattern?: string;
  /**
   * The field holds a secret (a password, card number or one-time code). Its value is withheld
   * from listings (fields()), and `fill` treats it as `sensitive` without being told.
   */
  sensitive?: true;
  /** Whether the field is still unanswered: no text, no option, nothing checked or attached. */
  empty: boolean;
  /** Help text tied to the field (`aria-describedby`), not counting error messages. */
  hint?: string;
  /** The placeholder shown in an empty field: often an example or a prompt, not an instruction. */
  placeholder?: string;
  invalid: boolean;
  error?: string;
}

/** Something to click that is not a field: a button, link, tab or menu item, from `clickables()`. */
export interface Clickable {
  /** Its ARIA role ("button", "link", "tab", …), or its tag when it has none ("summary"). */
  role: string;
  /** Its accessible name. */
  name: string;
  /** A ready-to-paste target verified to match it and nothing else; absent when none could be. */
  target?: Target;
  alternates?: Target[];
}

export interface Filled {
  label: string;
  kind: Kind;
  value: Value | null;
  invalid: boolean;
  error?: string;
}

export type ErrorCode =
  | "not_found"
  | "ambiguous"
  | "stale_ref"
  | "covered"
  | "not_editable"
  | "no_option"
  | "not_committed"
  | "timeout"
  | "not_permitted";

/**
 * A form action that could not complete. The message states what was attempted, the closest
 * candidates as ready-to-paste targets, and one next step.
 */
export class FieldError extends Error {
  readonly code: ErrorCode;
  readonly candidates?: string[];
  readonly options?: string[];

  constructor(
    code: ErrorCode,
    message: string,
    extra: { candidates?: string[]; options?: string[]; cause?: unknown } = {},
  ) {
    super(`${code}: ${message}`, extra.cause === undefined ? undefined : { cause: extra.cause });
    this.name = "FieldError";
    this.code = code;
    if (extra.candidates?.length) this.candidates = extra.candidates;
    if (extra.options?.length) this.options = extra.options;
  }
}

/**
 * Where a form that isn't built to web standards keeps what HTML and ARIA don't describe, so the
 * default verbs (`fill`, `clear`, `fields()`) can still drive it. Optional: a standards-built form
 * needs none. Plain data, never code: the SDK only looks elements up with these selectors.
 *
 * Selectors are searched near a field: the field itself and its nearest four ancestors.
 *
 *     tab.useCustomParts({ value: ".picker__value", open: ".picker__control" });
 */
export interface CustomPartsMap {
  /** The element that shows a single-choice field's chosen value. */
  value?: string;
  /** Each element that shows one chosen value of a multiple-choice field. */
  values?: string;
  /** Matches the field, or an ancestor of it, when the field takes several values. */
  multiple?: string;
  /** What to press to open the field, when the field itself is too small to press. */
  open?: string;
  /** The field's clear button. */
  clear?: string;
  /** Ids and test-hook values the page generates afresh on each load; never used in targets. */
  unstableIds?: RegExp;
}

// ---- wire form (Deno → page runtime) ----------------------------------------------------

export type WireMatcher = { text: string } | { re: { source: string; flags: string } };

/** Custom parts maps combined into one, as plain JSON for the page runtime. */
export type WireCustomParts = {
  value?: string;
  values?: string;
  multiple?: string;
  open?: string;
  clear?: string;
  unstableIds?: { source: string; flags: string }[];
};

const PART_SELECTORS = ["value", "values", "multiple", "open", "clear"] as const;

/**
 * Combine maps into one for the page runtime: each selector becomes the union of the maps'
 * selectors, and every `unstableIds` pattern applies. Throws a TypeError on a malformed map.
 */
export function toWireParts(maps: readonly CustomPartsMap[]): WireCustomParts {
  const out: WireCustomParts = {};
  for (const map of maps) {
    if (!map || typeof map !== "object") throw new TypeError(`Invalid custom parts map ${JSON.stringify(map)}`);
    for (const part of PART_SELECTORS) {
      const sel = map[part];
      if (sel === undefined) continue;
      if (typeof sel !== "string" || sel.trim() === "") {
        throw new TypeError(`Custom parts map: \`${part}\` must be a non-empty CSS selector string`);
      }
      out[part] = out[part] ? `${out[part]}, ${sel}` : sel;
    }
    if (map.unstableIds !== undefined) {
      if (!(map.unstableIds instanceof RegExp)) throw new TypeError("Custom parts map: `unstableIds` must be a RegExp");
      (out.unstableIds ??= []).push({ source: map.unstableIds.source, flags: map.unstableIds.flags });
    }
  }
  return out;
}

export type WireTarget =
  | { css: string; within?: WireTarget }
  | { label: WireMatcher; within?: WireTarget }
  | { role: string; name?: WireMatcher; within?: WireTarget }
  | { text: WireMatcher; within?: WireTarget }
  | { ref: string };

function matcher(m: string | RegExp): WireMatcher {
  return typeof m === "string" ? { text: m } : { re: { source: m.source, flags: m.flags } };
}

/** Turn a Target into plain JSON for the page runtime; throws a TypeError on a malformed one. */
export function toWire(target: Target): WireTarget {
  if (typeof target === "string") {
    if (target.trim() === "") throw new TypeError("Empty CSS selector target");
    return { css: target };
  }
  if (target && typeof target === "object") {
    if ("ref" in target && typeof target.ref === "string") return { ref: target.ref };
    const within = "within" in target && target.within !== undefined
      ? { within: toWire(target.within) }
      : {};
    if ("label" in target) return { label: matcher(target.label), ...within };
    if ("text" in target) return { text: matcher(target.text), ...within };
    if ("role" in target && typeof target.role === "string") {
      return {
        role: target.role,
        ...(target.name !== undefined ? { name: matcher(target.name) } : {}),
        ...within,
      };
    }
  }
  throw new TypeError(
    `Invalid target ${JSON.stringify(target)}: use a CSS string, { label }, { role, name }, { text } or a ref from fields()`,
  );
}

/** A target as a short readable string, for messages. */
export function describeTarget(target: Target): string {
  if (typeof target === "string") return JSON.stringify(target);
  if ("ref" in target) return `ref ${target.ref}`;
  const show = (m: string | RegExp) => (typeof m === "string" ? JSON.stringify(m) : String(m));
  const within = "within" in target && target.within ? ` within ${describeTarget(target.within)}` : "";
  if ("label" in target) return `{ label: ${show(target.label)} }${within}`;
  if ("text" in target) return `{ text: ${show(target.text)} }${within}`;
  return `{ role: ${JSON.stringify(target.role)}${target.name !== undefined ? `, name: ${show(target.name)}` : ""} }${within}`;
}

/** A target as TypeScript source, ready to paste into a script. */
export function targetSource(target: Target): string {
  if (typeof target === "string") return quote(target);
  if ("ref" in target) return `{ ref: ${JSON.stringify(target.ref)} }`;
  const show = (m: string | RegExp) => (typeof m === "string" ? JSON.stringify(m) : String(m));
  const within = "within" in target && target.within !== undefined ? `, within: ${targetSource(target.within)}` : "";
  if ("label" in target) return `{ label: ${show(target.label)}${within} }`;
  if ("text" in target) return `{ text: ${show(target.text)}${within} }`;
  return `{ role: ${JSON.stringify(target.role)}${target.name !== undefined ? `, name: ${show(target.name)}` : ""}${within} }`;
}

/** A string literal, in single quotes when that avoids escaping (CSS often holds double quotes). */
function quote(s: string): string {
  return s.includes('"') && !s.includes("'") ? `'${s.replace(/\\/g, "\\\\")}'` : JSON.stringify(s);
}
