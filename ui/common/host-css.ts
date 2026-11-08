// Points a built stylesheet at a shadow root: rules on :root, html or body (Tailwind's theme
// variables, Skeleton's base styles) move to :host, since a shadow root has no document root.
// Everything else is left as it is.
// Usage: deno run --allow-read=<file> --allow-write=<file> host-css.ts <file.css>
const [file] = Deno.args;
if (!file) throw new Error("usage: host-css.ts <file.css>");

/** A rule's prelude and block, or a statement (no block) ending in ";". */
interface Node {
  prelude: string;
  body: string | null;
}

const COMMENTS = /\/\*[\s\S]*?\*\//g;
const GROUP = /^@(layer|media|supports|container)\b/;
const DOCUMENT_ROOT = /^(:root|html|body)(?![\w-])/;

/** Where a run of text ends: at `stop` outside strings and comments, or the end of the text. */
function scan(text: string, from: number, stop: (c: string, depth: number) => boolean): number {
  let quote = "";
  let depth = 0;
  for (let i = from; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      if (c === "\\") i++;
      else if (c === quote) quote = "";
      continue;
    }
    if (c === '"' || c === "'") quote = c;
    else if (c === "/" && text[i + 1] === "*") {
      const end = text.indexOf("*/", i + 2);
      if (end < 0) return text.length;
      i = end + 1;
    } else if (stop(c, depth)) return i;
    else if (c === "{") depth++;
    else if (c === "}") depth--;
  }
  return text.length;
}

/** The rules and statements in a list of rules. */
function split(text: string): Node[] {
  const out: Node[] = [];
  let i = 0;
  while (i < text.length) {
    const j = scan(text, i, (c) => c === "{" || c === ";");
    const prelude = text.slice(i, j).replace(COMMENTS, "").trim();
    if (j >= text.length || text[j] === ";") {
      if (prelude) out.push({ prelude, body: null });
      i = j + 1;
      continue;
    }
    const k = scan(text, j + 1, (c, depth) => c === "}" && depth === 0);
    out.push({ prelude, body: text.slice(j + 1, k) });
    i = k + 1;
  }
  return out;
}

/** A selector list split at its top-level commas. */
function selectors(prelude: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < prelude.length; i++) {
    const c = prelude[i];
    if (c === "(" || c === "[") depth++;
    else if (c === ")" || c === "]") depth--;
    else if (c === "," && depth === 0) {
      out.push(prelude.slice(start, i).trim());
      start = i + 1;
    }
  }
  out.push(prelude.slice(start).trim());
  return out;
}

function toHost(nodes: Node[]): string {
  return nodes.map(({ prelude, body }) => {
    if (body === null) return `${prelude};`;
    if (GROUP.test(prelude)) return `${prelude} {\n${toHost(split(body))}\n}`;
    if (prelude.startsWith("@")) return `${prelude} {${body}}`;
    const list = [...new Set(selectors(prelude).map((s) => s.replace(DOCUMENT_ROOT, ":host")))];
    return `${list.join(", ")} {${body}}`;
  }).join("\n");
}

Deno.writeTextFileSync(file, toHost(split(Deno.readTextFileSync(file))) + "\n");
