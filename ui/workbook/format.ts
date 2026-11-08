// The workbook file format (ADR-0030): a Markdown file whose front matter names the web pages it
// works on, and whose fenced blocks of a few known kinds are steps, outputs, data views and the
// conversation. Pure: no disk, no DOM, no Pulsar, so it's tested directly and shared with
// tranquil-llm's guide test. It also makes the edits Tranquil writes into a workbook.
import type {
  Block,
  BlockAttrs,
  BlockKind,
  Doc,
  Fence,
  FrontMatter,
  FrontMatterScalar,
  Task,
} from "./types/format.ts";

export const BLOCK_KINDS: readonly BlockKind[] = ["run", "file", "output", "message", "reply"];
export const STEP_ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;
// A fence opens only at column 0. Indented and quoted fences are ordinary code (or text), so
// nothing inside a message or an output can ever become a live block.
const FENCE = /^(`{3,}|~{3,})(.*)$/;
const TASK = /^(\s*(?:>\s*)*(?:[-*+]|\d+[.)])\s+)\[( |x|X)\]\s/;

const isBlockKind = (word: string): word is BlockKind => (BLOCK_KINDS as readonly string[]).includes(word);

// --- Front matter: plain `key: value` lines, lists, and lists of one-level maps. -------------

function unquote(s: string): string {
  const t = s.trim();
  if (t.length >= 2 && ((t[0] === '"' && t.endsWith('"')) || (t[0] === "'" && t.endsWith("'")))) {
    return t.slice(1, -1);
  }
  return t;
}

function scalar(s: string): FrontMatterScalar {
  const t = s.trim();
  if (t === "true") return true;
  if (t === "false") return false;
  if (t.startsWith("[") && t.endsWith("]")) {
    const inner = t.slice(1, -1).trim();
    return inner === "" ? [] : inner.split(",").map(unquote);
  }
  return unquote(t);
}

/** The lines between the opening and closing `---`. */
export function parseFrontMatter(lines: string[]): { data: FrontMatter; warnings: string[] } {
  const data: FrontMatter = {};
  const warnings: string[] = [];
  let list: (FrontMatterScalar | Record<string, FrontMatterScalar>)[] | null = null; // the block list being filled
  let item: Record<string, FrontMatterScalar> | null = null; // the current map item in a list of maps
  for (const raw of lines) {
    if (raw.trim() === "" || raw.trim().startsWith("#")) continue;
    const top = raw.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (top) {
      list = null;
      item = null;
      if (top[2] === "") {
        list = [];
        data[top[1]] = list;
      } else {
        data[top[1]] = scalar(top[2]);
      }
      continue;
    }
    const entry = raw.match(/^\s+-\s+(.*)$/);
    if (entry && list) {
      const pair = entry[1].match(/^([A-Za-z][\w-]*):\s*(.*)$/);
      if (pair) {
        item = { [pair[1]]: scalar(pair[2]) };
        list.push(item);
      } else {
        item = null;
        list.push(scalar(entry[1]));
      }
      continue;
    }
    const more = raw.match(/^\s{2,}([A-Za-z][\w-]*):\s*(.*)$/);
    if (more && item) {
      item[more[1]] = scalar(more[2]);
      continue;
    }
    warnings.push(`front matter: can't read "${raw.trim()}"`);
  }
  return { data, warnings };
}

// --- Blocks ------------------------------------------------------------------------------------

// `output read-form sig=abc` → { kind: "output", id: "read-form", attrs: { sig: "abc" } }.
function parseInfo(info: string): { kind: string; id: string | undefined; attrs: Record<string, string> } {
  const words = info.trim().split(/\s+/).filter(Boolean);
  const kind = words[0] || "";
  const attrs: Record<string, string> = {};
  const rest: string[] = [];
  for (const w of words.slice(1)) {
    const eq = w.indexOf("=");
    if (eq > 0) attrs[w.slice(0, eq)] = w.slice(eq + 1);
    else rest.push(w);
  }
  return { kind, id: rest[0], attrs };
}

/** Parses a workbook's text: its front matter, its own blocks, other fences, tasks and title. */
export function parseDoc(text: string): Doc {
  const src = String(text);
  const warnings: string[] = [];
  const lines = src.split("\n");
  // Offsets of each line's start, so blocks can carry character offsets.
  const starts: number[] = [];
  let at = 0;
  for (const l of lines) {
    starts.push(at);
    at += l.length + 1;
  }
  const lineText = (i: number) => lines[i].replace(/\r$/, "");

  let frontMatter: FrontMatter = {};
  let first = 0;
  if (lines.length > 1 && lineText(0) === "---") {
    const close = lines.findIndex((l, i) => i > 0 && l.replace(/\r$/, "") === "---");
    if (close > 0) {
      const fm = parseFrontMatter(lines.slice(1, close).map((l) => l.replace(/\r$/, "")));
      frontMatter = fm.data;
      warnings.push(...fm.warnings);
      first = close + 1;
    } else {
      warnings.push("front matter: no closing ---");
    }
  }

  const blocks: Block[] = [];
  const fences: Fence[] = [];
  const tasks: Task[] = [];
  let title: string | null = null;
  for (let i = first; i < lines.length; i++) {
    const open = lineText(i).match(FENCE);
    if (!open) {
      const t = lineText(i).match(TASK);
      if (t) {
        tasks.push({
          index: tasks.length,
          line: i + 1,
          checked: t[2] !== " ",
          offset: starts[i] + t[1].length + 1,
        });
      }
      if (title === null) {
        const h = lineText(i).match(/^#\s+(.+?)\s*#*\s*$/);
        if (h) title = h[1];
      }
      continue;
    }
    const marker = open[1];
    const close = new RegExp(`^${marker[0] === "`" ? "`" : "~"}{${marker.length},}\\s*$`);
    let j = i + 1;
    while (j < lines.length && !close.test(lineText(j))) j++;
    const closed = j < lines.length;
    const body = lines.slice(i + 1, j).map((l) => l.replace(/\r$/, "")).join("\n");
    const end = closed ? starts[j] + lineText(j).length : src.length; // before a CRLF's \r
    const info = parseInfo(open[2]);
    if (isBlockKind(info.kind)) {
      if (!closed) warnings.push(`line ${i + 1}: the ${info.kind} block has no closing fence`);
      blocks.push({
        kind: info.kind,
        id: info.id,
        attrs: info.attrs,
        body,
        start: starts[i],
        end,
        line: i + 1,
        fence: marker,
      });
    } else {
      fences.push({ marker, info: open[2], line: i, closeLine: closed ? j : null });
    }
    i = closed ? j : lines.length;
  }

  checkBlocks(blocks, warnings);
  return {
    frontMatter,
    bodyStart: first < lines.length ? starts[first] : src.length,
    blocks,
    fences,
    tasks,
    title,
    warnings,
  };
}

// Step ids are required and unique; run and file bodies are one path.
function checkBlocks(blocks: Block[], warnings: string[]): void {
  const seen = new Map<string, number>();
  for (const b of blocks) {
    if (b.kind === "run") {
      if (!b.id) {
        warnings.push(
          `line ${b.line}: this run block has no step id. Write one after "run", as in "run read-form".`,
        );
      } else if (!STEP_ID.test(b.id)) warnings.push(`line ${b.line}: step id "${b.id}" must be kebab-case`);
      else if (seen.has(b.id)) {
        warnings.push(`line ${b.line}: step id "${b.id}" is already used on line ${seen.get(b.id)}`);
      } else seen.set(b.id, b.line);
    }
    if (b.kind === "run" || b.kind === "file") {
      const paths = b.body.split("\n").map((l) => l.trim()).filter(Boolean);
      b.path = paths.length === 1 ? paths[0] : null;
      if (paths.length !== 1) warnings.push(`line ${b.line}: a ${b.kind} block holds exactly one path`);
    }
  }
  for (const b of blocks) {
    if (b.kind === "run") {
      b.stepOk = Boolean(b.id && STEP_ID.test(b.id) && seen.get(b.id) === b.line && b.path);
    }
  }
}

// --- Text for the renderer ---------------------------------------------------------------------

export function placeholder(nonce: string, n: number): string {
  return `WB${nonce}N${n}`;
}

/**
 * The Markdown the view renders: the body without front matter, each workbook block replaced by
 * a paragraph holding a placeholder (`WB<nonce>N<index>`), and every other fence's info string cut
 * to one plain word. The nonce is new on every render, so text in the workbook can't pose as a
 * placeholder.
 */
export function renderSource(text: string, doc: Doc, nonce: string): string {
  const src = String(text);
  const lines = src.split("\n");
  for (const f of doc.fences) {
    const word = (f.info.trim().split(/\s+/)[0] || "").replace(/[^\w+#.-]/g, "");
    lines[f.line] = f.marker + word;
  }
  // Rebuild from the edited lines, then cut the blocks out by line range (fence lines are never
  // inside a workbook block, so the edits above don't move block lines).
  const out: string[] = [];
  let skipUntil = -1;
  const byLine = new Map(doc.blocks.map((b, n) => [b.line - 1, { b, n }]));
  const firstLine = src.slice(0, doc.bodyStart).split("\n").length - 1;
  for (let i = firstLine; i < lines.length; i++) {
    if (i <= skipUntil) continue;
    const hit = byLine.get(i);
    if (hit) {
      out.push("", placeholder(nonce, hit.n), "");
      skipUntil = i + src.slice(hit.b.start, hit.b.end).split("\n").length - 1;
      continue;
    }
    out.push(lines[i]);
  }
  return out.join("\n");
}

// --- Edits Tranquil makes -----------------------------------------------------------------------
//
// Each takes the file's text and returns the new text; the caller writes it (disk.ts writeDoc).
// Inserted text uses the file's own line endings.

const OUTPUT_CAP = 16000;
const OUTPUT_HEAD = 4000;
const OUTPUT_TAIL = 12000;

const eol = (text: string) => (text.includes("\r\n") ? "\r\n" : "\n");
const withEol = (block: string, nl: string) => (nl === "\n" ? block : block.replace(/\n/g, nl));

/** Text with CRLF and CR as LF, and control characters other than tab and newline dropped. */
function cleanText(text: string): string {
  // deno-lint-ignore no-control-regex -- dropping control characters is the point
  return String(text).replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000b-\u001f\u007f-\u009f]/g, "");
}

/** An output cut to the cap: its first 4,000 and last 12,000 characters, with the cut marked. */
export function capOutput(text: string): string {
  const t = cleanText(text);
  if (t.length <= OUTPUT_CAP) return t;
  return `${t.slice(0, OUTPUT_HEAD)}\n… (${t.length - OUTPUT_HEAD - OUTPUT_TAIL} characters cut) …\n${
    t.slice(-OUTPUT_TAIL)
  }`;
}

/**
 * A body as a block holds it, and as it reads back: without trailing newlines, which a fence
 * can't keep. Sign this, not the raw text, or the block won't verify.
 */
export const blockBody = (body: string): string => body.replace(/\n+$/, "");

/**
 * A workbook block as text. The fence is longer than any run of backticks in the body, so nothing
 * inside can close it. Attribute values must not contain whitespace.
 */
export function blockText(kind: BlockKind, id: string | undefined, attrs: BlockAttrs, body: string): string {
  const longest = Math.max(2, ...(body.match(/`+/g) || []).map((run) => run.length));
  const fence = "`".repeat(longest + 1);
  const words = Object.entries(attrs).filter(([, v]) => v !== undefined && v !== "").map(([k, v]) =>
    `${k}=${v}`
  );
  return `${fence}${[kind, id, ...words].filter(Boolean).join(" ")}\n${blockBody(body)}\n${fence}`;
}

const after = (text: string, at: number, block: string) => {
  const nl = eol(text);
  return text.slice(0, at) + nl + nl + withEol(block, nl) + text.slice(at);
};

/**
 * The step's output replaced by `block`: in place when it has one, otherwise just below the step.
 * Returns null when the workbook has no step with that id.
 */
export function setOutput(text: string, id: string, block: string): string | null {
  const doc = parseDoc(text);
  const existing = doc.blocks.find((b) => b.kind === "output" && b.id === id);
  if (existing) return text.slice(0, existing.start) + withEol(block, eol(text)) + text.slice(existing.end);
  const run = doc.blocks.find((b) => b.kind === "run" && b.id === id);
  return run ? after(text, run.end, block) : null;
}

/**
 * Task `index` ticked or unticked. Returns null when it is no longer as the person saw it
 * (`wasChecked`), because the file changed in between.
 */
export function toggleTask(text: string, index: number, wasChecked: boolean): string | null {
  const task = parseDoc(text).tasks[index];
  if (!task || task.checked !== wasChecked) return null;
  return text.slice(0, task.offset) + (wasChecked ? " " : "x") + text.slice(task.offset + 1);
}

/**
 * A message added at the end, or, with `stepId`, under that step: after its output (or the step
 * itself when it hasn't run) and after the messages and replies already there, so a thread stays
 * in order beside its step.
 */
export function insertMessage(text: string, block: string, stepId?: string): string {
  const doc = parseDoc(text);
  const at = stepId
    ? [
      doc.blocks.findIndex((b) => b.kind === "output" && b.id === stepId),
      doc.blocks.findIndex((b) => b.kind === "run" && b.id === stepId),
    ]
      .find((i) => i >= 0)
    : undefined;
  if (at === undefined) {
    const nl = eol(text);
    return `${text.replace(/\s+$/, "")}${nl}${nl}${withEol(block, nl)}${nl}`;
  }
  let last = doc.blocks[at];
  for (const next of doc.blocks.slice(at + 1)) {
    if (
      (next.kind !== "message" && next.kind !== "reply") || text.slice(last.end, next.start).trim() !== ""
    ) break;
    last = next;
  }
  return after(text, last.end, block);
}
