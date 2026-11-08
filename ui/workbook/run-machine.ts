// A workbook step's run as a state machine: the table below is the whole of it. It holds no state.
// The service keeps each step's phase and asks the table where an event leads, and the run card
// asks it whether Run is allowed. An event a phase doesn't list isn't allowed then, so a second
// click on Run while a step runs is turned away by the table, not by a flag.
//
//   idle ──run──▶ starting ──started──▶ running ──ended──▶ writing ──written, writeFailed──▶ idle
//                    │                     │                  ▲
//                    └─ refused, threw ────┴──── threw ───────┘
import type { RunEvent, RunPhase, RunTable } from "./types/run-machine.ts";

export const RUN_TABLE: RunTable = {
  idle: { run: "starting" },
  starting: { started: "running", refused: "writing", threw: "writing" },
  running: { ended: "writing", threw: "writing" },
  writing: { written: "idle", writeFailed: "idle" },
};

/** The phase `event` leads to from `phase`, or null when `phase` doesn't allow it. */
export function next(phase: RunPhase, event: RunEvent): RunPhase | null {
  return RUN_TABLE[phase][event] ?? null;
}

/** Whether `phase` allows `event`. */
export function can(phase: RunPhase, event: RunEvent): boolean {
  return next(phase, event) !== null;
}
