// The shared Markdown component's own tree steps (ui/common/markdown/plugins.ts): task boxes are
// numbered in order, and only a paragraph holding nothing but this render's placeholder becomes
// an insert.
import { assertEquals } from "jsr:@std/assert@^1";
import { insertsAt, numberTasks } from "tranquil-automations/ui/common/markdown/plugins.ts";
import type { HastElement, HastNode } from "tranquil-automations/ui/common/types/hast.ts";

const el = (
  tagName: string,
  properties: Record<string, unknown> = {},
  children: HastNode[] = [],
): HastElement => ({
  type: "element",
  tagName,
  properties,
  children,
});
const text = (value: string): HastNode => ({ type: "text", value });

Deno.test("task boxes are numbered in document order, nested lists included", () => {
  const box = () => el("input", { type: "checkbox", checked: false, disabled: true });
  const tree: HastNode = {
    type: "root",
    children: [
      el("ul", {}, [
        el("li", {}, [box(), text("one"), el("ul", {}, [el("li", {}, [box(), text("two")])])]),
        el("li", {}, [box()]),
      ]),
    ],
  };
  numberTasks()(tree);
  const found: unknown[] = [];
  const walk = (n: HastNode) => {
    if (n.type === "element" && n.tagName === "input") found.push(n.properties.taskIndex);
    if ("children" in n && n.children) n.children.forEach(walk);
  };
  walk(tree);
  assertEquals(found, [0, 1, 2]);
});

Deno.test("a placeholder paragraph with this render's nonce becomes an insert, and nothing else does", () => {
  const tree: HastNode = {
    type: "root",
    children: [
      el("p", {}, [text("WBabcN3")]),
      el("p", {}, [text("WBzzzN4")]), // another render's nonce
      el("p", {}, [text("see WBabcN5")]), // not the whole paragraph
      el("p", {}, [el("em", {}, [text("WBabcN6")])]), // not plain text
      el("blockquote", {}, [el("p", {}, [text(" WBabcN7 ")])]),
    ],
  };
  insertsAt("abc")(tree);
  const tags = (tree.type === "root" ? tree.children ?? [] : []).map((
    n,
  ) => (n.type === "element" ? n.tagName : n.type));
  assertEquals(tags, ["tq-insert", "p", "p", "p", "blockquote"]);
  const first = tree.type === "root" ? tree.children?.[0] : undefined;
  assertEquals(first?.type === "element" ? first.properties.index : undefined, 3);
  const quoted = tree.type === "root" ? tree.children?.[4] : undefined;
  assertEquals(
    quoted?.type === "element" ? quoted.children.map((c) => (c.type === "element" ? c.tagName : "")) : [],
    ["tq-insert"],
  );
});
