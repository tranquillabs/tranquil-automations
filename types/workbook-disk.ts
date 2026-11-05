// What lib/workbook-disk.js exports (ADR-0030). The module is plain JavaScript, so its shapes are
// declared here, once, for every TypeScript that loads it. Types only.

/** A path a workbook names, resolved and kept inside its project, or why it was refused. */
export type Resolved = { ok: true; abs: string } | { ok: false; reason: string };

/** A text file cut at a byte cap, or why it couldn't be read. */
export type CappedRead =
  | { ok: true; text: string; truncated: boolean; mtimeMs: number }
  | { ok: false; missing: boolean; reason: string };

/** How a write went: whether the file changed, or why it couldn't be written. */
export type Written = { ok: true; changed: boolean } | { ok: false; reason: string };

export interface WorkbookDiskModule {
  /** Applies `edit` (old text to new text, or null to leave it) through a temporary file and a rename. */
  writeDoc(filePath: string, edit: (text: string) => string | null): Written;
  /** The default cap for readCapped, in bytes. */
  READ_CAP: number;
  /** `rel` is relative to the workbook's folder; `ext`, when given, is the extension it must have. */
  resolveInProject(root: string, docPath: string, rel: string, opts?: { ext?: string }): Resolved;
  readCapped(abs: string, cap?: number): CappedRead;
}
