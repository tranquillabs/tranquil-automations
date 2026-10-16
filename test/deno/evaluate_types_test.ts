// The types of tab.evaluate (ADR-0026), checked at compile time: `deno test` type-checks this file,
// so every @ts-expect-error below must still be an error and every other line must compile.
import type { Tab } from "tranquil-automations/deno/tabs.ts";

// Never called: only its types matter.
async function _types(tab: Tab) {
  // No type argument: the arguments are checked against the parameters, the result is inferred.
  const _count: Promise<number> = tab.evaluate((page, sel: string) => page.document.querySelectorAll(sel).length, "p");
  // @ts-expect-error the argument does not match the parameter
  tab.evaluate((_page, sel: string) => sel.length, 42);
  // @ts-expect-error a missing argument
  tab.evaluate((_page, sel: string) => sel.length);

  // A named result: the function's return is checked against it.
  const _ok: Promise<boolean> = tab.evaluate<boolean>((_page, n: number) => n > 1, 3);
  // @ts-expect-error the function returns a number, not the named string
  tab.evaluate<string>((page) => page.document.title.length);

  // A string expression: unknown unless named.
  const _unknown: Promise<unknown> = tab.evaluate("document.title");
  const _named: Promise<string> = tab.evaluate<string>("document.title");
  // The type of the variable it is assigned to names it too.
  const _contextual: Promise<string> = tab.evaluate("document.title");
  // @ts-expect-error an unnamed string result is unknown, not a string
  const _len: number = (await tab.evaluate("document.title")).length;
}

Deno.test("tab.evaluate's types are checked when this file type-checks", () => {
  void _types;
});
