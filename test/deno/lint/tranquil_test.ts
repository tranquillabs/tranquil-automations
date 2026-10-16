/// <reference lib="deno.unstable" />
import { assertEquals } from "jsr:@std/assert@^1";
import plugin from "tranquil-automations/deno/lint/tranquil.ts";

// The rules about the header as a whole would fire on nearly every snippet below, so each test
// sees only the rules it is about: the original four by default, or the one it names.
const WHOLE_SCRIPT = new Set(["tranquil/submit-unconfirmed", "tranquil/sites-undeclared", "tranquil/literal-secret"]);
const run = (src: string, only?: string) =>
  Deno.lint.runPlugin(plugin, "script.ts", src)
    .filter((d) => (only ? d.id === `tranquil/${only}` : !WHOLE_SCRIPT.has(d.id)))
    .map((d) => `${d.id}@${src.slice(d.range[0], d.range[1]).slice(0, 30)}`);

Deno.test("page-free-global flags bare browser globals in page code only", () => {
  const src = `// @permissions page-js
const x = await tab.evaluate((page) => { fetch("/x"); return page.document.title + document.title; });
const y = location.href; // Deno-side: not page code
await tab.waitFor((page) => !!page.document.querySelector("p"));`;
  assertEquals(run(src), ["tranquil/page-free-global@fetch", "tranquil/page-free-global@document"]);
});

Deno.test("page-js-undeclared needs page-js or browser in the header", () => {
  const code = `\nawait tab.evaluate((page) => page.document.title);`;
  assertEquals(run(`// @permissions forms${code}`).map((d) => d.split("@")[0]), ["tranquil/page-js-undeclared"]);
  assertEquals(run(`// @permissions page-js${code}`), []);
  assertEquals(run(`// @permissions browser${code}`), []);
  assertEquals(run(`// @permissions forms\nawait tab.waitFor("p");`), [], "a selector is not page code");
  assertEquals(run(`// a module a script imports\nexport const title = () => tab.evaluate((page) => page.document.title);`), [],
    "a module has no header of its own: the importing script's header governs it");
});

Deno.test("opaque-page-code flags string evaluate", () => {
  assertEquals(run(`// @permissions page-js\nawait tab.evaluate("document.title");`).map((d) => d.split("@")[0]), [
    "tranquil/opaque-page-code",
  ]);
});

Deno.test("brittle-css-target flags positional, generated and long selectors only", () => {
  const src = `// @permissions forms
await tab.fill("#email", "a"); // stable id: fine
await tab.fill('input[name="email"]', "a"); // stable attribute: fine
await tab.click("form > div:nth-child(3) button");
await tab.fill("#picker-3-input", "x");
await tab.fill("._fieldEntry_hkyf8_29 input", "x");
await tab.fill({ label: "Phone", within: "main div.form section .group" }, "1");
await tab.clear("#question_12345678");
await tab.waitFor(".css-1x2y3z");`;
  assertEquals(run(src).map((d) => d.split("@")[1]), [
    '"form > div:nth-child(3) butto',
    '"#picker-3-input"',
    '"._fieldEntry_hkyf8_29 input"',
    '"main div.form section .group"',
    '"#question_12345678"',
    '".css-1x2y3z"',
  ]);
});

Deno.test("submit-unconfirmed: a script that may submit must ask", () => {
  assertEquals(run(`// @permissions submit sites=x.com\nawait tab.click({ text: "Send" });`, "submit-unconfirmed").length, 1);
  assertEquals(run(`// @permissions submit sites=x.com\nif (await ui.confirm("Send?")) await tab.click({ text: "Send" });`, "submit-unconfirmed"), []);
  assertEquals(run(`// @permissions browser sites=x.com\nawait tab.click({ text: "Send" });`, "submit-unconfirmed").length, 1, "browser implies submit");
  assertEquals(run(`// @permissions forms sites=x.com\nawait tab.click({ text: "Next" });`, "submit-unconfirmed"), [], "forms cannot submit");
});

Deno.test("sites-undeclared: acting on pages needs a sites= limit", () => {
  assertEquals(run("// @permissions forms\nawait tab.fill({ label: 'A' }, 'b');", "sites-undeclared").length, 1);
  assertEquals(run("// @permissions forms sites=x.com\nawait tab.fill({ label: 'A' }, 'b');", "sites-undeclared"), []);
  assertEquals(run("// @permissions tabs\nconsole.log(1);", "sites-undeclared"), [], "reading only");
  assertEquals(run("// @permissions browser\nconsole.log(1);", "sites-undeclared").length, 1, "browser acts on pages");
});

Deno.test("literal-secret: secrets come from files, not the script", () => {
  const src = `// @permissions forms sites=x.com
await tab.fill({ label: "Password" }, "hunter2");
await tab.fill({ label: "Email" }, "ada@example.com");
await tab.fill({ label: "Token" }, token, { sensitive: true });
await tab.fill("#k", "abc", { sensitive: true });`;
  assertEquals(run(src, "literal-secret").map((d) => d.split("@")[1]), ['"hunter2"', '"abc"']);
});
