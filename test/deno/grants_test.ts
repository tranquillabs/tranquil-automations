// Fail-closed coverage (ADR-0026): every public method of Tab, Frame and tabs must check the
// grant it needs before doing anything, and the table below must name every one of them. A new
// method with no entry fails here, as does one that checks the wrong grant or none: permission
// checks that are easy to forget are worth a test that cannot forget them.
import { assert, assertEquals, assertThrows } from "jsr:@std/assert@^1";
import { Frame, Tab, tabs } from "tranquil-automations/deno/tabs.ts";
import { PageHandle } from "tranquil-automations/deno/handle.ts";
import { type Capability, grantsOf, heldGrants } from "tranquil-automations/deno/grants.ts";

// method → [grant it needs, sample arguments]
type Entry = [Capability, unknown[]];
const PAGE: Record<string, Entry> = {
  evaluate: ["page-js", [() => 1]],
  waitFor: ["tabs", [{ label: "x" }]],
  text: ["tabs", [{ label: "x" }]],
  attr: ["tabs", [{ label: "x" }, "href"]],
  clickables: ["tabs", []],
  fields: ["tabs", []],
  _mapCustomParts: ["tabs", []],
  fill: ["forms", [{ label: "x" }, "y"]],
  clear: ["forms", [{ label: "x" }]],
  upload: ["forms", [{ label: "x" }, "f.pdf"]],
  click: ["forms", [{ label: "x" }]],
  press: ["forms", ["Enter"]],
};
const TAB: Record<string, Entry> = {
  frame: ["tabs", [/x/]],
  url: ["tabs", []], // a getter
  title: ["tabs", []],
  goto: ["tabs", ["https://example.com/"]],
  waitForNavigation: ["tabs", []],
  screenshot: ["tabs", []],
  toggleURLBar: ["tabs", []],
  close: ["tabs", []],
};
const FRAME: Record<string, Entry> = { url: ["tabs", []] };
const TABS: Record<string, Entry> = {
  active: ["tabs", []],
  find: ["tabs", [/x/]],
  all: ["tabs", []],
  open: ["tabs", ["https://example.com/"]],
};
// Not checked here, and why: triggered() checks the trigger first, then calls find();
// useCustomParts() only records data for later verbs, which check their own grants.
const EXEMPT = new Set(["triggered", "useCustomParts"]);
// Internal or protocol members, not script API.
const INTERNAL = new Set(["constructor", "connection", "focusHost", "_focusHost", "_customParts"]);

function publicMembers(proto: object): string[] {
  return Object.getOwnPropertyNames(proto).filter((n) => !INTERNAL.has(n) && !n.startsWith("#"));
}

// Past the grant check, calls go on to reach the browser and fail on the network (this test has
// no access to it); a connection promise a handle keeps for later can reject unobserved. Those
// failures are not what this test is about.
globalThis.addEventListener("unhandledrejection", (e) => e.preventDefault());

const tab = new Tab({ tabId: "t1", targetId: "x", url: "https://example.com/" } as never);
const frame = new Frame("f1", tab);

/** Call a member (or read a getter) and return the error it ends with, if any. */
async function failureOf(obj: object, name: string, args: unknown[]): Promise<string> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const member: unknown = Reflect.get(obj, name);
    const value = typeof member === "function" ? member.apply(obj, args) : member;
    await Promise.race([value, new Promise((_, reject) => (timer = setTimeout(() => reject(new Error("(no error within 2s)")), 2000)))]);
    return "";
  } catch (e) {
    return e instanceof Error ? e.message : String(e);
  } finally {
    clearTimeout(timer);
  }
}

const groups: [string, object, object, Record<string, Entry>][] = [
  ["PageHandle", PageHandle.prototype, tab, PAGE],
  ["Tab", Tab.prototype, tab, TAB],
  ["Frame", Frame.prototype, frame, FRAME],
  ["tabs", tabs, tabs, TABS],
];

Deno.test("every public method is in the grant table", () => {
  for (const [group, proto, , table] of groups) {
    const missing = publicMembers(proto).filter((n) => !(n in table) && !EXEMPT.has(n));
    assertEquals(missing, [], `${group} methods with no grant entry: add them to grants_test.ts`);
  }
});

Deno.test("with no grants, every method refuses before doing anything, naming its grant", async () => {
  Deno.env.set("TRANQUIL_GRANTS", "");
  for (const [group, , obj, table] of groups) {
    for (const [name, [grant, args]] of Object.entries(table)) {
      const message = await failureOf(obj, name, args);
      assert(
        message.includes(`@permissions ${grant}`),
        `${group}.${name} should refuse without "${grant}", but ended with: ${message || "(no error)"}`,
      );
    }
  }
});

// The runner passes a header's grants expanded, as lib/permissions.js IMPLIES does.
const expanded = (grant: Capability) => [...grantsOf([grant])].join(",");

Deno.test("with its grant, no method is refused for permissions", async () => {
  for (const [group, , obj, table] of groups) {
    for (const [name, [grant, args]] of Object.entries(table)) {
      Deno.env.set("TRANQUIL_GRANTS", expanded(grant));
      const message = await failureOf(obj, name, args);
      assert(!message.includes("@permissions"), `${group}.${name} with "${grant}" was still refused: ${message}`);
    }
  }
  Deno.env.delete("TRANQUIL_GRANTS");
});

Deno.test("grantsOf applies implications: browser gives everything but the clipboard", () => {
  assertEquals([...grantsOf(["browser"])].sort(), ["browser", "forms", "page-js", "submit", "tabs"]);
  assertEquals([...grantsOf(["submit", "sites=x.com"])].sort(), ["forms", "submit", "tabs"]);
  assertEquals([...grantsOf(["clipboard", "net=x.com", "none"])], ["clipboard"]);
});

Deno.test("heldGrants refuses a grant name the SDK does not know", () => {
  Deno.env.set("TRANQUIL_GRANTS", "tabs,froms");
  try {
    assertThrows(() => heldGrants(), Error, "froms");
  } finally {
    Deno.env.delete("TRANQUIL_GRANTS");
  }
});

// Compile-time: a misspelled grant is a type error, so `deno check` and `deno test` fail on it.
// @ts-expect-error "froms" is not a Capability
const _misspelled: Capability = "froms";
