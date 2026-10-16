// The SDK's page runtime (ADR-0026). One self-contained function, shipped to the page as
// source and installed into the SDK's isolated world, where it keeps element references and
// answers the form API's questions: what fields exist, which one a target means, what value it
// holds, whether it is valid. The same function runs offline on deno-dom (`fieldsOf`), so it
// must only use `page.*` and ECMAScript built-ins: no imports survive `toString()`.
//
// Everything here is implementation, not contract.
import type { Element, HTMLInputElement, HTMLSelectElement, Page } from "../page.ts";
import type { ErrorCode, WireCustomParts, WireMatcher, WireTarget } from "./types.ts";

/** The runtime's API, as createFormsRuntime returns it. */
export type FormsRuntime = ReturnType<typeof createFormsRuntime>;

export function createFormsRuntime(page: Page) {
  const doc = page.document;
  type El = Element;
  // What a control, or a custom element acting as one, may hold. All optional: elements differ,
  // and every use checks first. Web components often expose `value` too, so this is not a tag test.
  type MaybeControl = El & {
    value?: unknown;
    readonly labels?: ArrayLike<El> | null;
    readonly control?: El | null;
    disabled?: boolean;
    readOnly?: boolean;
    multiple?: boolean;
    maxLength?: number;
    files?: unknown;
    select?: () => void;
  };
  const maybe = (el: El): MaybeControl => el;
  type Entry = {
    el: El; // the primary element (the first member of a group)
    members: El[];
    kind: "text" | "select" | "checkbox" | "radio" | "buttons" | "file" | "other";
    labels: string[]; // own label first, then question text
    box?: El; // a button group's shared parent
    pick?: El; // the specific member a role/CSS target named, when the field is a group
  };
  type Fail = { ok: false; code: ErrorCode; message: string; candidates?: string[]; options?: string[]; wait?: boolean };

  type Scope = { querySelectorAll(s: string): ArrayLike<unknown> };

  // ---- text --------------------------------------------------------------------------------

  // Text has two forms here: `collapse` gives what a person reads, and `textKey` gives what two
  // texts are compared by. The key ignores case, accents, spacing and label markers, so "Email *"
  // and "email" are the same label, and it is the same in every locale, live or offline.

  /** Runs of whitespace become one space; the ends are trimmed. */
  const collapse = (s: string | null | undefined) => (s ?? "").replace(/\s+/g, " ").trim();

  // Markers a label may end with that are not part of its meaning: "Email *", "Phone:",
  // "Company (optional)", or several ("Email: *").
  const TRAILING_MARKERS = /(\s*(\*|:|\(required\)|\(optional\)))+\s*$/i;
  const stripMarkers = (s: string) => s.replace(TRAILING_MARKERS, "");

  /** The form two texts are compared by. */
  const textKey = (s: string) =>
    stripMarkers(collapse(s.normalize("NFKD").replace(/\p{M}/gu, ""))).toLowerCase();
  const sameText = (a: string, b: string) => textKey(a) === textKey(b);

  /** A test for a target's text (compared by key) or pattern (run on the collapsed text). */
  function textMatcher(m: WireMatcher): (text: string) => boolean {
    if ("text" in m) {
      const key = textKey(m.text);
      return (text) => textKey(text) === key;
    }
    const re = new RegExp(m.re.source, m.re.flags);
    return (text) => re.test(collapse(text));
  }

  // ---- element helpers ---------------------------------------------------------------------

  const attr = (el: El, name: string) => el.getAttribute(name);
  const tag = (el: El) => el.tagName;
  const inputType = (el: El) => (attr(el, "type") ?? "text").toLowerCase();
  const isConnected = (el: El) => {
    if (typeof el.isConnected === "boolean") return el.isConnected;
    let node: { readonly parentNode: El["parentNode"] } = el;
    while (node.parentNode) node = node.parentNode;
    return node === doc;
  };
  const safeMatches = (el: El, selector: string) => {
    try {
      return el.matches(selector);
    } catch {
      return false; // e.g. :user-invalid offline
    }
  };
  const ancestors = (el: El, max = 8) => {
    const out: El[] = [];
    let a = el.parentElement as El | null;
    while (a && out.length < max && tag(a) !== "BODY" && tag(a) !== "HTML") {
      out.push(a);
      a = a.parentElement as El | null;
    }
    return out;
  };

  const BUTTONISH_INPUT = new Set(["submit", "button", "reset", "image", "hidden"]);
  const CONTROL_SELECTOR = [
    "input",
    "textarea",
    "select",
    "[role=combobox]",
    "[role=textbox]",
    "[role=checkbox]",
    "[role=switch]",
    "[role=radio]",
    "[role=listbox]",
    "[contenteditable=true]",
    '[contenteditable=""]',
  ].join(",");

  function kindOf(el: El): Entry["kind"] {
    const role = attr(el, "role");
    if (tag(el) === "INPUT") {
      const t = inputType(el);
      if (t === "checkbox") return "checkbox";
      if (t === "radio") return "radio";
      if (t === "file") return "file";
      if (BUTTONISH_INPUT.has(t)) return "other";
      if (role === "combobox") return "select";
      return "text";
    }
    if (tag(el) === "TEXTAREA") return "text";
    if (tag(el) === "SELECT") return "select";
    if (role === "combobox" || role === "listbox") return "select";
    if (role === "checkbox" || role === "switch") return "checkbox";
    if (role === "radio") return "radio";
    if (role === "textbox" || attr(el, "contenteditable") !== null) return "text";
    return "other";
  }

  function hiddenOffline(el: El): boolean {
    for (const node of [el, ...ancestors(el, 50)]) {
      if (node.hasAttribute("hidden")) return true;
      if (/display\s*:\s*none/i.test(attr(node, "style") ?? "")) return true;
    }
    return false;
  }

  function visible(el: El): boolean {
    if (typeof el.checkVisibility === "function") {
      return el.checkVisibility({ checkVisibilityCSS: true });
    }
    return !hiddenOffline(el);
  }

  function ariaHidden(el: El): boolean {
    return [el, ...ancestors(el, 50)].some((n) => attr(n, "aria-hidden") === "true");
  }

  // ---- custom parts --------------------------------------------------------------------------
  //
  // A form that isn't built to web standards may keep a field's shown value, the control that
  // opens it or its clear button where HTML and ARIA don't say. A script can name them in a
  // custom parts map; with none, only the standards apply. The selectors are only ever queried.

  type Part = "value" | "values" | "multiple" | "open" | "clear";
  const PARTS: readonly Part[] = ["value", "values", "multiple", "open", "clear"];
  let parts: WireCustomParts = {};
  let unstableIds: RegExp[] = [];

  /** The field and the ancestors that belong to it alone: up to four, below any that holds another field. */
  function fieldBox(el: El): El[] {
    const out = [el];
    for (const a of ancestors(el, 4)) {
      const foreign = (Array.from(a.querySelectorAll(CONTROL_SELECTOR)) as El[]).some((c) =>
        c !== el && !el.contains(c) && !ariaHidden(c) && kindOf(c) !== "other"
      );
      if (foreign) break;
      out.push(a);
    }
    return out;
  }

  /** Where a part selector matches near a field: the closest level of its box that matches or holds a match. */
  function partsNear(el: El, sel: string): El[] {
    for (const level of fieldBox(el)) {
      if (level.matches(sel)) return [level];
      const hits = Array.from(level.querySelectorAll(sel)) as El[];
      if (hits.length) return hits;
    }
    return [];
  }

  /** The next step when a field's part isn't where web standards put it. */
  const MAP_HINT = (part: Part) =>
    `${
      part === "open"
        ? "if something around it opens it, name that"
        : part === "clear"
        ? "if it has a clear button, name it"
        : "if the page shows the choice elsewhere, name that"
    } as \`${part}\` in a custom parts map (SDK: Map Custom Parts finds what it can)`;

  /** The element a script's map names for one part of a field, if it named one and it is there. */
  function partOf(el: El, part: Part): El | null {
    const sel = parts[part];
    return sel ? partsNear(el, sel)[0] ?? null : null;
  }

  // ---- labels --------------------------------------------------------------------------------

  function textWithoutControls(node: El): string {
    let text = "";
    for (const child of node.childNodes) {
      if (child.nodeType === 3) text += child.textContent;
      else if (child.nodeType === 1) {
        const c = child as unknown as El;
        if (["SELECT", "TEXTAREA", "INPUT", "BUTTON", "SCRIPT", "STYLE"].includes(tag(c))) continue;
        text += " " + textWithoutControls(c);
      }
    }
    return collapse(text);
  }

  // ---- roles and accessible names ------------------------------------------------------------
  //
  // The W3C accessible-name computation (accname 1.2), for the parts pages and forms use: one
  // implementation behind `{ role, name }` targets, field labels and `{ text }` hits. It is
  // scored against the W3C conformance tests (tranquil-test-suite conformance/accname_test.ts).
  // Live, it reads computed styles; offline (deno-dom has no CSS) it falls back to the tag and
  // inline styles.

  const live = typeof doc.documentElement?.checkVisibility === "function";

  const NAME_FROM_CONTENT = new Set([
    "button", "cell", "checkbox", "columnheader", "gridcell", "heading", "link", "menuitem",
    "menuitemcheckbox", "menuitemradio", "option", "radio", "row", "rowheader", "switch", "tab",
    "tooltip", "treeitem",
  ]);

  function implicitRole(el: El): string {
    const t = tag(el);
    if (/^H[1-6]$/.test(t)) return "heading";
    switch (t) {
      case "A":
      case "AREA":
        return el.hasAttribute("href") ? "link" : "";
      case "BUTTON":
        return "button";
      case "INPUT": {
        const type = inputType(el);
        if (["button", "submit", "reset", "image"].includes(type)) return "button";
        if (type === "checkbox" || type === "radio") return type;
        if (type === "range") return "slider";
        if (type === "number") return "spinbutton";
        if (type === "search") return el.hasAttribute("list") ? "combobox" : "searchbox";
        if (["text", "email", "tel", "url", "password"].includes(type)) return el.hasAttribute("list") ? "combobox" : "textbox";
        return "";
      }
      case "SELECT":
        return el.hasAttribute("multiple") || Number(attr(el, "size")) > 1 ? "listbox" : "combobox";
      case "TEXTAREA":
        return "textbox";
      case "OPTION":
        return "option";
      case "IMG":
        return attr(el, "alt") === "" ? "presentation" : "img";
      case "UL":
      case "OL":
        return "list";
      case "LI":
        return "listitem";
      case "TABLE":
        return "table";
      case "TR":
        return "row";
      case "TD":
        return "cell";
      case "TH":
        return "columnheader";
      case "NAV":
        return "navigation";
      case "DIALOG":
        return "dialog";
      case "FIELDSET":
        return "group";
      case "FORM":
        return "form";
      case "MAIN":
        return "main";
      case "ARTICLE":
        return "article";
      case "PROGRESS":
        return "progressbar";
      case "HR":
        return "separator";
      default:
        return "";
    }
  }

  /** The element's role: an explicit `role` first, then the one HTML gives it. */
  function roleOf(el: El): string {
    const explicit = (attr(el, "role") ?? "").trim().split(/\s+/)[0];
    return explicit || implicitRole(el);
  }

  function styleOf(el: El, pseudo?: string) {
    return page.getComputedStyle(el, pseudo);
  }

  /**
   * How an element is hidden from assistive technology, which leaves it out of names unless it
   * is referenced directly. "subtree": it and everything in it. "self": only its own text
   * (visibility: hidden), since a child can be made visible again.
   */
  function hiddenKind(el: El): "subtree" | "self" | null {
    if (attr(el, "aria-hidden") === "true" || el.hasAttribute("hidden")) return "subtree";
    if (live) {
      const s = styleOf(el);
      if (s.display === "none") return "subtree";
      return s.visibility === "hidden" || s.visibility === "collapse" ? "self" : null;
    }
    const style = attr(el, "style") ?? "";
    if (/display\s*:\s*none/i.test(style)) return "subtree";
    return /visibility\s*:\s*(hidden|collapse)/i.test(style) ? "self" : null;
  }
  const hiddenForName = (el: El) => hiddenKind(el) !== null;

  const INLINE = new Set([
    "A", "ABBR", "B", "BDI", "BDO", "CITE", "CODE", "DATA", "DFN", "EM", "FONT", "I", "IMG", "KBD",
    "LABEL", "MARK", "Q", "S", "SAMP", "SMALL", "SPAN", "STRONG", "SUB", "SUP", "TIME", "U", "VAR",
    "INPUT", "SELECT", "TEXTAREA", "BUTTON",
  ]);

  /** Inline content joins its neighbours without a space; block content is set apart. */
  function isInline(el: El): boolean {
    if (live) return (styleOf(el).display ?? "inline").startsWith("inline");
    const inline = /display\s*:\s*(inline[\w-]*)/i.exec(attr(el, "style") ?? "");
    if (inline) return true;
    if (/display\s*:/i.test(attr(el, "style") ?? "")) return false;
    return INLINE.has(tag(el));
  }

  function pseudoText(el: El, which: "::before" | "::after"): string {
    if (!live) return "";
    const content = styleOf(el, which).content ?? "";
    const quoted = /^"((?:[^"\\]|\\.)*)"$/.exec(content);
    return quoted ? quoted[1] : "";
  }

  type NameCtx = { root: El; referenced: boolean; includeHidden: boolean; inContent: boolean; fallbacks: boolean };

  const EMBEDDED = new Set(["textbox", "searchbox", "combobox", "listbox", "slider", "spinbutton", "progressbar", "scrollbar"]);

  /** A control inside another element's name contributes its value (step 2E). */
  function embeddedValue(el: El): string {
    const role = roleOf(el);
    const anyEl = maybe(el);
    if (role === "textbox" || role === "searchbox") {
      return tag(el) === "INPUT" || tag(el) === "TEXTAREA" ? String(anyEl.value ?? "") : collapse(el.textContent);
    }
    if (role === "combobox" || role === "listbox") {
      if (tag(el) === "SELECT") return Array.from((el as unknown as HTMLSelectElement).selectedOptions).map((o) => collapse(o.text)).join(" ");
      if (tag(el) === "INPUT") return String(anyEl.value ?? "");
      const selected = Array.from(el.querySelectorAll('[role=option][aria-selected="true"]')) as El[];
      return selected.length ? selected.map((o) => collapse(o.textContent)).join(" ") : collapse(el.textContent);
    }
    return attr(el, "aria-valuetext") ?? attr(el, "aria-valuenow") ?? String(anyEl.value ?? "");
  }

  /** What HTML itself names an element with (step 2D): labels, alt, legend, caption, value. */
  function nativeName(el: El, ctx: NameCtx): string {
    const t = tag(el);
    const labels = maybe(el).labels;
    if (labels && labels.length) {
      const text = Array.from(labels).map((label) =>
        contentName(label, { ...ctx, inContent: true, referenced: true, includeHidden: ctx.includeHidden || hiddenForName(label) })
      ).join(" ");
      if (collapse(text)) return text;
    }
    if (t === "INPUT") {
      const type = inputType(el);
      if (type === "image") return attr(el, "alt") ?? attr(el, "value") ?? "";
      if (["button", "submit", "reset"].includes(type)) {
        return attr(el, "value") ?? (type === "submit" ? "Submit" : type === "reset" ? "Reset" : "");
      }
    }
    if (t === "IMG" || t === "AREA") return attr(el, "alt") ?? "";
    const caption = (selector: string) => {
      const child = Array.from(el.children).find((c) => (c as El).matches(selector)) as El | undefined;
      return child ? contentName(child, { ...ctx, inContent: true }) : "";
    };
    if (t === "FIELDSET") return caption("legend");
    if (t === "TABLE") return caption("caption");
    if (t === "FIGURE") return caption("figcaption");
    if (t.toLowerCase() === "svg") {
      const title = Array.from(el.children).find((c) => (c as El).tagName.toLowerCase() === "title") as El | undefined;
      return title ? collapse(title.textContent) : "";
    }
    return "";
  }

  /** Name from content (step 2F): text, child names, embedded control values, CSS content. */
  function contentName(el: El, ctx: NameCtx): string {
    const ownTextHidden = !ctx.includeHidden && hiddenKind(el) === "self";
    let out = ownTextHidden ? "" : pseudoText(el, "::before");
    for (const child of Array.from(el.childNodes)) {
      if (child.nodeType === 3) out += ownTextHidden ? "" : child.textContent ?? "";
      else if (child.nodeType === 1) {
        const c = child as unknown as El;
        if (c === ctx.root) continue; // the control being named, inside its own label
        if (["SCRIPT", "STYLE", "TEMPLATE", "NOSCRIPT"].includes(tag(c))) continue;
        const part = compute(c, { ...ctx, inContent: true });
        out += isInline(c) ? part : ` ${part} `;
      }
    }
    return out + (ownTextHidden ? "" : pseudoText(el, "::after"));
  }

  function compute(el: El, ctx: NameCtx): string {
    const isRoot = el === ctx.root && !ctx.inContent;
    if (!isRoot && !ctx.includeHidden && hiddenKind(el) === "subtree") return ""; // 2A (visibility: see contentName)
    const labelledBy = attr(el, "aria-labelledby");
    if (labelledBy && !ctx.referenced) { // 2B
      const text = labelledBy.split(/\s+/).map((id) => {
        const ref = doc.getElementById(id) as El | null;
        if (!ref) return "";
        return compute(ref, { ...ctx, referenced: true, inContent: ref !== ctx.root, includeHidden: ctx.includeHidden || hiddenForName(ref) });
      }).join(" ");
      if (collapse(text)) return text;
    }
    const embedded = ctx.inContent && el !== ctx.root && EMBEDDED.has(roleOf(el));
    if (embedded) return embeddedValue(el); // 2E
    const label = collapse(attr(el, "aria-label")); // 2C
    if (label) return label;
    const role = roleOf(el);
    if (role !== "presentation" && role !== "none") { // 2D
      const native = nativeName(el, ctx);
      if (collapse(native)) return native;
    }
    if (ctx.inContent || ctx.referenced || NAME_FROM_CONTENT.has(role) || tag(el) === "SUMMARY") { // 2F
      const text = contentName(el, ctx);
      if (collapse(text) || (ctx.inContent && text)) return text; // whitespace inside content still separates words
    }
    if (isRoot && !ctx.fallbacks) return "";
    const title = collapse(attr(el, "title")); // 2I
    if (title) return title;
    if (isRoot && (role === "textbox" || role === "searchbox" || role === "combobox")) {
      return collapse(attr(el, "placeholder")) || collapse(attr(el, "aria-placeholder"));
    }
    return "";
  }

  /**
   * The accessible name. With `fallbacks: false`, a tooltip or placeholder does not count: field
   * labels prefer the question text above a field to those.
   */
  function nameOf(el: El, opts: { fallbacks?: boolean } = {}): string {
    return collapse(compute(el, { root: el, referenced: false, includeHidden: false, inContent: false, fallbacks: opts.fallbacks ?? true }));
  }

  function ownLabel(el: El): string {
    const name = nameOf(el, { fallbacks: false });
    if (name) return name;
    if (kindOf(el) === "radio" || kindOf(el) === "checkbox") {
      // A label-shaped sibling right after an unlabeled box (common in custom widgets).
      const next = el.nextElementSibling as El | null;
      if (next && !next.querySelector(CONTROL_SELECTOR)) {
        const text = textWithoutControls(next);
        if (text) return text;
      }
    }
    return ""; // a tooltip comes after the question text: see entriesIn
  }

  const QUESTION_CLASS = /(^|[\s_-])(label|question|title|legend|prompt)([\s_-]|$)/i;

  function isQuestionElement(node: El): boolean {
    if (tag(node) === "LABEL" || tag(node) === "LEGEND") return true;
    if ((attr(node, "id") ?? "").endsWith("-label")) return true;
    return QUESTION_CLASS.test(attr(node, "class") ?? "");
  }

  /** The question a field sits under, and the container that holds both. */
  function question(el: El): { text: string; container: El; label: El } | null {
    const groupKind = kindOf(el) === "radio" || kindOf(el) === "checkbox" ? kindOf(el) : null;
    for (const a of ancestors(el, 6)) {
      // A question container belongs to one field: stop once it holds another field's control.
      // Groupmates (radios/checkboxes of the same kind) and anything inside `el` don't count.
      const foreign = (Array.from(a.querySelectorAll(CONTROL_SELECTOR)) as El[]).some((c) =>
        c !== el && !el.contains(c) && kindOf(c) !== "other" && !ariaHidden(c) &&
        !(groupKind && kindOf(c) === groupKind)
      );
      if (foreign) return null;
      const found: El[] = [];
      for (const node of Array.from(a.querySelectorAll("*")) as El[]) {
        if (!isQuestionElement(node)) continue;
        if (node.contains(el)) continue; // a wrapping label is the own label, not the question
        if (found.some((f) => f.contains(node))) continue; // keep the outermost
        const control = maybe(node).control;
        // A label tied to a control is that control's own label (this field's, or another
        // option's), never the question above them.
        if (control) continue;
        if (node.querySelector(CONTROL_SELECTOR)) continue;
        if (!textWithoutControls(node)) continue;
        found.push(node);
      }
      if (found.length === 1) return { text: textWithoutControls(found[0]), container: a, label: found[0] };
      if (found.length > 1) return null;
    }
    return null;
  }

  // ---- fields --------------------------------------------------------------------------------

  function controlsIn(scope: { querySelectorAll(s: string): ArrayLike<unknown> }): El[] {
    return (Array.from(scope.querySelectorAll(CONTROL_SELECTOR)) as El[]).filter((el) => {
      const kind = kindOf(el);
      if (kind === "other") return false;
      if (ariaHidden(el) && kind !== "file") return false;
      if (kind === "file") return true; // file inputs are often visually hidden but real
      return visible(el);
    });
  }

  const containerIds = new WeakMap<object, number>();
  let nextContainer = 1;
  const containerKey = (c: El) => {
    let id = containerIds.get(c);
    if (!id) containerIds.set(c, (id = nextContainer++));
    return id;
  };

  const ACTIVE_CLASS = /(^|[\s_-])(active|selected|checked|pressed)([\s_-]|$)/i;

  /** Yes/No-style button groups: 2-6 short buttons sharing a parent, under one question. */
  function buttonGroupsIn(scope: Scope): Entry[] {
    const byParent = new Map<El, El[]>();
    for (const b of Array.from(scope.querySelectorAll('button, [role=button]')) as El[]) {
      // An explicit submit button is never an answer. A <button> with no type is technically one
      // too, but pages use bare buttons as answers, so only the explicit kind counts.
      if (tag(b) === "BUTTON" && (attr(b, "type") ?? "").toLowerCase() === "submit") continue;
      if (!visible(b) || ariaHidden(b)) continue;
      const text = textWithoutControls(b);
      if (!text || text.length > 30) continue;
      const parent = b.parentElement as El | null;
      if (!parent) continue;
      if (!byParent.has(parent)) byParent.set(parent, []);
      byParent.get(parent)!.push(b);
    }
    const groups: Entry[] = [];
    for (const [parent, buttons] of byParent) {
      if (buttons.length < 2 || buttons.length > 6) continue;
      const q = question(parent);
      if (!q) continue;
      groups.push({ el: buttons[0], members: buttons, kind: "buttons", labels: [q.text], box: parent });
    }
    return groups;
  }

  function documentOrder(a: Entry, b: Entry): number {
    const pos = a.el.compareDocumentPosition?.(b.el) ?? 0;
    return pos & 4 ? -1 : pos & 2 ? 1 : 0;
  }

  function entriesIn(scope: Scope): Entry[] {
    const entries: Entry[] = [];
    const groups = new Map<string, Entry>();
    const buttonGroups = buttonGroupsIn(scope);
    const insideButtonGroup = (el: El) => buttonGroups.some((g) => g.box!.contains(el));
    for (const el of controlsIn(scope)) {
      if (insideButtonGroup(el)) continue; // e.g. a hidden checkbox behind Yes/No buttons
      const kind = kindOf(el);
      const groupable = kind === "radio" || kind === "checkbox";
      let key: string | null = null;
      if (groupable) {
        // Group by question first: some forms give every radio on the page the same name.
        const q = question(el);
        const name = attr(el, "name");
        key = q ? `${kind}:c${containerKey(q.container)}` : name ? `${kind}:n:${name}` : null;
      }
      if (key && groups.has(key)) {
        groups.get(key)!.members.push(el);
        continue;
      }
      const entry: Entry = { el, members: [el], kind, labels: [] };
      if (key) groups.set(key, entry);
      entries.push(entry);
    }
    for (const entry of entries) {
      const q = question(entry.el)?.text ?? "";
      const own = ownLabel(entry.el);
      const isGroup = entry.members.length > 1 || (entry.kind === "radio" && !!q);
      // A group answers to its question; a single control to its own label, then the question.
      entry.labels = (isGroup ? [q] : [own, q]).filter(Boolean);
      if (!entry.labels.length) {
        const fallback = collapse(attr(entry.el, "title")) || collapse(attr(entry.el, "placeholder")) || collapse(attr(entry.el, "name"));
        if (fallback) entry.labels = [fallback];
      }
    }
    return [...entries, ...buttonGroups].sort(documentOrder);
  }

  function entryFor(el: El): Entry {
    const kind = kindOf(el);
    if (kind === "radio" || kind === "checkbox" || tag(el) === "BUTTON" || attr(el, "role") === "button") {
      const group = entriesIn(doc).find((e) => e.members.includes(el));
      if (group) return group;
    }
    const q = question(el)?.text ?? "";
    return { el, members: [el], kind, labels: [ownLabel(el), q].filter(Boolean) };
  }

  // ---- refs ----------------------------------------------------------------------------------

  let nextId = 1;
  const ids = new WeakMap<object, number>();
  const byId = new Map<number, WeakRef<El>>();
  const fingerprint = (entry: Entry) => `${entry.kind}|${(entry.labels[0] ?? "").slice(0, 40)}`;

  function refOf(entry: Entry): string {
    const el = entry.pick ?? entry.el; // a ref to a picked member keeps naming that member
    let id = ids.get(el);
    if (!id) {
      id = nextId++;
      ids.set(el, id);
      byId.set(id, new WeakRef(el));
    }
    return `${id}:${fingerprint(entry)}`;
  }

  function fromRef(ref: string): Entry | Fail {
    const sep = ref.indexOf(":");
    const el = byId.get(Number(ref.slice(0, sep)))?.deref();
    if (!el || !isConnected(el)) {
      return { ok: false as const, code: "stale_ref" as const, message: "the field is no longer in the page (re-rendered or navigated away); call fields() again" };
    }
    const entry = withPick(entryFor(el), el);
    if (fingerprint(entry) !== ref.slice(sep + 1)) {
      return { ok: false as const, code: "stale_ref" as const, message: "the field changed since fields() was called; call fields() again" };
    }
    return entry;
  }

  function withPick(entry: Entry, el: El): Entry {
    return el !== entry.el && entry.members.includes(el) ? { ...entry, pick: el } : entry;
  }

  // ---- values and validation -----------------------------------------------------------------

  /**
   * What a combobox shows as chosen. By the standards that is the input's value, or the text of a
   * combobox that isn't an input; a custom parts map can say the page shows it elsewhere.
   */
  function comboDisplay(el: El): string | string[] {
    if (parts.values) {
      const chips = partsNear(el, parts.values);
      if (chips.length) return chips.map((c) => collapse(c.textContent));
    }
    const shown = partOf(el, "value");
    if (shown) return collapse(shown.textContent);
    if (partOf(el, "multiple")) return []; // takes several values, none chosen yet
    if (tag(el) === "INPUT" || tag(el) === "TEXTAREA") return collapse(String(maybe(el).value ?? ""));
    return textWithoutControls(el);
  }

  function isPressed(b: El): boolean {
    return attr(b, "aria-pressed") === "true" || attr(b, "aria-checked") === "true" ||
      attr(b, "aria-selected") === "true" || ACTIVE_CLASS.test(attr(b, "class") ?? "");
  }

  function valueOf(entry: Entry): string | boolean | string[] | null {
    const el = entry.el;
    switch (entry.kind) {
      case "text":
        return tag(el) === "INPUT" || tag(el) === "TEXTAREA" ? String(maybe(el).value ?? "") : collapse(el.textContent);
      case "select": {
        if (tag(el) === "SELECT") {
          const s = el as unknown as HTMLSelectElement;
          const picked = Array.from(s.selectedOptions).map((o) => collapse(o.text));
          return s.multiple ? picked : picked[0] ?? null;
        }
        return comboDisplay(el);
      }
      case "checkbox": {
        const on = (m: El) => tag(m) === "INPUT" ? (m as unknown as HTMLInputElement).checked : attr(m, "aria-checked") === "true";
        if (entry.members.length > 1) return entry.members.filter(on).map(ownLabel);
        return on(el);
      }
      case "radio": {
        const on = entry.members.find((m) => tag(m) === "INPUT" ? (m as unknown as HTMLInputElement).checked : attr(m, "aria-checked") === "true");
        return on ? ownLabel(on) : null;
      }
      case "buttons": {
        const pressed = entry.members.find(isPressed);
        return pressed ? textWithoutControls(pressed) : null;
      }
      case "file": {
        const files = (el as unknown as HTMLInputElement).files;
        return files ? Array.from({ length: files.length }, (_, i) => files[i].name) : [];
      }
      default:
        return null;
    }
  }

  function optionsOf(entry: Entry): string[] | undefined {
    if (entry.kind === "select" && tag(entry.el) === "SELECT") {
      return Array.from((entry.el as unknown as HTMLSelectElement).options).map((o) => collapse(o.text));
    }
    if ((entry.kind === "radio" || entry.kind === "checkbox") && entry.members.length > 1) {
      return entry.members.map(ownLabel);
    }
    if (entry.kind === "buttons") return entry.members.map(textWithoutControls);
    return undefined;
  }

  /** Labels mark required fields too: a trailing `*` in the text, or a `required` class word (`_required_x`). */
  function labelSaysRequired(label: El): boolean {
    if (/\*\s*$/.test(collapse(label.textContent))) return true;
    for (const node of [label, ...(Array.from(label.querySelectorAll("*")) as El[])]) {
      if (/(^|[\s_-])required([\s_-]|$)/i.test(attr(node, "class") ?? "")) return true;
    }
    return false;
  }

  /** The elements that label a field: its own labels, aria-labelledby, and the question above it. */
  function labelNodes(el: El): El[] {
    const labels: El[] = [];
    const own = maybe(el).labels;
    if (own) labels.push(...Array.from(own));
    for (const id of (attr(el, "aria-labelledby") ?? "").split(/\s+/).filter(Boolean)) {
      const node = doc.getElementById(id) as El | null;
      if (node) labels.push(node);
    }
    const q = question(el);
    if (q) labels.push(q.label);
    return labels;
  }

  function required(entry: Entry): boolean {
    if (entry.members.some((m) => m.hasAttribute("required") || attr(m, "aria-required") === "true")) return true;
    return labelNodes(entry.el).some(labelSaysRequired);
  }

  function errorText(entry: Entry): string | undefined {
    const el = entry.el;
    const ids = `${attr(el, "aria-errormessage") ?? ""} ${attr(el, "aria-describedby") ?? ""}`.split(/\s+/).filter(Boolean);
    for (const id of ids) {
      const node = doc.getElementById(id) as El | null;
      if (!node) continue;
      const looksLikeError = attr(node, "role") === "alert" || /error|invalid/i.test(`${id} ${attr(node, "class") ?? ""}`);
      const text = collapse(node.textContent);
      if (looksLikeError && text && (typeof node.checkVisibility !== "function" || node.checkVisibility())) return text;
    }
    const container = question(el)?.container;
    if (container) {
      for (const node of Array.from(container.querySelectorAll('[role=alert], [class*="error"], [class*="Error"]')) as El[]) {
        const text = collapse(node.textContent);
        if (text && (typeof node.checkVisibility !== "function" || node.checkVisibility())) return text;
      }
    }
    return undefined;
  }

  function invalid(entry: Entry): boolean {
    return entry.members.some((m) => attr(m, "aria-invalid") === "true" || safeMatches(m, ":user-invalid")) ||
      errorText(entry) !== undefined;
  }

  const displayLabel = (entry: Entry) => stripMarkers(collapse(entry.labels[0]));

  function multiple(entry: Entry): boolean {
    const el = entry.el;
    if (entry.kind === "checkbox") return entry.members.length > 1;
    if (entry.kind === "file") return el.hasAttribute("multiple");
    if (entry.kind !== "select") return false;
    if (tag(el) === "SELECT") return el.hasAttribute("multiple");
    // ARIA puts aria-multiselectable on the listbox (a combobox's popup), or on the field itself.
    if ([el, ...listboxesFor(el)].some((n) => attr(n, "aria-multiselectable") === "true")) return true;
    return Array.isArray(comboDisplay(el));
  }

  /** Help text tied to the field (aria-describedby) that is not an error message. */
  function hintText(entry: Entry, error: string | undefined): string | undefined {
    const el = entry.el;
    for (const id of (attr(el, "aria-describedby") ?? "").split(/\s+/).filter(Boolean)) {
      const node = doc.getElementById(id) as El | null;
      if (!node) continue;
      const looksLikeError = attr(node, "role") === "alert" || /error|invalid/i.test(`${id} ${attr(node, "class") ?? ""}`);
      const text = collapse(node.textContent);
      if (text && !looksLikeError && text !== error) return text;
    }
    return undefined;
  }

  function textFacts(entry: Entry) {
    const el = entry.el;
    if (entry.kind !== "text" || (tag(el) !== "INPUT" && tag(el) !== "TEXTAREA")) return {};
    const max = Number(attr(el, "maxlength"));
    const pattern = attr(el, "pattern");
    return {
      inputType: tag(el) === "TEXTAREA" ? "textarea" : inputType(el),
      ...(max > 0 ? { maxLength: max } : {}),
      ...(pattern ? { pattern } : {}),
    };
  }

  /** Fields whose value must not leave the page in a listing: passwords, card data, one-time codes. */
  function isSecret(entry: Entry): boolean {
    const el = entry.el;
    if (entry.kind !== "text" || tag(el) !== "INPUT") return false;
    if (inputType(el) === "password") return true;
    return (attr(el, "autocomplete") ?? "").split(/\s+/).some((t) => /^(cc-|one-time-code$|current-password$|new-password$)/.test(t));
  }

  /**
   * A field as plain JSON. With `all` (a listing: fields()), it also gets verified
   * targets, and a secret's value is withheld: listings reach the authoring LLM's context.
   */
  function describe(entry: Entry, all?: Entry[]) {
    const isSecretField = isSecret(entry);
    const secret = all !== undefined && isSecretField; // withhold the value only in listings
    const value = valueOf(entry);
    const empty = value === null || value === "" || value === false || (Array.isArray(value) && value.length === 0);
    const error = errorText(entry);
    const options = optionsOf(entry);
    const label = displayLabel(entry);
    const hint = hintText(entry, error);
    const placeholder = collapse(attr(entry.el, "placeholder"));
    const targets = all ? targetsFor(entry, label, all) : [];
    return {
      ref: { ref: refOf(entry) },
      label,
      ...(targets.length ? { target: targets[0] } : {}),
      ...(targets.length > 1 ? { alternates: targets.slice(1) } : {}),
      kind: entry.kind,
      required: required(entry),
      multiple: multiple(entry),
      value: secret ? null : value,
      ...(isSecretField ? { sensitive: true } : {}),
      empty,
      ...(options ? { options } : {}),
      ...textFacts(entry),
      ...(hint ? { hint } : {}),
      ...(placeholder && placeholder !== label ? { placeholder } : {}),
      invalid: invalid(entry),
      ...(error ? { error } : {}),
    };
  }

  // ---- verified targets ----------------------------------------------------------------------
  //
  // fields() hands out targets a script can paste. Each one is checked here, against the whole
  // document, to resolve to this field and nothing else: "verified before shown". A label
  // target comes first (it reads well in review); stable attributes follow as alternates.

  // Ids and hooks generated afresh on each page load never anchor a target: UUID fragments, long
  // digit runs, a number segment (`field-3-input`, `answer_12`), and a short counter after
  // punctuation (`:r7:`). A custom parts map's `unstableIds` adds the page's own. Mirrored in
  // lint/targets.ts.
  const GENERATED = /[0-9a-f]{8}-[0-9a-f]{4}|\d{4,}|[_-]\d+([_-]|$)|^\W+[a-z]?\d+\W*$/i;
  const stable = (v: string | null): v is string =>
    !!v && v.length <= 60 && !/\s/.test(v) && !GENERATED.test(v) && !unstableIds.some((re) => re.test(v));
  // A plain CSS identifier needs no quotes ([name=email], #first); anything else is quoted
  // (JSON string escaping is valid CSS).
  const IDENT = /^-?[_a-zA-Z][\w-]*$/;
  const cssString = (v: string) => (IDENT.test(v) ? v : JSON.stringify(v));
  const HOOKS = ["data-testid", "data-test", "data-qa", "data-cy"];

  function anchorsOf(el: El, control: boolean): string[] {
    const out: string[] = [];
    const id = attr(el, "id");
    if (stable(id)) out.push(IDENT.test(id) ? `#${id}` : `[id=${cssString(id)}]`);
    for (const hook of HOOKS) {
      const v = attr(el, hook);
      if (stable(v)) out.push(`[${hook}=${cssString(v)}]`);
    }
    if (control) {
      const t = tag(el).toLowerCase();
      const name = attr(el, "name");
      if (stable(name)) out.push(`${t}[name=${cssString(name)}]`);
      const auto = attr(el, "autocomplete");
      if (stable(auto) && auto !== "on" && auto !== "off") out.push(`${t}[autocomplete=${cssString(auto)}]`);
    }
    return out;
  }

  function isThisField(r: Entry | Fail, entry: Entry): boolean {
    return !("ok" in r) && (r.el === entry.el || entry.members.includes(r.pick ?? r.el));
  }

  function targetsFor(entry: Entry, label: string, all: Entry[]): (string | { label: string; within?: string })[] {
    const out: (string | { label: string; within?: string })[] = [];
    if (label) {
      const hits = all.filter((e) => e.labels.some((l) => sameText(label, l)));
      if (hits.length === 1 && hits[0].el === entry.el) {
        out.push({ label });
      } else if (hits.some((h) => h.el === entry.el)) {
        // The label repeats: anchor it inside the nearest stable container that holds the
        // whole field and makes the label unique.
        for (const a of ancestors(entry.el, 12)) {
          if (!entry.members.every((m) => a.contains(m)) || (entry.box && !a.contains(entry.box))) continue;
          const within = anchorsOf(a, false).find((css) =>
            isThisField(resolveIn({ label: { text: label }, within: { css } }, doc), entry)
          );
          if (within) {
            out.push({ label, within });
            break;
          }
        }
      }
    }
    if (entry.members.length === 1 && entry.kind !== "buttons") {
      for (const css of anchorsOf(entry.el, true)) {
        if (out.length >= 3) break;
        if (isThisField(resolveIn({ css }, doc), entry)) out.push(css);
      }
    }
    return out;
  }

  // ---- resolution ----------------------------------------------------------------------------

  /** The name `{ role, name }` targets match: the full accessible name. */
  const accessibleName = (el: El) => nameOf(el);

  function containerFor(target: WireTarget, scope: Scope): El | Fail {
    if ("css" in target || "role" in target || "ref" in target) {
      const r = resolveIn(target, scope);
      return "ok" in r ? r : r.el;
    }
    const r = resolveIn(target, scope);
    if ("ok" in r) return r;
    return question(r.el)?.container ?? (r.el.parentElement as El) ?? r.el;
  }

  /**
   * The one visibility rule, for every kind of target: only elements a person could see count
   * (file inputs excepted, since sites hide them behind a styled button). Label targets get it
   * from controlsIn; CSS and role targets from here.
   */
  const usable = (el: El) => kindOf(el) === "file" || visible(el);

  function pickOne(
    hits: El[],
    describeHit: (el: El) => string,
    what: string,
  ): El | Fail {
    const shown = hits.filter(usable);
    if (shown.length === 1) return shown[0];
    if (shown.length > 1) {
      return {
        ok: false as const,
        code: "ambiguous" as const,
        message: `${shown.length} elements match ${what}; add \`within\` to say which`,
        candidates: shown.slice(0, 5).map(describeHit),
      };
    }
    if (hits.length) {
      return { ok: false as const, code: "timeout" as const, message: `${what} matches only hidden elements; none became visible`, wait: true };
    }
    return { ok: false as const, code: "not_found" as const, message: `nothing matches ${what}`, wait: true };
  }

  const shownMatcher = (m: WireMatcher) => ("text" in m ? JSON.stringify(m.text) : `/${m.re.source}/${m.re.flags}`);

  /** The text a person reads on an element: a button input's value, else its text. */
  function elementText(el: El): string {
    if (tag(el) === "INPUT" && ["button", "submit", "reset"].includes(inputType(el))) return collapse(attr(el, "value"));
    return collapse(el.textContent);
  }

  const TEXT_SKIP = new Set(["HTML", "HEAD", "BODY", "SCRIPT", "STYLE", "TEMPLATE", "NOSCRIPT", "TITLE"]);

  /** Elements whose text matches, innermost only (a wrapper around the match is not a match). */
  function textHits(m: WireMatcher, scope: Scope): El[] {
    const test = textMatcher(m);
    const hits = (Array.from(scope.querySelectorAll("*")) as El[]).filter((el) =>
      !TEXT_SKIP.has(tag(el)) && !ariaHidden(el) && test(elementText(el))
    );
    return hits.filter((h) => !hits.some((o) => o !== h && h.contains(o)));
  }

  // ---- buttons, links and other things to click ---------------------------------------------

  const CLICKABLE = new Set(["button", "link", "tab", "menuitem", "menuitemcheckbox", "menuitemradio", "treeitem"]);

  function clickablesIn(scope: Scope): El[] {
    const groups = buttonGroupsIn(scope);
    return (Array.from(scope.querySelectorAll("*")) as El[]).filter((el) =>
      (CLICKABLE.has(roleOf(el)) || tag(el) === "SUMMARY") && visible(el) && !ariaHidden(el) &&
      !groups.some((g) => g.box!.contains(el))
    );
  }

  function commonAncestor(els: El[]): El | null {
    if (!els.length) return null;
    let a: El | null = els[0].parentElement as El | null;
    while (a && !els.every((el) => a!.contains(el))) a = a.parentElement as El | null;
    return a;
  }

  /** Verified targets for something to click: role and name first, then its text, then CSS. */
  function clickableTargets(el: El, role: string, name: string): unknown[] {
    const out: unknown[] = [];
    const isIt = (r: Entry | Fail) => !("ok" in r) && (r.pick ?? r.el) === el;
    if (role && name) {
      if (isIt(resolveIn({ role, name: { text: name } }, doc))) out.push({ role, name });
      else {
        for (const a of ancestors(el, 12)) {
          const within = anchorsOf(a, false).find((css) => isIt(resolveIn({ role, name: { text: name }, within: { css } }, doc)));
          if (within) {
            out.push({ role, name, within });
            break;
          }
        }
      }
    }
    if (!out.length && role) {
      // A button inside a field (an upload, clear or dropdown button) is named by that field,
      // even with no name of its own.
      for (const e of entriesIn(doc)) {
        const label = displayLabel(e);
        if (!label) continue;
        const c = containerFor({ label: { text: label } }, doc);
        if ("ok" in c || !c.contains(el)) continue;
        const named = name ? { name: { text: name } } : {};
        if (isIt(resolveIn({ role, ...named, within: { label: { text: label } } }, doc))) {
          out.push({ role, ...(name ? { name } : {}), within: { label } });
          break;
        }
      }
    }
    if (!out.length) {
      const text = elementText(el);
      if (text && text.length <= 80 && isIt(resolveIn({ text: { text } }, doc))) out.push({ text });
    }
    for (const css of anchorsOf(el, true)) {
      if (out.length >= 3) break;
      if (isIt(resolveIn({ css }, doc))) out.push(css);
    }
    return out;
  }

  const clickableNames = (scope: Scope) => [...new Set(clickablesIn(scope).map((el) => accessibleName(el)).filter(Boolean))];

  function resolveIn(target: WireTarget, scope: Scope): Entry | Fail {
    if ("ref" in target) return fromRef(target.ref);
    let inner: Scope = scope;
    if ("within" in target && target.within) {
      const c = containerFor(target.within, scope);
      if ("ok" in c) return c;
      inner = c;
    }
    if ("css" in target) {
      let hits: El[];
      try {
        hits = Array.from(inner.querySelectorAll(target.css)) as El[];
      } catch {
        return { ok: false as const, code: "not_found" as const, message: `${JSON.stringify(target.css)} is not a valid CSS selector` };
      }
      const el = pickOne(hits, (e) => `${tag(e).toLowerCase()} "${ownLabel(e) || collapse(e.textContent).slice(0, 40)}"`, JSON.stringify(target.css));
      return "ok" in el ? el : withPick(entryFor(el), el);
    }
    if ("text" in target) {
      const el = pickOne(textHits(target.text, inner), (e) => `${tag(e).toLowerCase()} "${elementText(e).slice(0, 40)}"`, `text ${shownMatcher(target.text)}`);
      if ("ok" in el) {
        if (el.code === "not_found") el.candidates = clickableNames(inner);
        return el;
      }
      // Text that is a label's means that label's field, as for a person reading it.
      const label = el.closest("label") as El | null;
      const control = label ? maybe(label).control ?? null : null;
      if (control) return withPick(entryFor(control), control);
      return withPick(entryFor(el), el);
    }
    if ("label" in target) {
      const all = entriesIn(inner);
      const test = textMatcher(target.label);
      const hits = all.filter((e) => e.labels.some(test));
      if (hits.length === 1) return hits[0];
      if (hits.length > 1) {
        return {
          ok: false as const,
          code: "ambiguous" as const,
          message: `${hits.length} fields are labelled like that; add \`within\` to say which`,
          candidates: hits.slice(0, 5).map((e) => e.labels[0] ?? ""),
        };
      }
      return {
        ok: false as const,
        code: "not_found" as const,
        message: "no field has that label",
        candidates: [...new Set(all.flatMap((e) => e.labels))],
        wait: true,
      };
    }
    const roleHits = (Array.from(inner.querySelectorAll("*")) as El[]).filter((el) => roleOf(el) === target.role && !ariaHidden(el));
    const test = target.name ? textMatcher(target.name) : undefined;
    const named = test ? roleHits.filter((el) => test(accessibleName(el))) : roleHits;
    const el = pickOne(named, (e) => `{ role: "${target.role}", name: "${accessibleName(e)}" }`, `role "${target.role}"`);
    if ("ok" in el && el.code === "not_found" && target.name) {
      el.candidates = [...new Set(roleHits.map(accessibleName).filter(Boolean))];
    }
    return "ok" in el ? el : withPick(entryFor(el), el);
  }

  // ---- actions (text) ------------------------------------------------------------------------

  function editability(el: El): Fail | null {
    const anyEl = maybe(el);
    if (anyEl.disabled || el.closest("fieldset[disabled]") || attr(el, "aria-disabled") === "true") {
      return { ok: false as const, code: "not_editable" as const, message: "the field is disabled", wait: true };
    }
    if (anyEl.readOnly || attr(el, "aria-readonly") === "true") {
      return { ok: false as const, code: "not_editable" as const, message: "the field is read-only" };
    }
    return null;
  }

  /**
   * Wait `n` animation frames so the page can respond, with a timer fallback: Chromium throttles
   * or pauses requestAnimationFrame in background (zero-size) tabs, which must not stall a call.
   */
  function frames(n: number): Promise<void> {
    return new Promise((resolve) => {
      let done = false;
      const finish = () => {
        if (!done) {
          done = true;
          resolve();
        }
      };
      page.setTimeout(finish, 50 * (n + 1));
      const step = (left: number) => (left <= 0 ? finish() : page.requestAnimationFrame(() => step(left - 1)));
      step(n);
    });
  }

  // ---- pointer targets -----------------------------------------------------------------------

  function describeEl(el: El): string {
    const id = attr(el, "id");
    const cls = (attr(el, "class") ?? "").trim().split(/\s+/).filter(Boolean).slice(0, 2);
    return `<${tag(el).toLowerCase()}${id ? `#${id}` : ""}${cls.map((c) => `.${c}`).join("")}>`;
  }

  function isLabelFor(node: El, el: El): boolean {
    const labels = maybe(el).labels;
    return !!labels && Array.from(labels).some((l) => l === node || l.contains(node));
  }

  /** A visually hidden checkbox or radio is pressed through its label, as a person would. */
  function pressTarget(el: El): El {
    if (tag(el) === "INPUT" && ["checkbox", "radio"].includes(inputType(el))) {
      const r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4 || page.getComputedStyle(el).opacity === "0") {
        const labels = maybe(el).labels;
        if (labels && labels.length) return labels[0];
      }
    }
    return el;
  }

  /**
   * The centre of the element's largest on-screen box, after scrolling it into view, provided
   * that is where a click would land. A click that would hit something else is refused with
   * `covered`, naming what is on top, rather than redirected.
   */
  function pointFor(el: El): { ok: true; x: number; y: number } | Fail {
    if (!visible(el)) return { ok: false as const, code: "timeout" as const, message: "the element never became visible", wait: true };
    el.scrollIntoView({ block: "center", inline: "center" });
    const vw = page.innerWidth;
    const vh = page.innerHeight;
    let best: { x: number; y: number; area: number } | null = null;
    for (const r of Array.from(el.getClientRects())) {
      const left = Math.max(r.left, 0), right = Math.min(r.right, vw);
      const top = Math.max(r.top, 0), bottom = Math.min(r.bottom, vh);
      const area = Math.max(0, right - left) * Math.max(0, bottom - top);
      if (area > 0 && (!best || area > best.area)) best = { x: (left + right) / 2, y: (top + bottom) / 2, area };
    }
    if (!best) return { ok: false as const, code: "timeout" as const, message: "the element has no size on screen", wait: true };
    const hit = doc.elementFromPoint(best.x, best.y);
    if (hit && !(hit === el || el.contains(hit) || hit.contains(el) || isLabelFor(hit, el))) {
      return {
        ok: false as const,
        code: "covered" as const,
        message: `it is covered by ${describeEl(hit)} at its click point; dismiss or close that first`,
        wait: true,
      };
    }
    return { ok: true as const, x: best.x, y: best.y };
  }

  // ---- options -------------------------------------------------------------------------------

  /**
   * Pick one option by text: exact (case-, accent-, whitespace-insensitive), then prefix, then
   * substring. More than one match at the first level that matches is `ambiguous`; none at all
   * is `no_option`, listing what there is.
   */
  function matchOption(texts: string[], wanted: string, values: (string | null)[] = []): number | Fail {
    const w = textKey(wanted);
    const levels: ((t: string, i: number) => boolean)[] = [
      (t, i) => textKey(t) === w || (values[i] !== null && values[i] !== undefined && values[i] === wanted),
      (t) => textKey(t).startsWith(w),
      (t) => textKey(t).includes(w),
    ];
    for (const test of levels) {
      const hits = texts.map((t, i) => (test(t, i) ? i : -1)).filter((i) => i >= 0);
      if (hits.length === 1) return hits[0];
      if (hits.length > 1) {
        return {
          ok: false as const,
          code: "ambiguous" as const,
          message: `${hits.length} options match ${JSON.stringify(wanted)}`,
          candidates: hits.slice(0, 5).map((i) => texts[i]),
        };
      }
    }
    return { ok: false as const, code: "no_option" as const, message: `no option matches ${JSON.stringify(wanted)}`, options: texts.slice(0, 50) };
  }

  /** The listbox(es) a combobox controls: aria-controls/aria-owns first, then a nearby one. */
  function listboxesFor(el: El): El[] {
    const out: El[] = [];
    for (const node of [el, ...ancestors(el, 3)]) {
      const ids = `${attr(node, "aria-controls") ?? ""} ${attr(node, "aria-owns") ?? ""}`.split(/\s+/).filter(Boolean);
      for (const id of ids) {
        const lb = doc.getElementById(id) as El | null;
        if (lb && !out.includes(lb)) out.push(lb);
      }
    }
    if (!out.length) {
      for (const a of ancestors(el, 4)) {
        const lb = a.querySelector("[role=listbox]") as El | null;
        if (lb) {
          out.push(lb);
          break;
        }
      }
    }
    return out.filter(visible);
  }

  function optionsIn(listboxes: El[]): El[] {
    return listboxes
      .flatMap((lb) => Array.from(lb.querySelectorAll("[role=option]")) as El[])
      .filter((o) => visible(o) && attr(o, "aria-disabled") !== "true");
  }

  /** Where to press to open a combobox: the field, or what a custom parts map names. */
  function comboControl(el: El): El {
    return partOf(el, "open") ?? el;
  }

  function memberOn(m: El): boolean {
    if (tag(m) === "INPUT") return (m as unknown as HTMLInputElement).checked;
    return attr(m, "aria-checked") === "true" || isPressed(m);
  }

  function memberLabel(entry: Entry, m: El): string {
    return entry.kind === "buttons" ? textWithoutControls(m) : ownLabel(m);
  }

  function nativeSetter(el: El, prop: "value" | "checked"): ((v: unknown) => void) | null {
    let proto = Object.getPrototypeOf(el);
    while (proto && !Object.getOwnPropertyDescriptor(proto, prop)) proto = Object.getPrototypeOf(proto);
    const setter = proto && Object.getOwnPropertyDescriptor(proto, prop)?.set;
    return setter ? (v: unknown) => setter.call(el, v) : null;
  }

  // ---- custom parts: checking and mapping ------------------------------------------------------
  //
  // SDK: Check Custom Parts asks, for each field a held-back verb names, whether the parts
  // that verb needs are where it will look. SDK: Map Custom Parts drafts a map for a page.
  // Both only read, and both show a field's markup for whatever is missing.

  const EXCERPT_ATTR = /^(class|id|role|type|name|for|placeholder|aria-[\w-]+|data-test[\w-]*)$/;
  const EXCERPT_SKIP = new Set(["SCRIPT", "STYLE", "SVG", "TEMPLATE", "NOSCRIPT"]);
  const escapeMarkup = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

  /**
   * A field's box as markup, trimmed to what a selector can use: tags, the attributes in
   * EXCERPT_ATTR (never `value`; class names whole, other values cut at 80 characters), and up to
   * 40 characters of each element's own text.
   */
  function partsMarkup(el: El, cap = 2000): string {
    const box = fieldBox(el);
    const out: string[] = [];
    let size = 0;
    const push = (line: string) => {
      out.push(line);
      size += line.length + 1;
    };
    const walk = (node: El, depth: number) => {
      if (size > cap) return;
      const t = tag(node).toLowerCase();
      const attrs = node.getAttributeNames().filter((n) => EXCERPT_ATTR.test(n))
        .map((n) => ` ${n}="${escapeMarkup((attr(node, n) ?? "").slice(0, n === "class" ? 240 : 80))}"`).join("");
      const pad = "  ".repeat(depth);
      if (EXCERPT_SKIP.has(tag(node).toUpperCase())) return push(`${pad}<${t}${attrs}>…</${t}>`);
      const own = collapse(Array.from(node.childNodes).filter((c) => c.nodeType === 3).map((c) => c.textContent).join(" "));
      const text = escapeMarkup(own.length > 40 ? `${own.slice(0, 40)}…` : own);
      const kids = Array.from(node.children) as El[];
      if (!kids.length) return push(`${pad}<${t}${attrs}>${text}</${t}>`);
      push(`${pad}<${t}${attrs}>${text}`);
      for (const k of kids) walk(k, depth + 1);
      push(`${pad}</${t}>`);
    };
    walk(box[box.length - 1], 0);
    const text = out.join("\n");
    return text.length > cap ? `${text.slice(0, cap)}\n…` : text;
  }

  /** A combobox the standards can drive only partly: not a native select. */
  const isCustomSelect = (entry: Entry) => entry.kind === "select" && tag(entry.el) !== "SELECT";

  /** What web standards alone say a combobox shows: an input's value, or its own text. */
  function standardShown(el: El): string {
    return tag(el) === "INPUT" || tag(el) === "TEXTAREA" ? collapse(String(maybe(el).value ?? "")) : textWithoutControls(el);
  }

  /** Too small for a person to press (offline, with no layout, nothing is). */
  function tooSmall(el: El): boolean {
    if (typeof el.getBoundingClientRect !== "function") return false;
    const r = el.getBoundingClientRect();
    return r.width < 4 || r.height < 4;
  }

  /** Splits a class token into words: `multi-value__label` and `multiValueLabel` both give multi, value, label. */
  const classWords = (token: string) =>
    token.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  const classTokens = (el: El) => (attr(el, "class") ?? "").split(/\s+/).filter(Boolean);
  const hashed = (token: string) => token.split(/[-_]+/).some((p) => p.length >= 5 && /\d/.test(p) && /[a-z]/i.test(p));

  /**
   * Selectors that pick this element by its class, most specific first: each stable class token
   * exactly, then, for a build-generated token with a readable tail (`css-1x2y3z-singleValue`),
   * that tail.
   */
  function classSelectors(el: El): string[] {
    const out: string[] = [];
    for (const token of classTokens(el)) {
      if (!hashed(token) && stable(token)) out.push(IDENT.test(token) ? `.${token}` : `[class~=${cssString(token)}]`);
    }
    for (const token of classTokens(el)) {
      if (!hashed(token)) continue;
      const tail = token.split(/[-_]+/).filter((p) => !(p.length >= 5 && /\d/.test(p) && /[a-z]/i.test(p)));
      const readable = tail.filter((p) => /[a-z]{3,}/i.test(p)).join("-");
      if (readable.length >= 4 && token.endsWith(readable)) out.push(`[class*=${cssString(`-${readable}`)}]`);
    }
    return out;
  }

  /** Visible text elements in a field's box that could show its choice: not its labels, not a placeholder. */
  function shownCandidates(el: El): El[] {
    const box = fieldBox(el);
    const root = box[box.length - 1];
    const labels = labelNodes(el);
    const placeholder = collapse(attr(el, "placeholder") ?? attr(el, "aria-placeholder") ?? "");
    return (Array.from(root.querySelectorAll("*")) as El[]).filter((n) => {
      if (n === el || n.contains(el) || EXCERPT_SKIP.has(tag(n).toUpperCase())) return false;
      if (labels.some((l) => l === n || l.contains(n) || n.contains(l))) return false;
      if (n.closest("[role=listbox], [role=option]") || !visible(n)) return false;
      const text = textWithoutControls(n);
      if (!text || (placeholder && sameText(text, placeholder))) return false;
      if (classTokens(n).some((t) => classWords(t).includes("placeholder"))) return false;
      // Innermost only: an element whose text all comes from a child is not the shown value.
      return !(Array.from(n.children) as El[]).some((c) => textWithoutControls(c));
    });
  }

  /**
   * One selector per part that fits every field it covers. A selector is kept only when, near
   * each field, it finds exactly what that field showed, and near no other field anything at all.
   */
  function generalize(found: { el: El; parts: El[] }[], others: El[]): string | null {
    const covered = new Set<number>();
    const chosen: string[] = [];
    while (covered.size < found.length && chosen.length < 3) {
      const tally = new Map<string, number[]>();
      found.forEach((f, i) => {
        if (covered.has(i)) return;
        for (const sel of new Set(f.parts.flatMap(classSelectors))) tally.set(sel, [...(tally.get(sel) ?? []), i]);
      });
      const verified = [...tally.entries()].filter(([sel, idx]) =>
        idx.every((i) => {
          const near = partsNear(found[i].el, sel);
          return near.length === found[i].parts.length && near.every((n, k) => n === found[i].parts[k]);
        }) && others.every((o) => partsNear(o, sel).length === 0)
      );
      if (!verified.length) break;
      verified.sort((a, b) => b[1].length - a[1].length); // stable sort: ties keep document order
      const [sel, idx] = verified[0];
      chosen.push(sel);
      idx.forEach((i) => covered.add(i));
    }
    return chosen.length ? chosen.join(", ") : null;
  }

  let pendingUpload: El | null = null;
  const submitGuard = { installed: false, armed: false, blocked: false };

  const api = {
    /** The script's custom parts maps, combined. Set before every call; an invalid selector throws. */
    useCustomParts(map: WireCustomParts) {
      for (const part of PARTS) {
        const sel = map[part];
        if (!sel) continue;
        try {
          doc.querySelector(sel);
        } catch {
          throw new TypeError(`custom parts map: \`${part}\` ${JSON.stringify(sel)} is not a valid CSS selector`);
        }
      }
      parts = map;
      unstableIds = (map.unstableIds ?? []).map((re) => new RegExp(re.source, re.flags));
    },

    fields(within?: WireTarget) {
      let scope: Scope = doc;
      if (within) {
        const c = containerFor(within, doc);
        if ("ok" in c) return c;
        scope = c;
      }
      // Targets are verified against the whole document: that is where a script resolves them.
      const all = scope === doc ? null : entriesIn(doc);
      const entries = entriesIn(scope);
      return { ok: true as const, fields: entries.map((e) => describe(e, all ?? entries)) };
    },

    /**
     * Diagnostics, not contract: the names this runtime computes for the first element matching
     * `css` (the name `{ role, name }` targets match, and the labels `{ label }` targets match).
     * Used to score the resolver against the W3C accname conformance tests.
     */
    names(css: string) {
      const el = doc.querySelector(css) as El | null;
      if (!el) return { ok: false as const, code: "not_found" as const, message: `nothing matches ${css}` };
      const entry = entryFor(el);
      return { ok: true as const, accessibleName: accessibleName(el), labels: entry.labels, kind: entry.kind };
    },

    /** Buttons, links, tabs and menu items, each with verified targets. */
    clickables(opts: { within?: WireTarget; all?: boolean } = {}) {
      let scope: Scope = doc;
      if (opts.within) {
        const c = containerFor(opts.within, doc);
        if ("ok" in c) return c;
        scope = c;
      }
      let els = clickablesIn(scope);
      if (!opts.all) {
        // Links outside the form's own area (site navigation, footers) are noise for a form script.
        const region = commonAncestor(entriesIn(scope).map((e) => e.el));
        if (region) els = els.filter((el) => roleOf(el) !== "link" || region.contains(el));
      }
      const LIMIT = 80;
      return {
        ok: true as const,
        total: els.length,
        clickables: els.slice(0, LIMIT).map((el) => {
          const role = roleOf(el) || tag(el).toLowerCase();
          const name = accessibleName(el);
          const targets = clickableTargets(el, roleOf(el), name);
          return {
            role,
            name,
            ...(targets.length ? { target: targets[0] } : {}),
            ...(targets.length > 1 ? { alternates: targets.slice(1) } : {}),
          };
        }),
      };
    },

    /** The visible text of the element a target names (line breaks kept, spaces collapsed). */
    textOf(target: WireTarget) {
      const r = resolveIn(target, doc);
      if ("ok" in r) return r;
      const el = r.pick ?? r.el;
      // Live, innerText follows the rendered lines; offline there is no layout, so whitespace in the
      // source (including its line breaks) is collapsed.
      if (!live) return { ok: true as const, text: collapse(el.textContent) };
      const raw = String(el.innerText ?? "");
      const text = raw.split("\n").map((line) => line.replace(/\s+/g, " ").trim()).filter(Boolean).join("\n");
      return { ok: true as const, text };
    },

    /** An attribute of the element a target names, or null when it has none. */
    attrOf(target: WireTarget, name: string) {
      const r = resolveIn(target, doc);
      if ("ok" in r) return r;
      return { ok: true as const, value: attr(r.pick ?? r.el, name) };
    },

    /**
     * Arm the submit guard: while armed, a form submission is stopped before it leaves the page
     * (captured on the window, ahead of the page's own handlers) and remembered. For scripts
     * without the `submit` grant, around click() and press().
     */
    armSubmitGuard() {
      if (!submitGuard.installed) {
        page.addEventListener("submit", (e: { preventDefault(): void; stopImmediatePropagation(): void }) => {
          if (!submitGuard.armed) return;
          e.preventDefault();
          e.stopImmediatePropagation();
          submitGuard.blocked = true;
        }, true);
        submitGuard.installed = true;
      }
      submitGuard.armed = true;
      submitGuard.blocked = false;
      return { ok: true as const };
    },

    disarmSubmitGuard() {
      const blocked = submitGuard.blocked;
      submitGuard.armed = false;
      submitGuard.blocked = false;
      return { ok: true as const, blocked };
    },

    /**
     * For waitFor(target): is it there and visible, there but hidden, or absent? Waiting acts on
     * nothing, so several visible matches count as visible ("wait for any result").
     */
    probe(target: WireTarget) {
      const r = resolveIn(target, doc);
      if (!("ok" in r)) return { ok: true as const, state: "visible", found: describeEl(r.pick ?? r.el) };
      if (r.code === "ambiguous") return { ok: true as const, state: "visible", found: r.message };
      return { ok: true as const, state: r.code === "timeout" ? "hidden" : "absent", found: r.message, candidates: r.candidates };
    },

    resolve(target: WireTarget) {
      const r = resolveIn(target, doc);
      if ("ok" in r) return r;
      return { ok: true as const, field: describe(r) };
    },

    /** Focus and select a text field's contents, ready for trusted input. */
    async prepareText(ref: string) {
      const r = fromRef(ref);
      if ("ok" in r) return r;
      const el = r.el;
      if (!visible(el)) return { ok: false as const, code: "timeout" as const, message: "the field never became visible", wait: true };
      const blocked = editability(el);
      if (blocked) return blocked;
      el.scrollIntoView({ block: "center" });
      el.focus({ preventScroll: true });
      const anyEl = maybe(el);
      if (typeof anyEl.select === "function") anyEl.select();
      await frames(1);
      return {
        ok: true as const,
        before: valueOf(r),
        focused: doc.activeElement === el,
        maxLength: typeof anyEl.maxLength === "number" ? anyEl.maxLength : -1,
      };
    },

    /** Commit with a real blur (trusted focusout under focus emulation), then report state. */
    async commit(ref: string) {
      const r = fromRef(ref);
      if ("ok" in r) return r;
      r.el.blur();
      await frames(2);
      return { ok: true as const, field: describe(r) };
    },

    read(ref: string) {
      const r = fromRef(ref);
      if ("ok" in r) return r;
      return { ok: true as const, value: valueOf(r) };
    },

    /** Fallback when trusted input did not land: native setter + bubbling input/change. */
    syntheticText(ref: string, value: string) {
      const r = fromRef(ref);
      if ("ok" in r) return r;
      const set = nativeSetter(r.el, "value");
      if (!set) return { ok: false as const, code: "not_editable" as const, message: "the field has no value to set" };
      set(value);
      r.el.dispatchEvent(new page.InputEvent("input", { bubbles: true, inputType: "insertText", data: value }));
      r.el.dispatchEvent(new page.Event("change", { bubbles: true }));
      return { ok: true as const, value: valueOf(r) };
    },

    /** Where to click a target (its picked member, or the field itself), checked for cover. */
    point(ref: string) {
      const r = fromRef(ref);
      if ("ok" in r) return r;
      return pointFor(pressTarget(r.pick ?? r.el));
    },

    // ---- native <select> ----

    selectNative(ref: string, wanted: string[]) {
      const r = fromRef(ref);
      if ("ok" in r) return r;
      const blocked = editability(r.el);
      if (blocked) return blocked;
      const sel = r.el as unknown as HTMLSelectElement;
      const options = Array.from(sel.options);
      const texts = options.map((o) => collapse(o.text));
      const picks: number[] = [];
      for (const w of wanted) {
        const i = matchOption(texts, w, options.map((o) => o.value));
        if (typeof i !== "number") return i;
        picks.push(i);
      }
      if (!sel.multiple && picks.length > 1) {
        return { ok: false as const, code: "no_option" as const, message: "this select takes one option; pass a string" };
      }
      sel.focus();
      options.forEach((o, i) => (o.selected = picks.includes(i)));
      sel.dispatchEvent(new page.Event("input", { bubbles: true }));
      sel.dispatchEvent(new page.Event("change", { bubbles: true }));
      return { ok: true as const, value: valueOf(r) };
    },

    // ---- comboboxes ----

    comboState(ref: string) {
      const r = fromRef(ref);
      if ("ok" in r) return r;
      const el = r.el;
      const blocked = editability(el);
      if (blocked && blocked.wait) return blocked;
      const input = maybe(el);
      const searchable = tag(el) === "INPUT" && !input.readOnly && attr(el, "inputmode") !== "none";
      const listboxes = listboxesFor(el);
      return {
        ok: true as const,
        value: valueOf(r),
        expanded: attr(el, "aria-expanded") === "true" || listboxes.length > 0,
        searchable,
        options: optionsIn(listboxes).map((o) => textWithoutControls(o)),
      };
    },

    comboOpenPoint(ref: string) {
      const r = fromRef(ref);
      if ("ok" in r) return r;
      const p = pointFor(comboControl(r.el));
      if (!p.ok && !parts.open && p.code === "timeout") return { ...p, message: `${p.message}; ${MAP_HINT("open")}` };
      return p;
    },

    comboFocus(ref: string) {
      const r = fromRef(ref);
      if ("ok" in r) return r;
      r.el.focus({ preventScroll: true });
      return { ok: true as const, focused: doc.activeElement === r.el };
    },

    /** Match `wanted` against the open options and return where to click the one it names. */
    comboPick(ref: string, wanted: string) {
      const r = fromRef(ref);
      if ("ok" in r) return r;
      const options = optionsIn(listboxesFor(r.el));
      if (!options.length) return { ok: false as const, code: "timeout" as const, message: "no options appeared", wait: true };
      const texts = options.map((o) => textWithoutControls(o));
      const i = matchOption(texts, wanted);
      if (typeof i !== "number") return i;
      options[i].scrollIntoView({ block: "nearest" });
      const p = pointFor(options[i]);
      return "ok" in p && !p.ok ? p : { ...p, text: texts[i] };
    },

    clearIndicatorPoint(ref: string) {
      const r = fromRef(ref);
      if ("ok" in r) return r;
      const x = partOf(r.el, "clear");
      if (x) return pointFor(x);
      return { ok: false as const, code: "not_editable" as const, message: `the field has no clear control web standards describe; ${MAP_HINT("clear")}` };
    },

    // ---- custom parts: checking and mapping ----

    /**
     * For Check Custom Parts: whether a combobox's parts are where a verb will look (its shown
     * value, what opens it, and its clear button when the verb would empty it). Only reads.
     */
    partsCheck(ref: string, needsClear: boolean) {
      const r = fromRef(ref);
      if ("ok" in r) return r;
      if (!isCustomSelect(r)) return { ok: true as const, lines: [] as string[], missing: [] as Part[] };
      const el = r.el;
      const lines: string[] = [];
      const missing: Part[] = [];
      const mapped = (part: Part) => (parts[part] ? "the map" : "web standards");
      if (parts.value || parts.values) {
        const shown = comboDisplay(el);
        lines.push(`value: ${shown.length ? JSON.stringify(shown) : "nothing chosen yet"} (from ${mapped("value")})`);
      } else {
        const shown = standardShown(el);
        lines.push(`value: ${JSON.stringify(shown)} (from web standards)`);
        if (!shown && shownCandidates(el).length) missing.push("value");
      }
      const open = comboControl(el);
      if (parts.open && open === el) missing.push("open");
      else if (tooSmall(open)) missing.push("open");
      else lines.push(`open: ${open === el ? "the field itself" : describeEl(open)} (from ${mapped("open")})`);
      if (needsClear) {
        const clear = partOf(el, "clear");
        if (clear) lines.push(`clear: ${describeEl(clear)} (from the map)`);
        else missing.push("clear");
      }
      return { ok: true as const, lines, missing, ...(missing.length ? { markup: partsMarkup(el) } : {}) };
    },

    /**
     * For Map Custom Parts: a draft custom parts map for this page, and what each combobox
     * showed. Deterministic: the same page gives the same map. Every selector in it was checked
     * to find exactly what each field it covers showed, and nothing near any other field.
     */
    mapCustomParts() {
      const all = entriesIn(doc);
      const combos = all.filter(isCustomSelect);
      const others = all.filter((e) => !isCustomSelect(e)).map((e) => e.el);
      const seen = combos.map((entry) => {
        const el = entry.el;
        const shown = shownCandidates(el);
        // Several shown elements sharing a class are a multiple-choice field's chosen values.
        const byToken = new Map<string, El[]>();
        for (const n of shown) for (const t of classTokens(n)) byToken.set(t, [...(byToken.get(t) ?? []), n]);
        const chips = [...byToken.values()].find((g) => g.length >= 2) ?? [];
        const single = !chips.length && shown.length === 1 && !standardShown(el) ? shown[0] : null;
        const box = fieldBox(el);
        const open = tooSmall(el) ? box.slice(1).find((a) => !tooSmall(a)) ?? null : null;
        const clear = box.length > 1
          ? (Array.from(box[box.length - 1].querySelectorAll("*")) as El[]).filter((n) =>
            n !== el && visible(n) &&
            (classTokens(n).some((t) => classWords(t).includes("clear")) ||
              /\bclear\b/i.test(`${attr(n, "aria-label") ?? ""} ${attr(n, "title") ?? ""}`))
          )
          : [];
        return { entry, el, label: displayLabel(entry), chips, single, open, clear: clear.length === 1 ? clear[0] : null };
      });
      const map: WireCustomParts = {};
      const pick = (part: Part, found: { el: El; parts: El[] }[]) => {
        if (!found.length) return;
        const sel = generalize(found, others);
        if (sel) map[part] = sel;
      };
      pick("value", seen.filter((s) => s.single).map((s) => ({ el: s.el, parts: [s.single!] })));
      pick("values", seen.filter((s) => s.chips.length).map((s) => ({ el: s.el, parts: s.chips })));
      pick("open", seen.filter((s) => s.open).map((s) => ({ el: s.el, parts: [s.open!] })));
      pick("clear", seen.filter((s) => s.clear).map((s) => ({ el: s.el, parts: [s.clear!] })));
      // A multiple-choice field shows itself only once it holds values; an ancestor class that
      // every such field has and no single-choice field has marks it while still empty.
      const multi = seen.filter((s) => s.chips.length);
      const singles = seen.filter((s) => s.single);
      if (multi.length && singles.length) {
        const tokensOf = (s: (typeof seen)[number]) => new Set(fieldBox(s.el).slice(1).flatMap(classSelectors));
        const shared = [...tokensOf(multi[0])].filter((sel) =>
          multi.every((m) => tokensOf(m).has(sel)) && singles.every((s) => !tokensOf(s).has(sel)) &&
          others.every((o) => partsNear(o, sel).length === 0)
        );
        if (shared.length) map.multiple = shared[0];
      }
      const saved = parts;
      parts = map; // read each field back through the draft, as the verbs will
      const fields = seen.map((s) => {
        const found: string[] = [];
        const missing: Part[] = [];
        const shown = comboDisplay(s.el);
        if (map.value || map.values) found.push(`value ${JSON.stringify(shown)}`);
        // Nothing shown: the field is empty, or shows its choice where no selector fit.
        if (!(Array.isArray(shown) ? shown.length : shown)) missing.push("value");
        const open = partOf(s.el, "open");
        if (open) found.push(`open ${describeEl(open)}`);
        else if (tooSmall(s.el)) missing.push("open");
        const clear = partOf(s.el, "clear");
        if (clear) found.push(`clear ${describeEl(clear)}`);
        return {
          label: s.label,
          found,
          missing,
          ...(missing.length ? { markup: partsMarkup(s.el) } : {}),
        };
      });
      parts = saved;
      return { ok: true as const, map, fields };
    },

    // ---- checkboxes, radios, button groups ----

    members(ref: string) {
      const r = fromRef(ref);
      if ("ok" in r) return r;
      const blocked = r.members.map(editability).find((b) => b);
      if (blocked && blocked.wait) return blocked;
      return { ok: true as const, kind: r.kind, members: r.members.map((m) => ({ label: memberLabel(r, m), on: memberOn(m) })) };
    },

    /** Index of the member whose label matches `wanted`. */
    memberIndex(ref: string, wanted: string) {
      const r = fromRef(ref);
      if ("ok" in r) return r;
      const i = matchOption(r.members.map((m) => memberLabel(r, m)), wanted);
      return typeof i === "number" ? { ok: true as const, index: i } : i;
    },

    memberPoint(ref: string, index: number) {
      const r = fromRef(ref);
      if ("ok" in r) return r;
      const m = r.members[index];
      if (!m) return { ok: false as const, code: "stale_ref" as const, message: "the option list changed; call fields() again" };
      return pointFor(pressTarget(m));
    },

    /**
     * When a trusted click did not change a member's state: label.click(), element.click(), then
     * the native `checked` setter with events. Stops at the first that sticks.
     */
    memberFallback(ref: string, index: number, want: boolean) {
      const r = fromRef(ref);
      if ("ok" in r) return r;
      const m = r.members[index];
      if (!m) return { ok: false as const, code: "stale_ref" as const, message: "the option list changed; call fields() again" };
      const labels = maybe(m).labels;
      const steps: [string, () => void][] = [
        ["label.click()", () => labels && labels.length && labels[0].click()],
        ["element.click()", () => m.click()],
        ["checked setter", () => {
          const set = nativeSetter(m, "checked");
          if (!set) return;
          set(want);
          for (const t of ["click", "input", "change"]) m.dispatchEvent(new page.Event(t, { bubbles: true }));
        }],
      ];
      for (const [via, step] of steps) {
        if (memberOn(m) === want) return { ok: true as const, via };
        step();
        if (memberOn(m) === want) return { ok: true as const, via };
      }
      return { ok: false as const, code: "not_committed" as const, message: `"${memberLabel(r, m)}" did not change when clicked` };
    },

    // ---- files ----

    /** Find the file input for a target (the field itself, or one near a styled Upload button). */
    uploadTarget(ref: string) {
      const r = fromRef(ref);
      if ("ok" in r) return r;
      let input: El | null = r.kind === "file" ? r.el : null;
      if (!input) {
        for (const a of [r.el, ...ancestors(r.el, 3)]) {
          input = a.querySelector("input[type=file]") as El | null;
          if (input) break;
        }
      }
      if (!input) return { ok: false as const, code: "not_found" as const, message: "there is no file input at or near that target" };
      pendingUpload = input;
      return { ok: true as const, multiple: !!maybe(input).multiple, ref: refOf(entryFor(input)) };
    },

    /** The element uploadTarget found, for DOM.setFileInputFiles (called by object handle). */
    pendingUploadElement() {
      const el = pendingUpload;
      pendingUpload = null;
      return el;
    },

    clearFile(ref: string) {
      const r = fromRef(ref);
      if ("ok" in r) return r;
      maybe(r.el).files = new page.DataTransfer().files;
      r.el.dispatchEvent(new page.Event("input", { bubbles: true }));
      r.el.dispatchEvent(new page.Event("change", { bubbles: true }));
      return { ok: true as const, value: valueOf(r) };
    },

    /** Blur whatever has focus (commit), then report the field. */
    async settle(ref: string) {
      const r = fromRef(ref);
      if ("ok" in r) return r;
      const active = doc.activeElement;
      if (active && active !== doc.body) active.blur();
      await frames(2);
      return { ok: true as const, field: describe(r) };
    },
  };

  return api;
}
