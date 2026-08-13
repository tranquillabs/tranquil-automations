// Run context — the env contract with the run manager (ADR-0022 specific 2), parsed once.
// `signal` aborts on protocol-level cancel (the CANCEL frame from the host); long-running
// scripts can pass it to fetch/delay or check it between steps.

export type Trigger =
  | { kind: "manual" }
  | { kind: "command"; name: string }
  | { kind: "url"; url: string };

function parseTrigger(raw: string | undefined): Trigger {
  if (raw?.startsWith("command:")) return { kind: "command", name: raw.slice(8) };
  if (raw?.startsWith("url:")) return { kind: "url", url: raw.slice(4) };
  return { kind: "manual" };
}

const cancelController = new AbortController();

/** Internal — the transport aborts this on CANCEL. Not part of the script API. */
export function triggerCancel(): void {
  cancelController.abort(new Error("run cancelled"));
}

export const context = {
  runId: Deno.env.get("TRANQUIL_RUN_ID") ?? "",
  scriptDir: Deno.env.get("TRANQUIL_SCRIPT_DIR") ?? Deno.cwd(),
  trigger: parseTrigger(Deno.env.get("TRANQUIL_TRIGGER")),
  signal: cancelController.signal,
} as const;
