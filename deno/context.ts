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

/** An env var, or "" when it is unset or the runner did not grant reading it (an older app). */
function env(name: string): string {
  try {
    return Deno.env.get(name) ?? "";
  } catch {
    return "";
  }
}

const cancelController = new AbortController();

/** Internal — the transport aborts this on CANCEL. Not part of the script API. */
export function triggerCancel(): void {
  cancelController.abort(new Error("run cancelled"));
}

/**
 * Internal to the SDK, not part of `context`: whether this run is a parts check (SDK:
 * Check Custom Parts), where the page write verbs check their targets and the parts they need,
 * and log what they would do instead of doing it. Scripts don't branch on it; nothing else about
 * the run changes.
 */
export const checkingParts = env("TRANQUIL_CHECK_PARTS") === "1";

export const context = {
  runId: Deno.env.get("TRANQUIL_RUN_ID") ?? "",
  scriptDir: Deno.env.get("TRANQUIL_SCRIPT_DIR") ?? Deno.cwd(),
  trigger: parseTrigger(Deno.env.get("TRANQUIL_TRIGGER")),
  signal: cancelController.signal,
  /**
   * Hand back what the run found (a confirmation number, a list of results) as plain JSON. It
   * appears in the Runs panel, with the run's action log. At most 64 KB; the last call
   * wins.
   *
   *     await context.result({ confirmation: await tab.text({ text: /^Ref/ }) });
   */
  async result(value: unknown): Promise<void> {
    const json = JSON.stringify(value);
    if (json === undefined) throw new TypeError("context.result() needs a JSON value");
    if (json.length > 64 * 1024) throw new TypeError(`context.result() takes at most 64 KB of JSON (got ${json.length} characters)`);
    const { hostCall } = await import("./rpc.ts"); // late: rpc.ts imports the transport, which imports this module
    await hostCall((h) => h.run.result(JSON.parse(json)));
  },
} as const;
