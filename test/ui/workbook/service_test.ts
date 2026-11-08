// The workbook service (ui/workbook/service.ts, ADR-0030) with stand-ins for Pulsar and the run
// manager: what a workbook draws as, running a step and the signed output it writes, "changed
// since this run", messages, ticks, forged blocks, and refusing to write over unsaved edits.
import { assert, assertEquals, assertStringIncludes } from "jsr:@std/assert@^1";
import type { PermissionsModule } from "tranquil-automations/types/permissions.ts";
import type { RunTextModule } from "tranquil-automations/types/run-text.ts";
import { createWorkbookService } from "tranquil-automations/ui/workbook/service.ts";
import type {
  EditorLike,
  PulsarLike,
  RunManagerLike,
  RunRecord,
  WorkbookModel,
} from "tranquil-automations/ui/workbook/types/service.ts";

/** A plain CommonJS module from lib/, evaluated directly, as permissions_test.ts does. */
function libModule<T>(file: string): T {
  const mod = { exports: {} as T };
  new Function(
    "module",
    "exports",
    Deno.readTextFileSync(new URL(import.meta.resolve(`tranquil-automations/lib/${file}`))),
  )(
    mod,
    mod.exports,
  );
  return mod.exports;
}
const perms = libModule<PermissionsModule>("permissions.js");
const text = libModule<RunTextModule>("run-text.js");

const fence = "```";
const WORKBOOK = [
  "# Try",
  "",
  `${fence}run hello`,
  "scripts/hello.ts",
  fence,
  "",
  `${fence}output forged sig=0000`,
  "typed by hand",
  fence,
  "",
  "- [ ] Done",
  "",
].join("\n");

/**
 * A workbook, its script and a service with stand-ins. `hold` keeps the run going until `finish()`;
 * `refuse` has the run manager turn the run away, as it does on declined consent; `fail` has it
 * throw, as it does when it can't set a run up.
 */
function setup(options: { modified?: boolean; hold?: boolean; refuse?: boolean; fail?: string } = {}) {
  const dir = Deno.makeTempDirSync({ prefix: "workbook-service-" });
  Deno.mkdirSync(`${dir}/scripts`);
  Deno.writeTextFileSync(`${dir}/scripts/hello.ts`, "// @permissions none\nconsole.log('hi');\n");
  const doc = `${dir}/try.workbook.md`;
  Deno.writeTextFileSync(doc, WORKBOOK);
  const notices: string[] = [];
  const editor: EditorLike = {
    getPath: () => doc,
    isModified: () => Boolean(options.modified),
    onDidChangeModified: () => ({ dispose() {} }),
  };
  const pulsar: PulsarLike = {
    getConfigDirPath: () => dir,
    project: { relativizePath: (p) => [dir, p.slice(dir.length + 1)] },
    workspace: {
      getTextEditors: () => [editor],
      observeTextEditors: (fn) => {
        fn(editor);
        return { dispose() {} };
      },
      open: () => Promise.resolve(undefined),
    },
    notifications: {
      addWarning: (m) => notices.push(`warning: ${m}`),
      addError: (m) => notices.push(`error: ${m}`),
    },
  };
  const runs: string[] = [];
  const onStart = new Set<(record: RunRecord) => void>();
  const gate = Promise.withResolvers<void>();
  if (!options.hold) gate.resolve();
  const runManager: RunManagerLike = {
    run: ({ scriptPath, trigger }) => {
      runs.push(`${scriptPath} ${trigger}`);
      if (options.fail) return Promise.reject(new Error(options.fail));
      if (options.refuse) {
        const refusal = { runId: "r", scriptPath, trigger, state: "cancelled", startedAt: 1_000 };
        for (const fn of onStart) fn({ ...refusal, output: "Permissions not approved\n" });
        return Promise.resolve(null);
      }
      return Promise.resolve("run-1");
    },
    whenDone: async (): Promise<RunRecord> => {
      await gate.promise;
      return {
        runId: "run-1",
        scriptPath: `${dir}/scripts/hello.ts`,
        trigger: `workbook:${doc}`,
        state: "succeeded",
        startedAt: 1_000,
        endedAt: 2_500,
        output: "hi\n",
        result: [{ customer: "Acme", total: 12 }],
      };
    },
    onDidStartRun: (fn) => {
      onStart.add(fn);
      return { dispose: () => void onStart.delete(fn) };
    },
  };
  const service = createWorkbookService({
    pulsar,
    runManager: () => runManager,
    runText: text.runText,
    stateLabels: text.STATE_LABELS,
    formatDuration: text.formatDuration,
    parseHeader: perms.parseHeader,
    renderGrants: perms.renderGrants,
  });
  return { dir, doc, service, notices, runs, finish: gate.resolve };
}

/** The model the service draws for the workbook right now. */
async function drawn(service: ReturnType<typeof setup>["service"], doc: string) {
  const got: { model?: WorkbookModel } = {};
  const stop = service.watchWorkbook(doc, (m) => (got.model = m));
  await new Promise((r) => setTimeout(r, 0));
  stop();
  const m = got.model;
  assert(m, "the first draw arrives at once");
  if (m.error !== undefined) throw new Error(m.error);
  return m;
}

/** The step's state as the service draws it now. */
async function stepState(service: ReturnType<typeof setup>["service"], doc: string) {
  const run = (await drawn(service, doc)).blocks[0];
  assert(run.kind === "run");
  return run.state;
}

Deno.test("a workbook draws as Markdown with placeholders, and a model per block", async () => {
  const { service, doc } = setup();
  const model = await drawn(service, doc);
  assertEquals(model.title, "Try");
  assertEquals(model.blocks.map((b) => b.kind), ["run", "unverified"]);
  assertStringIncludes(model.markdown, `WB${model.nonce}N0`);
  assertEquals(model.tasks, [false]);
  const run = model.blocks[0];
  assert(run.kind === "run");
  assert(run.state.kind === "new", "it hasn't run yet");
  assertEquals(run.state.script.grants.summary, "no permissions");
});

Deno.test("Run writes a signed output under the step, and a changed script shows as changed", async () => {
  const { service, doc, dir, runs } = setup();
  await service.runStep(doc, "hello");
  assertEquals(runs, [`${dir}/scripts/hello.ts workbook:${doc}`]);
  const after = await drawn(service, doc);
  assertEquals(after.blocks.map((b) => b.kind), ["run", "output", "unverified"]);
  const output = after.blocks[1];
  assert(output.kind === "output");
  assertEquals([output.script, output.state, output.tone, output.duration], [
    "hello.ts",
    "ok",
    "success",
    "2s",
  ]);
  assertEquals(output.text, "hi");
  assertEquals(output.result, [{ customer: "Acme", total: 12 }]);
  assertEquals((await stepState(service, doc)).kind, "current");

  Deno.writeTextFileSync(`${dir}/scripts/hello.ts`, "// @permissions none\nconsole.log('changed');\n");
  assertEquals((await stepState(service, doc)).kind, "changed");

  // Edited by hand, the output no longer passes as Tranquil's.
  Deno.writeTextFileSync(doc, Deno.readTextFileSync(doc).replace("\nhi\n", "\nhello\n"));
  assertEquals((await drawn(service, doc)).blocks[1].kind, "unverified");
});

Deno.test("a message is signed and lands under its step; a tick changes the file", async () => {
  const { service, doc } = setup();
  assertEquals(service.sendMessage(doc, "why?", "hello"), true);
  assertEquals(service.sendMessage(doc, "   "), false, "nothing to send");
  service.toggleTask(doc, 0, false);
  const model = await drawn(service, doc);
  assertEquals(model.blocks.map((b) => b.kind), ["run", "message", "unverified"]);
  const message = model.blocks[1];
  assert(message.kind === "message");
  assertEquals([message.body, message.startOpen], ["why?", true]);
  assertEquals(model.tasks, [true]);
  assertStringIncludes(Deno.readTextFileSync(doc), "- [x] Done");
});

Deno.test("nothing is written while an editor holds unsaved changes to the workbook", async () => {
  const { service, doc, notices, runs } = setup({ modified: true });
  const before = Deno.readTextFileSync(doc);
  assertEquals(service.sendMessage(doc, "hello"), false);
  service.toggleTask(doc, 0, false);
  await service.runStep(doc, "hello");
  assertEquals(Deno.readTextFileSync(doc), before);
  assertEquals(runs, [], "no run starts either");
  assert(notices.every((n) => n.startsWith("warning: Save or discard")));
  assertEquals((await drawn(service, doc)).locked, true, "the run card offers no Run while locked");
});

Deno.test("a step mid-run shows its phase, and clicks on Run do nothing until it's back to idle", async () => {
  const { service, doc, runs, finish } = setup({ hold: true });
  const first = service.runStep(doc, "hello");
  await service.runStep(doc, "hello"); // the run manager is still starting the first
  await new Promise((r) => setTimeout(r, 0));
  const mid = await stepState(service, doc);
  assert(mid.kind === "running");
  assertEquals(mid.phase, "running");
  await service.runStep(doc, "hello"); // the script is running
  assertEquals(runs.length, 1, "one run, however many clicks");

  finish();
  await first;
  assertEquals((await stepState(service, doc)).kind, "current");
  await service.runStep(doc, "hello");
  assertEquals(runs.length, 2, "idle again, so Run runs");
});

for (
  const [name, options, text] of [
    ["refused", { refuse: true }, "Permissions not approved"],
    ["that can't be set up", { fail: "no free port" }, "no free port"],
  ] as const
) {
  Deno.test(`a run ${name} writes a "not started" output, and the step can run again`, async () => {
    const { service, doc, runs } = setup(options);
    await service.runStep(doc, "hello");
    const model = await drawn(service, doc);
    const output = model.blocks[1];
    assert(output.kind === "output", "signed, and it verifies (a refusal's text ends in a newline)");
    assertEquals([output.state, output.tone, output.text], ["not started", "warning", text]);
    assertEquals((await stepState(service, doc)).kind, "current");
    await service.runStep(doc, "hello");
    assertEquals(runs.length, 2);
  });
}
