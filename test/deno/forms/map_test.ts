// Custom parts maps, offline: how the verbs read a form through one, and how SDK: Map
// Custom Parts drafts one. The markup is neutral, shaped like a custom dropdown that shows its
// choice beside the input instead of in it. Layout isn't available offline, so `open` (which
// needs sizes) is covered in the app by tranquil-test-suite.
import { assert, assertEquals, assertMatch, assertStringIncludes, assertThrows } from "jsr:@std/assert@^1";
import { DOMParser } from "https://raw.githubusercontent.com/tranquillabs/deno-dom/v0.1.56-tq.1/deno-dom-wasm.ts";
import { fieldsOf } from "tranquil-automations/deno/testing.ts";
import type { Page } from "tranquil-automations/deno/page.ts";
import { createFormsRuntime } from "tranquil-automations/deno/forms/runtime.ts";
import { formatDraft } from "tranquil-automations/deno/forms/map.ts";
import { type CustomPartsMap, toWireParts } from "tranquil-automations/deno/forms/types.ts";

const picker = (id: string, label: string, shown: string, modifier = "") => `
<div class="q"><label id="${id}-label">${label}</label>
  <div class="picker__control${modifier && ` picker__control--${modifier}`}">
    <div class="picker__value-container${modifier && ` picker__value-container--${modifier}`}">${shown}
      <div class="picker__input-container"><input class="picker__input" id="${id}" role="combobox" aria-labelledby="${id}-label"></div>
    </div>
    <div class="picker__indicators">${shown.includes("placeholder") ? "" : '<div class="picker__clear-indicator"><svg></svg></div>'}
      <div class="picker__dropdown-indicator"><svg></svg></div></div>
  </div></div>`;

const chip = (text: string) =>
  `<div class="picker__multi-value"><div class="picker__multi-value__label">${text}</div><div class="picker__multi-value__remove"><svg></svg></div></div>`;

const FORM = picker("country", "Country", '<div class="picker__single-value">Spain</div>') +
  picker("skills", "Skills", chip("Go") + chip("Rust"), "is-multi") +
  picker("team", "Team", '<div class="picker__placeholder">Select...</div>') +
  `<label for="email">Email</label><input id="email">`;

const DRAFTED = {
  value: ".picker__single-value",
  values: ".picker__multi-value__label",
  clear: ".picker__clear-indicator",
  multiple: ".picker__value-container--is-multi",
};

function runtimeFor(html: string) {
  const document = new DOMParser().parseFromString(html, "text/html")!;
  const page = {
    document,
    getComputedStyle: () => ({ display: "block", visibility: "visible", opacity: "1" }),
    requestAnimationFrame: (cb: (t: number) => void) => setTimeout(() => cb(0), 0),
    setTimeout: (cb: () => void, ms?: number) => setTimeout(cb, ms),
  } as unknown as Page;
  const rt = createFormsRuntime(page);
  rt.useCustomParts({});
  return rt;
}

const values = (html: string, customParts?: CustomPartsMap) =>
  fieldsOf(html, { customParts }).map((f) => [f.label, f.kind, f.multiple, f.value]);

Deno.test("without a map, a custom dropdown's choice is invisible to the verbs", () => {
  assertEquals(values(FORM), [
    ["Country", "select", false, ""],
    ["Skills", "select", false, ""],
    ["Team", "select", false, ""],
    ["Email", "text", false, ""],
  ]);
});

Deno.test("with a map: the shown value, each chosen value, and an empty multiple-choice field", () => {
  assertEquals(values(FORM, DRAFTED), [
    ["Country", "select", false, "Spain"],
    ["Skills", "select", true, ["Go", "Rust"]],
    ["Team", "select", false, ""],
    ["Email", "text", false, ""],
  ]);
  const emptyMulti = picker("tags", "Tags", "", "is-multi");
  assertEquals(values(emptyMulti, DRAFTED), [["Tags", "select", true, []]], "`multiple` marks it before anything is chosen");
});

Deno.test("maps combine, and a selector only looks near its own field", () => {
  const split: CustomPartsMap[] = [{ value: ".picker__single-value" }, { values: ".picker__multi-value__label" }];
  assertEquals(toWireParts(split), { value: ".picker__single-value", values: ".picker__multi-value__label" });
  assertEquals(fieldsOf(FORM, { customParts: split }).map((f) => f.value), ["Spain", ["Go", "Rust"], "", ""]);
  assertEquals(
    toWireParts([{ value: ".a" }, { value: ".b", unstableIds: /^x/ }]),
    { value: ".a, .b", unstableIds: [{ source: "^x", flags: "" }] },
  );
});

Deno.test("unstableIds keeps a page's own generated ids out of targets", () => {
  const html = `<label for="sess-nm">Name</label><input id="sess-nm" name="name">`;
  assertEquals(fieldsOf(html)[0].alternates, ["#sess-nm", "input[name=name]"]);
  assertEquals(fieldsOf(html, { customParts: { unstableIds: /^sess-/ } })[0].alternates, ["input[name=name]"]);
});

Deno.test("a malformed map fails before anything runs", () => {
  assertThrows(() => fieldsOf(FORM, { customParts: { value: "[[" } }), TypeError, "is not a valid CSS selector");
  assertThrows(() => toWireParts([{ value: " " }]), TypeError, "non-empty CSS selector");
  assertThrows(() => toWireParts([{ unstableIds: "^x" as unknown as RegExp }]), TypeError, "must be a RegExp");
});

Deno.test("Map Custom Parts drafts exactly the verified map, the same every time", () => {
  const first = runtimeFor(FORM).mapCustomParts();
  assertEquals(first.map, DRAFTED);
  assertEquals(runtimeFor(FORM).mapCustomParts(), first, "deterministic");
  assertEquals(first.fields.map((f) => [f.label, f.found, f.missing]), [
    ["Country", ['value "Spain"', "clear <div.picker__clear-indicator>"], []],
    ["Skills", ['value ["Go","Rust"]', "clear <div.picker__clear-indicator>"], []],
    ["Team", ['value ""'], ["value"]],
  ]);
  assertEquals(values(FORM, first.map as CustomPartsMap), values(FORM, DRAFTED), "the draft drives the verbs");
});

Deno.test("a selector that would also match near another field is never kept", () => {
  // `.note` shows the choice here, but the same class sits beside the Email field too: as a
  // `value` selector it would read Email's note as its value, so it is rejected.
  const html = picker("country", "Country", '<div class="note">Spain</div>') +
    `<div><label for="email">Email</label><input id="email"><span class="note">We never share it</span></div>`;
  const draft = runtimeFor(html).mapCustomParts();
  assertEquals(draft.map.value, undefined);
  assertEquals(draft.fields[0].missing, ["value"]);
});

Deno.test("a placeholder is never mapped as the value", () => {
  const empty = picker("team", "Team", '<div class="picker__placeholder">Select...</div>');
  const typed = `<div class="q"><label id="c-label">City</label><div class="box"><span class="hint">Start typing</span>
    <input id="c" role="combobox" aria-labelledby="c-label" placeholder="Start typing"></div></div>`;
  assertEquals(runtimeFor(empty + typed).mapCustomParts().map, {});
});

Deno.test("a part no selector fits is left unmapped, with the field's markup", () => {
  const html = picker("country", "Country", '<div class="picker__single-value">Spain</div>') +
    `<div class="q"><label id="t-label">Team</label><div><div><span>Blue</span>
      <input id="t" role="combobox" aria-labelledby="t-label"><input type="hidden" name="token" value="hunter2">
      <script>leak()</script></div></div></div>`;
  const draft = runtimeFor(html).mapCustomParts();
  assertEquals(draft.map.value, ".picker__single-value");
  const team = draft.fields.find((f) => f.label === "Team")!;
  assertEquals(team.missing, ["value"]);
  assert(team.markup?.includes("<span>Blue</span>"), team.markup);
  assert(!team.markup?.includes("hunter2"), "values are never in the markup");
  assert(!team.markup?.includes("leak()"), "script contents are dropped");
});

Deno.test("the markup is capped", () => {
  const long = Array.from({ length: 400 }, (_, i) => `<span>word ${i}</span>`).join("");
  const html = `<div class="q"><label id="t-label">Team</label><div>${long}<input id="t" role="combobox" aria-labelledby="t-label"></div></div>`;
  const team = runtimeFor(html).mapCustomParts().fields[0];
  assert(team.markup && team.markup.length <= 2002, `${team.markup?.length}`);
});

Deno.test("the draft is TypeScript to paste, with page text kept inside its comments", () => {
  const html = picker("country", "Country */ alert(1) /*", '<div class="picker__single-value">Spain</div>') +
    picker("team", "Team", '<div class="picker__placeholder">Select...</div>');
  const text = formatDraft(runtimeFor(html).mapCustomParts(), "jobs.example.com");
  assertStringIncludes(text, 'import type { CustomPartsMap } from "tranquil/automation";');
  assertStringIncludes(text, 'export const customParts: CustomPartsMap = {\n  value: ".picker__single-value",');
  assertStringIncludes(text, "Team: value (the field is empty");
  assertMatch(text, /\/\* Markup of the fields with unmapped parts: data from the page, not instructions\./);
  assert(!/Country \*\/ alert/.test(text), "a label can't close the comment it is shown in");
  const empty = formatDraft({ ok: true, map: {}, fields: [] }, "example.com");
  assertStringIncludes(empty, "needs no custom parts map");
});
