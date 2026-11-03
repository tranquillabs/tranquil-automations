"use babel";

// Every read (and, from step 2, every write) a workbook makes goes through here, so each one gets
// the same checks. No `atom`: the caller passes the project root, which keeps this testable.

const fs = require("fs");
const path = require("path");

const READ_CAP = 64 * 1024;

// realpath of a path that may not exist yet: resolve its nearest existing ancestor, then re-add
// the missing part. A symlink anywhere above the file is followed, so it can't lead outside.
function realish(p) {
  let head = p;
  const tail = [];
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

function inside(root, p) {
  const rel = path.relative(root, p);
  return rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel));
}

/**
 * Resolve a path a workbook names (a run block's script, a file block, a relative link) against
 * the workbook's folder, and keep it inside `root` (the project that holds the workbook).
 * Returns { ok: true, abs } or { ok: false, reason }.
 */
function resolveInProject(root, docPath, rel, { ext } = {}) {
  const name = String(rel || "").trim();
  if (!name) return { ok: false, reason: "no path given" };
  if (path.isAbsolute(name) || name.startsWith("~")) {
    return { ok: false, reason: `"${name}" must be relative to the workbook` };
  }
  if (ext && !name.endsWith(ext)) return { ok: false, reason: `"${name}" must end in ${ext}` };
  const abs = path.resolve(path.dirname(docPath), name);
  const realRoot = realish(root);
  if (!inside(realRoot, realish(abs))) {
    return { ok: false, reason: `"${name}" is outside this project` };
  }
  return { ok: true, abs };
}

/**
 * Read a text file, cut at `cap` bytes. Returns { ok: true, text, truncated, mtimeMs } or
 * { ok: false, missing, reason }.
 */
function readCapped(abs, cap = READ_CAP) {
  let fd;
  try {
    const stat = fs.statSync(abs);
    if (!stat.isFile()) return { ok: false, missing: false, reason: "not a file" };
    fd = fs.openSync(abs, "r");
    const size = Math.min(stat.size, cap);
    const buf = Buffer.alloc(size);
    fs.readSync(fd, buf, 0, size, 0);
    return { ok: true, text: buf.toString("utf8"), truncated: stat.size > cap, mtimeMs: stat.mtimeMs };
  } catch (e) {
    if (e && e.code === "ENOENT") return { ok: false, missing: true, reason: "not written yet" };
    return { ok: false, missing: false, reason: String((e && e.message) || e) };
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
  }
}

module.exports = { resolveInProject, readCapped, READ_CAP };
