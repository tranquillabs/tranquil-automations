// What the workbook's disk access returns (../disk.ts). Types only.

/** A path a workbook names, resolved and kept inside its project, or why it was refused. */
export type Resolved = { ok: true; abs: string } | { ok: false; reason: string };

/** A text file cut at a byte cap, or why it couldn't be read. */
export type CappedRead =
  | { ok: true; text: string; truncated: boolean; mtimeMs: number }
  | { ok: false; missing: boolean; reason: string };

/** How a write went: whether the file changed, or why it couldn't be written. */
export type Written = { ok: true; changed: boolean } | { ok: false; reason: string };
