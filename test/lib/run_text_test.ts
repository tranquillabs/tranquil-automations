// A finished run as text (lib/run-text.js): the Runs panel's text, moved out of runs-panel.js so a
// workbook writes outputs in the same words. The module requires nothing, so it is evaluated as
// CommonJS directly.
import { assertEquals } from "jsr:@std/assert@^1";
import type { RunTextModule } from "tranquil-automations/types/run-text.ts";

// Filled in by evaluating the module; its shape is RunTextModule.
const mod = { exports: {} as RunTextModule };
new Function(
  "module",
  "exports",
  Deno.readTextFileSync(new URL(import.meta.resolve("tranquil-automations/lib/run-text.js"))),
)(mod, mod.exports);
const { STATE_LABELS, actionLine, formatDuration, runText } = mod.exports;

Deno.test("durations read as the panel shows them", () => {
  assertEquals(formatDuration(850), "850ms");
  assertEquals(formatDuration(1200), "1s");
  assertEquals(formatDuration(59_400), "59s");
  assertEquals(formatDuration(60_000), "1m");
  assertEquals(formatDuration(95_000), "1m 35s");
});

Deno.test("a run's text is its output, its actions and its result, in that order", () => {
  const text = runText({
    output: "Read 6 fields\n\n",
    actions: [
      { verb: "fill", target: '{ label: "Email" }', site: "localhost", outcome: "ok", ms: 41 },
      { verb: "click", target: '{ role: "button" }', outcome: "not_permitted", ms: 3 },
    ],
    result: { filled: 5 },
  });
  assertEquals(
    text,
    [
      "Read 6 fields",
      "",
      "Actions (2):",
      'fill  ·  { label: "Email" }  ·  on localhost  ·  ok  ·  41 ms',
      'click  ·  { role: "button" }  ·  not_permitted  ·  3 ms',
      "",
      "Result:",
      '{\n  "filled": 5\n}',
    ].join("\n"),
  );
  assertEquals(runText({}), "");
  assertEquals(actionLine({ verb: "press", outcome: "ok", ms: 7 }), "press  ·  ok  ·  7 ms");
});

Deno.test("state labels", () => {
  assertEquals(STATE_LABELS.succeeded, "ok");
  assertEquals(STATE_LABELS["timed-out"], "timed out");
});
