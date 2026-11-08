// The names in a step's run (../run-machine.ts): its phases, the events that move it on, and the
// table's shape. Types only.

/**
 * Where a step's run is. `idle`: not running. `starting`: Run was clicked, and the run manager is
 * checking Deno, the header and consent. `running`: the script runs. `writing`: the run is over,
 * and its signed output is being written under the step.
 */
export type RunPhase = "idle" | "starting" | "running" | "writing";

/** A phase other than `idle`: the step is in a run. */
export type ActivePhase = Exclude<RunPhase, "idle">;

/**
 * What can happen to a step's run. `run`: the person clicked Run. `started`: the run manager gave
 * the run an id. `refused`: it didn't start it (no Deno, a bad header, declined consent). `threw`:
 * it couldn't set the run up, or lost it. `ended`: the run finished. `written` and `writeFailed`:
 * the output was written, or couldn't be.
 */
export type RunEvent = "run" | "started" | "refused" | "threw" | "ended" | "written" | "writeFailed";

/** For each phase, the events it allows and the phase each leads to. An event left out isn't allowed. */
export type RunTable = { readonly [P in RunPhase]: { readonly [E in RunEvent]?: RunPhase } };
