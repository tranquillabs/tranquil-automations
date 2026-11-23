// Run context — the env contract with the run manager (ADR-0022 specific 2), parsed once.
// `signal` aborts on protocol-level cancel (the CANCEL frame from the host); long-running
// scripts can pass it to fetch/delay or check it between steps.
import { runEnv } from "./run-env.ts";
import type { Trigger, TriggerReaders, ValuedTriggerKind } from "./types/context.ts";

export type { Trigger };

/** How each kind reads the value after its colon. */
const READERS: TriggerReaders = {
  command: (name) => ({ kind: "command", name }),
  url: (url) => ({ kind: "url", url }),
  workbook: (path) => ({ kind: "workbook", path, folder: path.replace(/\.workbook\.md$/, "") }),
};

const isValued = (kind: string): kind is ValuedTriggerKind => Object.hasOwn(READERS, kind);

/** Reads `TRANQUIL_TRIGGER`'s string, `<kind>:<value>`; anything else is a manual run. */
export function parseTrigger(raw: string): Trigger {
  const [kind, ...rest] = raw.split(":");
  const value = rest.join(":"); // everything after the first colon, a URL's own colons included
  return isValued(kind) ? READERS[kind](value) : { kind: "manual" };
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
export function checkingParts(): boolean {
  return runEnv("TRANQUIL_CHECK_PARTS") === "1";
}

export const context = {
  // Read on use (deno/run-env.ts): outside a run, reading one throws instead of making a value up.
  get runId(): string {
    return runEnv("TRANQUIL_RUN_ID");
  },
  get scriptDir(): string {
    return runEnv("TRANQUIL_SCRIPT_DIR");
  },
  get trigger(): Trigger {
    return parseTrigger(runEnv("TRANQUIL_TRIGGER"));
  },
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
