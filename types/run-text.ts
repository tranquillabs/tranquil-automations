// What lib/run-text.js exports. The module is plain JavaScript, so its shapes are declared here,
// once, for every TypeScript that loads it, and for its own JSDoc. Types only.
import type { RunState } from "./run-manager.ts";

/** One page action a run recorded, without values (ADR-0026). */
export interface ActionEntry {
  verb: string;
  target?: string;
  site?: string;
  outcome: string;
  ms: number;
}

/** The parts of a run record (lib/run-manager.js) that its text is made from. */
export interface RunForText {
  output?: string;
  actions?: ActionEntry[];
  result?: unknown;
}

export interface RunTextModule {
  /** What the Runs panel and a workbook's output call each state: one entry per state. */
  STATE_LABELS: Readonly<Record<RunState, string>>;
  formatDuration(ms: number): string;
  actionLine(action: ActionEntry): string;
  runText(run: RunForText): string;
}
