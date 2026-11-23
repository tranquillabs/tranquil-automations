// What deno/context.ts describes about the run. Types only.

/** A run the person started from a script's editor or the palette (or a debug run). */
export type ManualTrigger = { kind: "manual" };

/** A registered automation's palette command. */
export type CommandTrigger = { kind: "command"; name: string };

/** A page that loaded and matched the script's URL trigger. */
export type UrlTrigger = { kind: "url"; url: string };

/** A workbook step: `path` is the workbook, `folder` its data folder (x.workbook.md → x). */
export type WorkbookTrigger = { kind: "workbook"; path: string; folder: string };

/**
 * What started the run. The runner encodes it as `TRANQUIL_TRIGGER` (lib/triggers.js builds the
 * strings, and test/lib/triggers_test.ts holds that module's parser to deno/context.ts's). A debug
 * run reads as manual: scripts don't change for one.
 */
export type Trigger = ManualTrigger | CommandTrigger | UrlTrigger | WorkbookTrigger;

/** How each kind with a value after its colon (`command:<name>`) reads that value. */
export interface TriggerReaders {
  command(name: string): CommandTrigger;
  url(url: string): UrlTrigger;
  workbook(path: string): WorkbookTrigger;
}

/** The kinds that have a reader. */
export type ValuedTriggerKind = keyof TriggerReaders;
