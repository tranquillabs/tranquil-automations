"use babel";

// A finished run as text: what the Runs panel shows and copies, and what a workbook writes under
// the step that ran (ADR-0030). Pure, so both read the same and it is tested on its own.

const STATE_LABELS = {
  running: "running",
  paused: "paused", // a debug session stopped at a breakpoint (ADR-0025)
  succeeded: "ok",
  failed: "failed",
  cancelled: "cancelled",
  "timed-out": "timed out",
};

function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m${s % 60 ? ` ${s % 60}s` : ""}`;
}

// One action as the panel lists it: method, target, site, outcome and time, never values.
function actionLine(a) {
  return [a.verb, a.target, a.site ? `on ${a.site}` : "", a.outcome, `${a.ms} ms`].filter(Boolean).join("  ·  ");
}

// The output, the actions and the result, as text to paste.
function runText(run) {
  const parts = [];
  if (run.output) parts.push(run.output.replace(/\n+$/, ""));
  const actions = run.actions || [];
  if (actions.length) parts.push([`Actions (${actions.length}):`, ...actions.map(actionLine)].join("\n"));
  if (run.result !== undefined) parts.push(`Result:\n${JSON.stringify(run.result, null, 2)}`);
  return parts.join("\n\n");
}

module.exports = { STATE_LABELS, formatDuration, actionLine, runText };
