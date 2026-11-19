// The run's environment (deno/run-env.ts): the SDK's list of names is the one the runner sets
// (lib/permissions.js ENV_NAMES) and the one the test task may read (deno.json), and reading a name
// never falls back to a value.
import { assertEquals, assertThrows } from "jsr:@std/assert@^1";
import { RUN_ENV_NAMES, runEnv } from "tranquil-automations/deno/run-env.ts";
import type { PermissionsModule } from "tranquil-automations/types/permissions.ts";

// lib/permissions.js requires nothing, so it is evaluated as CommonJS directly, as
// test/lib/permissions_test.ts does.
const mod = { exports: {} as PermissionsModule };
new Function(
  "module",
  "exports",
  Deno.readTextFileSync(new URL(import.meta.resolve("tranquil-automations/lib/permissions.js"))),
)(
  mod,
  mod.exports,
);

Deno.test("the runner sets exactly the names the SDK reads", () => {
  assertEquals([...mod.exports.ENV_NAMES].sort(), [...RUN_ENV_NAMES].sort());
});

Deno.test("the test task may read every name the SDK reads", () => {
  const config: { tasks: { test: string } } = JSON.parse(
    Deno.readTextFileSync(new URL(import.meta.resolve("tranquil-automations/deno.json"))),
  );
  const allowed = /--allow-env=(\S+)/.exec(config.tasks.test)?.[1].split(",") ?? [];
  assertEquals(allowed.filter((name) => name.startsWith("TRANQUIL_")).sort(), [...RUN_ENV_NAMES].sort());
});

Deno.test("an unset name throws, naming it, rather than reading as empty", () => {
  Deno.env.delete("TRANQUIL_SITES");
  assertThrows(() => runEnv("TRANQUIL_SITES"), Error, "TRANQUIL_SITES is not set");
});

Deno.test("a name set to empty reads as empty", () => {
  Deno.env.set("TRANQUIL_SITES", "");
  try {
    assertEquals(runEnv("TRANQUIL_SITES"), "");
  } finally {
    Deno.env.delete("TRANQUIL_SITES");
  }
});
