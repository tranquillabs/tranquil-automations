// What lib/triggers.js builds and reads: what started a run, as the runner records it. The SDK's
// public `Trigger` (deno/types/context.ts) is the source; the host adds only the debug run, which
// scripts see as manual. Types only.
import type { Trigger, TriggerReaders, ValuedTriggerKind } from "../deno/types/context.ts";

export type { Trigger, TriggerReaders, ValuedTriggerKind };

/** A run's trigger as the host sees it. */
export type RunTrigger = Trigger | { kind: "debug" };

/** Every kind of trigger. */
export type TriggerKind = RunTrigger["kind"];

/** A trigger as stored on a run's record and passed to the script as `TRANQUIL_TRIGGER`. */
export type TriggerString =
  | "manual"
  | "debug"
  | `command:${string}`
  | `url:${string}`
  | `workbook:${string}`;

/** What lib/triggers.js exports, for the TypeScript that loads it (the tests). */
export interface TriggersModule {
  MANUAL: TriggerString;
  DEBUG: TriggerString;
  commandTrigger(name: string): TriggerString;
  urlTrigger(url: string): TriggerString;
  workbookTrigger(path: string): TriggerString;
  parseTrigger(raw: string | undefined): RunTrigger;
  isAttended(raw: string | undefined): boolean;
}
