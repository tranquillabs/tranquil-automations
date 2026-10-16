// Host-side permission header parsing (ADR-0022 specific 2, split by ADR-0026). Plain Deno
// tests over the CommonJS module the app loads. It requires nothing, so it is evaluated as
// CommonJS directly rather than through Node's loader.
import { assert, assertEquals, assertThrows } from "jsr:@std/assert@^1";
import { CAPABILITIES, IMPLIES } from "tranquil-automations/deno/grants.ts";

/** What lib/permissions.js exports, as far as these tests use it. */
type Grants = Record<string, boolean | string[]> & { sites: string[]; declaredCapabilities: string[] };
interface PermissionsModule {
  parseHeader(source: string): { grants: Grants; timeoutMs: number | null };
  canonicalGrants(grants: Grants): string;
  renderGrants(grants: Grants): string[];
  hasGrants(grants: Grants): boolean;
  pageApiUse(source: string): string[];
  CAPABILITY_KEYS: string[];
  IMPLIES: Readonly<Record<string, readonly string[]>>;
}
// Filled in by evaluating the module; its shape is PermissionsModule.
const mod = { exports: {} as PermissionsModule };
new Function("module", "exports", Deno.readTextFileSync(new URL(import.meta.resolve("tranquil-automations/lib/permissions.js"))))(
  mod,
  mod.exports,
);
const { parseHeader, canonicalGrants, renderGrants, hasGrants, pageApiUse } = mod.exports;

Deno.test("the runner's grant names and implications match the SDK's typed list (deno/grants.ts)", () => {
  assertEquals([...mod.exports.CAPABILITY_KEYS].sort(), [...CAPABILITIES].sort());
  assertEquals(mod.exports.IMPLIES, IMPLIES);
});

Deno.test("pageApiUse lists sensitive page.* access for the consent prompt", () => {
  const src = `await tab.evaluate((page) => page.fetch("/api", { body: page.document.cookie }));
    await tab.evaluate((page) => page.localStorage.getItem("t"));
    await tab.evaluate((page) => { page.location.href = "https://x"; });`;
  assertEquals(pageApiUse(src), [
    "make network requests as you",
    "read cookies",
    "read stored site data",
    "navigate or open windows",
  ]);
  assertEquals(pageApiUse(`tab.evaluate((page) => page.document.title)`), [], "reading the DOM is not listed");
  assertEquals(pageApiUse(`if (page.location.href === "x") {}`), [], "reading location is not navigating");
});

const header = (line: string) => parseHeader(`// @permissions ${line}\nconsole.log(1);`).grants;

Deno.test("browser still means everything, and keeps its existing approval string", () => {
  const g = header("browser");
  assertEquals([g.browser, g.tabs, g.forms, g["page-js"]], [true, true, true, true]);
  assertEquals(canonicalGrants(g), "browser", "an approval stored before the split still matches");
  assertEquals([g.submit], [true], "browser includes submit, as it always could");
  assertEquals(renderGrants(g).length, 3, "control the browser, submit forms, and on which sites");
});

Deno.test("submit implies forms and tabs; sites= is checked and part of the approval", () => {
  const g = header("submit sites=jobs.example.com,*.example.org");
  assertEquals([g.submit, g.forms, g.tabs, g["page-js"]], [true, true, true, false]);
  assertEquals(g.sites, ["jobs.example.com", "*.example.org"]);
  assertEquals(canonicalGrants(g), "sites=*.example.org,jobs.example.com submit");
  const lines = renderGrants(g).join("\n");
  assert(lines.includes("Submit forms"), lines);
  assert(lines.includes("Only on these sites: jobs.example.com, *.example.org"), lines);
  assert(renderGrants(header("forms")).join("\n").includes("On any site"), "no sites= says so");
  for (const bad of ["https://x.com", "x.com/path", "x.com:8080", "*"]) {
    let threw = false;
    try {
      header(`forms sites=${bad}`);
    } catch {
      threw = true;
    }
    assert(threw, `sites=${bad} is refused`);
  }
});

Deno.test("forms and page-js each imply tabs, and nothing more", () => {
  const forms = header("forms");
  assertEquals([forms.tabs, forms.forms, forms["page-js"], forms.browser], [true, true, false, false]);
  const js = header("page-js");
  assertEquals([js.tabs, js.forms, js["page-js"]], [true, false, true]);
  assertEquals(canonicalGrants(header("forms read=resume.pdf")), "forms read=resume.pdf");
});

Deno.test("consent describes each browser key separately", () => {
  const lines = renderGrants(header("tabs forms page-js"));
  assert(lines.some((l: string) => /Run its own code inside pages/.test(l)));
  assert(lines.some((l: string) => /Fill in and click/.test(l)));
  assert(lines.some((l: string) => /Open and read browser tabs/.test(l)));
  assert(hasGrants(header("tabs")));
});

Deno.test("capability keys take no value; unknown keys are refused", () => {
  assertThrows(() => header("forms=all"), Error, "takes no value");
  assertThrows(() => header("browse"), Error, "Unknown @permissions key");
});
