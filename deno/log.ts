// The per-run action log (ADR-0026): every page verb reports what it did (verb, target, site,
// outcome, time) to the host, which keeps it on the run record and shows it in the Runs panel.
// Never values: what was typed stays out of the log, sensitive or not. Best effort: a run is
// never failed by its own log.
import { hostCall } from "./rpc.ts";

export type ActionEntry = {
  verb: string;
  target?: string;
  site?: string;
  outcome: string; // "ok", "checked" (a parts check), or a FieldError code / "error"
  ms: number;
};

export async function logAction(entry: ActionEntry): Promise<void> {
  try {
    await hostCall((h) => h.run.action(entry));
  } catch {
    // An older host without the run capability, or no host at all (tests): nothing to log to.
  }
}
