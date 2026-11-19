// What lib/run-manager.js records about a run, as far as other modules share it. The module is
// plain JavaScript, checked through JSDoc that points here (jsconfig.json); the workbook's
// TypeScript (ui/workbook) imports the same names. Types only.

/**
 * Where a run is. `running` and `paused` (a debug session stopped at a breakpoint, ADR-0025) are
 * in flight; the rest are final. The Runs panel labels each one (STATE_LABELS in lib/run-text.js).
 */
export type RunState = "running" | "paused" | "succeeded" | "failed" | "cancelled" | "timed-out";
