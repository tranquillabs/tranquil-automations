// A workbook step's run machine (ui/workbook/run-machine.ts): every move the table allows, every
// event each phase turns away, and the paths a run takes from a click back to idle.
import { assertEquals } from "jsr:@std/assert@^1";
import { can, next, RUN_TABLE } from "tranquil-automations/ui/workbook/run-machine.ts";
import type { RunEvent, RunPhase } from "tranquil-automations/ui/workbook/types/run-machine.ts";

// Every name, listed once; `satisfies` fails the check when the types gain a name these lack.
const PHASES = { idle: 0, starting: 0, running: 0, writing: 0 } satisfies Record<RunPhase, 0>;
const EVENTS = {
  run: 0,
  started: 0,
  refused: 0,
  threw: 0,
  ended: 0,
  written: 0,
  writeFailed: 0,
} satisfies Record<RunEvent, 0>;
const phases = Object.keys(PHASES) as RunPhase[];
const events = Object.keys(EVENTS) as RunEvent[];

const ALLOWED: [RunPhase, RunEvent, RunPhase][] = [
  ["idle", "run", "starting"],
  ["starting", "started", "running"],
  ["starting", "refused", "writing"],
  ["starting", "threw", "writing"],
  ["running", "ended", "writing"],
  ["running", "threw", "writing"],
  ["writing", "written", "idle"],
  ["writing", "writeFailed", "idle"],
];

/** The phases a run passes through on `events`, from idle. */
function walk(...path: RunEvent[]): RunPhase[] {
  const seen: RunPhase[] = ["idle"];
  for (const event of path) {
    const to = next(seen[seen.length - 1], event);
    if (to === null) throw new Error(`${seen[seen.length - 1]} doesn't allow ${event}`);
    seen.push(to);
  }
  return seen;
}

const moveText = ([from, event, to]: [RunPhase, RunEvent, RunPhase]) => `${from} ${event} ${to}`;

Deno.test("the table allows exactly these moves", () => {
  const listed = phases.flatMap((from) =>
    events.flatMap((event): [RunPhase, RunEvent, RunPhase][] => {
      const to = RUN_TABLE[from][event];
      return to ? [[from, event, to]] : [];
    })
  );
  assertEquals(listed.map(moveText).sort(), ALLOWED.map(moveText).sort());
  for (const [from, event, to] of ALLOWED) {
    assertEquals(next(from, event), to);
    assertEquals(can(from, event), true);
  }
});

Deno.test("every other event is turned away, in every phase", () => {
  const allowed = new Set(ALLOWED.map(([from, event]) => `${from} ${event}`));
  let refused = 0;
  for (const from of phases) {
    for (const event of events) {
      if (allowed.has(`${from} ${event}`)) continue;
      assertEquals(next(from, event), null, `${from} on ${event}`);
      assertEquals(can(from, event), false, `${from} on ${event}`);
      refused++;
    }
  }
  assertEquals(refused, phases.length * events.length - ALLOWED.length);
});

Deno.test("Run is allowed only when idle, so a second click while a step runs does nothing", () => {
  assertEquals(phases.filter((p) => can(p, "run")), ["idle"]);
});

Deno.test("a run that starts goes idle, starting, running, writing, idle", () => {
  assertEquals(walk("run", "started", "ended", "written"), [
    "idle",
    "starting",
    "running",
    "writing",
    "idle",
  ]);
  assertEquals(walk("run", "started", "threw", "writeFailed"), [
    "idle",
    "starting",
    "running",
    "writing",
    "idle",
  ]);
});

Deno.test("a refused run goes from starting straight to writing its output, then idle", () => {
  assertEquals(walk("run", "refused", "written"), ["idle", "starting", "writing", "idle"]);
  assertEquals(walk("run", "threw", "written"), ["idle", "starting", "writing", "idle"]);
});
