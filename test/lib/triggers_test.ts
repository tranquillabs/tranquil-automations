// What started a run (lib/triggers.js): the strings it builds, what it reads back, which runs a
// person started, and that the SDK's own parser (deno/context.ts) reads every string the same way.
import { assertEquals } from "jsr:@std/assert@^1";
import { parseTrigger as sdkParse } from "tranquil-automations/deno/context.ts";
import type { RunTrigger, TriggersModule } from "tranquil-automations/types/triggers.ts";

// lib/triggers.js requires nothing, so it is evaluated as CommonJS directly, as
// test/lib/permissions_test.ts does.
const mod = { exports: {} as TriggersModule };
new Function(
  "module",
  "exports",
  Deno.readTextFileSync(new URL(import.meta.resolve("tranquil-automations/lib/triggers.js"))),
)(mod, mod.exports);
const t = mod.exports;

const cases: [string, RunTrigger][] = [
  [t.MANUAL, { kind: "manual" }],
  [t.DEBUG, { kind: "debug" }],
  [t.commandTrigger("Fill the form"), { kind: "command", name: "Fill the form" }],
  [t.urlTrigger("https://example.com/a?b=c:d"), { kind: "url", url: "https://example.com/a?b=c:d" }],
  [
    t.workbookTrigger("/p/workbooks/acme.workbook.md"),
    { kind: "workbook", path: "/p/workbooks/acme.workbook.md", folder: "/p/workbooks/acme" },
  ],
];

Deno.test("each trigger reads back as what was built", () => {
  for (const [raw, expected] of cases) assertEquals(t.parseTrigger(raw), expected, raw);
});

Deno.test("anything unrecognized, or nothing, reads as manual", () => {
  for (const raw of [undefined, "", "weekly", "debug:x"]) assertEquals(t.parseTrigger(raw), { kind: "manual" });
});

Deno.test("the SDK reads every trigger as the runner does, except a debug run, which it sees as manual", () => {
  for (const [raw, expected] of cases) {
    assertEquals(sdkParse(raw), expected.kind === "debug" ? { kind: "manual" } : expected, raw);
  }
  for (const raw of ["", "weekly"]) assertEquals(sdkParse(raw), t.parseTrigger(raw));
});

Deno.test("every run a person started is attended; a page load isn't", () => {
  const attended = cases.map(([raw]) => [t.parseTrigger(raw).kind, t.isAttended(raw)]);
  assertEquals(attended, [
    ["manual", true],
    ["debug", true],
    ["command", true],
    ["url", false],
    ["workbook", true],
  ]);
});
