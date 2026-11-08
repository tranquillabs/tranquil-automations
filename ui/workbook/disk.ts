// Every read and write a workbook makes goes through here, so each one gets the same checks. No
// Pulsar: the caller passes the project root, which keeps this testable.
import { Buffer } from "node:buffer";
import fs from "node:fs";
import path from "node:path";
import type { CappedRead, Resolved, Written } from "./types/disk.ts";

export const READ_CAP = 64 * 1024;

const messageOf = (e: unknown) => (e instanceof Error ? e.message : String(e));
const codeOf = (
  e: unknown,
) => (typeof e === "object" && e !== null && "code" in e ? String(e.code) : undefined);

// realpath of a path that may not exist yet: resolve its nearest existing ancestor, then re-add
// the missing part. A symlink anywhere above the file is followed, so it can't lead outside.
function realish(p: string): string {
  let head = p;
  const tail: string[] = [];
  for (;;) {
    try {
      return path.join(fs.realpathSync(head), ...tail);
    } catch {
      const parent = path.dirname(head);
      if (parent === head) return p;
      tail.unshift(path.basename(head));
      head = parent;
    }
  }
}

function inside(root: string, p: string): boolean {
  const rel = path.relative(root, p);
  return rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel));
}

/**
 * Resolves a path a workbook names (a run block's script, a file block, a relative link) against
 * the workbook's folder, and keeps it inside `root` (the project that holds the workbook). `ext`,
 * when given, is the extension it must have.
 */
export function resolveInProject(
  root: string,
  docPath: string,
  rel: string | null | undefined,
  opts: { ext?: string } = {},
): Resolved {
  const name = String(rel || "").trim();
  if (!name) return { ok: false, reason: "no path given" };
  if (path.isAbsolute(name) || name.startsWith("~")) {
    return { ok: false, reason: `"${name}" must be relative to the workbook` };
  }
  if (opts.ext && !name.endsWith(opts.ext)) return { ok: false, reason: `"${name}" must end in ${opts.ext}` };
  const abs = path.resolve(path.dirname(docPath), name);
  if (!inside(realish(root), realish(abs))) {
    return { ok: false, reason: `"${name}" is outside this project` };
  }
  return { ok: true, abs };
}

/** Reads a text file, cut at `cap` bytes. */
export function readCapped(abs: string, cap = READ_CAP): CappedRead {
  let fd: number | undefined;
  try {
    const stat = fs.statSync(abs);
    if (!stat.isFile()) return { ok: false, missing: false, reason: "not a file" };
    fd = fs.openSync(abs, "r");
    const size = Math.min(stat.size, cap);
    const buf = Buffer.alloc(size);
    fs.readSync(fd, buf, 0, size, 0);
    return { ok: true, text: buf.toString("utf8"), truncated: stat.size > cap, mtimeMs: stat.mtimeMs };
  } catch (e) {
    if (codeOf(e) === "ENOENT") return { ok: false, missing: true, reason: "not written yet" };
    return { ok: false, missing: false, reason: messageOf(e) };
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
  }
}

/**
 * Applies `edit` to a workbook safely. `edit` takes the file's text and returns the new text, or
 * null to leave it alone. The new text goes to a temporary file beside the workbook, which is
 * renamed over it only if nothing else wrote the workbook in between; otherwise it reads again and
 * retries, up to three times. A symlinked workbook is written through to the file it points to,
 * and the file keeps its permissions.
 */
export function writeDoc(filePath: string, edit: (text: string) => string | null): Written {
  // The file a symlinked workbook points to, so the rename replaces the file, not the link. Only
  // the workbook's own links are followed; a renamed file lands in the same folder either way.
  let real = filePath;
  try {
    for (let hops = 0; hops < 8 && fs.lstatSync(real).isSymbolicLink(); hops++) {
      real = path.resolve(path.dirname(real), fs.readlinkSync(real));
    }
  } catch (e) {
    return { ok: false, reason: messageOf(e) };
  }
  for (let attempt = 0; attempt < 3; attempt++) {
    let before: string;
    try {
      before = fs.readFileSync(real, "utf8");
    } catch (e) {
      return { ok: false, reason: messageOf(e) };
    }
    const next = edit(before);
    if (next === null || next === before) return { ok: true, changed: false };
    const tmp = path.join(path.dirname(real), `.${path.basename(real)}.${process.pid}.${Date.now()}.tmp`);
    try {
      fs.writeFileSync(tmp, next, { mode: fs.statSync(real).mode & 0o777, flag: "wx" });
      if (fs.readFileSync(real, "utf8") !== before) {
        fs.rmSync(tmp, { force: true });
        continue;
      }
      fs.renameSync(tmp, real);
      return { ok: true, changed: true };
    } catch (e) {
      fs.rmSync(tmp, { force: true });
      return { ok: false, reason: messageOf(e) };
    }
  }
  return { ok: false, reason: "the workbook kept changing while Tranquil was writing to it; try again" };
}
