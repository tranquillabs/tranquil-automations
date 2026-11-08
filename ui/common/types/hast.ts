// The parts of a HAST syntax tree (the HTML tree remark-rehype builds from Markdown) that the
// shared layer's own tree steps read and write (../markdown/plugins.ts). Types only.

export interface HastText {
  type: "text";
  value: string;
}

export interface HastElement {
  type: "element";
  tagName: string;
  properties: Record<string, unknown>;
  children: HastNode[];
}

/** Any other node (the root, comments, raw), whose children, if any, are walked. */
export interface HastOther {
  type: "root" | "comment" | "raw" | "doctype";
  children?: HastNode[];
  value?: string;
}

export type HastNode = HastText | HastElement | HastOther;
