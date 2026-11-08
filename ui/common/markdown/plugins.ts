// Two steps on the HTML tree built from Markdown, run after the sanitizer (Markdown.svelte). Plain
// functions over the tree, with no packages of their own, so they're tested directly.
import type { HastElement, HastNode } from "../types/hast.ts";

type Transformer = (tree: HastNode) => void;

function walk(node: HastNode, visit: (node: HastNode) => void): void {
  visit(node);
  if ("children" in node && node.children) { for (const child of node.children) walk(child, visit); }
}

/**
 * Numbers the task-list checkboxes in document order (`taskIndex`), so each one can say which
 * task it is when it's clicked.
 */
export function numberTasks(): Transformer {
  return (tree) => {
    let n = 0;
    walk(tree, (node) => {
      if (node.type === "element" && node.tagName === "input" && node.properties.type === "checkbox") {
        node.properties.taskIndex = n++;
      }
    });
  };
}

/**
 * Replaces each paragraph whose only text is a placeholder `WB<nonce>N<index>` with a
 * `tq-insert` element carrying that index, which the renderer draws with the caller's component.
 * The nonce is new on every render, so text in the document can't pose as a placeholder.
 */
export function insertsAt(nonce: string): Transformer {
  const placeholder = new RegExp(`^WB${nonce}N(\\d+)$`);
  return (tree) => {
    walk(tree, (node) => {
      if (!("children" in node) || !node.children) return;
      node.children = node.children.map((child) => {
        if (child.type !== "element" || child.tagName !== "p" || child.children.length !== 1) return child;
        const [only] = child.children;
        const m = only.type === "text" ? placeholder.exec(only.value.trim()) : null;
        if (!m) return child;
        const insert: HastElement = {
          type: "element",
          tagName: "tq-insert",
          properties: { index: Number(m[1]) },
          children: [],
        };
        return insert;
      });
    });
  };
}
