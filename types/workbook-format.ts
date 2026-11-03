// What lib/workbook-format.js exports (ADR-0030). The module is plain JavaScript, so its shapes are
// declared here, once, for every TypeScript that loads it. Types only.

/** The fenced blocks a workbook gives meaning to, named by the first word of the info string. */
export type BlockKind = "run" | "file" | "output" | "message" | "reply";

/** A front-matter value: a scalar, a flow list (`[a, b]`), or a block list of scalars or one-level maps. */
export type FrontMatterScalar = string | boolean | string[];
export type FrontMatterValue = FrontMatterScalar | (FrontMatterScalar | Record<string, FrontMatterScalar>)[];
export type FrontMatter = Record<string, FrontMatterValue>;

/** One of the workbook's own fenced blocks. */
export interface Block {
  kind: BlockKind;
  /** The second word of the info string: a step id on `run` and `output`. */
  id: string | undefined;
  /** `key=value` words in the info string, such as `sig` and `at`. */
  attrs: Record<string, string>;
  /** The text between the fences, with CRLF turned into LF. */
  body: string;
  /** Character offsets spanning the whole block, fences included. */
  start: number;
  end: number;
  /** The 1-based line of the opening fence. */
  line: number;
  /** The opening fence's marker, such as ```` ``` ```` or `~~~~`. */
  fence: string;
  /** `run` and `file` only: the one path the body holds, or null when it holds none or several. */
  path?: string | null;
  /** `run` only: the id is present, kebab-case and unused before, and the body is one path. */
  stepOk?: boolean;
}

/** Any other fenced code block. The renderer cuts its info string to one safe word. */
export interface Fence {
  marker: string;
  info: string;
  /** The 0-based line of the opening fence. */
  line: number;
  /** The 0-based line of the closing fence, or null when the block runs to the end of the file. */
  closeLine: number | null;
}

/** A GFM task-list item outside code. */
export interface Task {
  /** Its position among the workbook's tasks. */
  index: number;
  /** Its 1-based line. */
  line: number;
  checked: boolean;
  /** The character offset of the box's mark: the space or the `x`. */
  offset: number;
}

export interface Doc {
  /** Empty when the file has none. */
  frontMatter: FrontMatter;
  /** The offset where the Markdown after the front matter starts. */
  bodyStart: number;
  blocks: Block[];
  fences: Fence[];
  tasks: Task[];
  /** The first `# ` heading outside code. */
  title: string | null;
  warnings: string[];
}

export interface WorkbookFormatModule {
  BLOCK_KINDS: readonly BlockKind[];
  STEP_ID: RegExp;
  parseDoc(text: string): Doc;
  /** The lines between the opening and closing `---`. */
  parseFrontMatter(lines: string[]): { data: FrontMatter; warnings: string[] };
  renderSource(text: string, doc: Doc, nonce: string): string;
  placeholder(nonce: string, n: number): string;
}
