// The workbook file format (lib/workbook-format.js, ADR-0030). The module requires nothing, so it
// is evaluated as CommonJS directly, the way permissions_test.ts loads permissions.js.
import { assert, assertEquals, assertStringIncludes } from "jsr:@std/assert@^1";
import type { BlockKind, WorkbookFormatModule } from "tranquil-automations/types/workbook-format.ts";

// Filled in by evaluating the module; its shape is WorkbookFormatModule.
const mod = { exports: {} as WorkbookFormatModule };
new Function(
  "module",
  "exports",
  Deno.readTextFileSync(new URL(import.meta.resolve("tranquil-automations/lib/workbook-format.js"))),
)(
  mod,
  mod.exports,
);
const { BLOCK_KINDS, parseDoc, renderSource, placeholder } = mod.exports;

const fence = "```";

Deno.test("BLOCK_KINDS lists exactly the kinds the BlockKind type names", () => {
  // Every kind once: the compiler rejects a missing or an extra one.
  const kinds: Record<BlockKind, true> = { run: true, file: true, output: true, message: true, reply: true };
  assertEquals([...BLOCK_KINDS].sort(), Object.keys(kinds).sort());
});

Deno.test("front matter: scalars, flow and block lists, and lists of one-level maps", () => {
  const doc = parseDoc(`---
template: true
name: "{{date}}-{{customer}}"
urls: [https://a.example/form, "https://b.example/x"]
tags:
  - one
  - two
inputs:
  - id: customer
    label: Customer name
    required: true
  - id: url
    default: focused-tab
---
# Hello
`);
  assertEquals(doc.frontMatter, {
    template: true,
    name: "{{date}}-{{customer}}",
    urls: ["https://a.example/form", "https://b.example/x"],
    tags: ["one", "two"],
    inputs: [
      { id: "customer", label: "Customer name", required: true },
      { id: "url", default: "focused-tab" },
    ],
  });
  assertEquals(doc.title, "Hello");
  assertEquals(doc.warnings, []);
});

Deno.test("a workbook without front matter, and front matter with no closing line", () => {
  assertEquals(parseDoc("# Just text\n").frontMatter, {});
  const doc = parseDoc("---\nurls: []\n# no close\n");
  assertEquals(doc.frontMatter, {});
  assert(doc.warnings.some((w) => w.includes("no closing")));
});

Deno.test("only column-0 fences of a known kind are workbook blocks", () => {
  const doc = parseDoc(`# Steps

${fence}run read-form
read-form.ts
${fence}

  ${fence}run indented
  nope.ts
  ${fence}

> ${fence}run quoted
> nope.ts
> ${fence}

${fence}ts
// an ordinary code block
${fence}

${fence}file
data/plan.json
${fence}
`);
  assertEquals(doc.blocks.map((b) => [b.kind, b.id]), [["run", "read-form"], ["file", undefined]]);
  assertEquals(doc.blocks[0].path, "read-form.ts");
  assertEquals(doc.blocks[0].stepOk, true);
  assertEquals(doc.blocks[1].path, "data/plan.json");
});

Deno.test("a fence inside an ordinary code block doesn't start a workbook block", () => {
  const doc = parseDoc(`${fence}${fence}markdown
${fence}run inner
inner.ts
${fence}
${fence}${fence}
`);
  assertEquals(doc.blocks, []);
});

Deno.test("block info strings carry the kind, the id and key=value attributes", () => {
  const doc = parseDoc(`${fence}output read-form sig=abc123
read-form.ts · ok
${fence}
${fence}message at=2026-11-02T10:00:00Z sig=def
hello
${fence}
${fence}reply at=2026-11-02T10:01:00Z
Done.
${fence}
`);
  assertEquals(doc.blocks.map((b) => [b.kind, b.id, b.attrs]), [
    ["output", "read-form", { sig: "abc123" }],
    ["message", undefined, { at: "2026-11-02T10:00:00Z", sig: "def" }],
    ["reply", undefined, { at: "2026-11-02T10:01:00Z" }],
  ]);
  assertEquals(doc.blocks[2].body, "Done.");
});

Deno.test("step ids are required, kebab-case and unique; a run holds exactly one path", () => {
  const doc = parseDoc(`${fence}run
a.ts
${fence}
${fence}run Read_Form
b.ts
${fence}
${fence}run fill
c.ts
${fence}
${fence}run fill
d.ts
${fence}
${fence}run two
e.ts
f.ts
${fence}
`);
  assertEquals(doc.blocks.map((b) => b.stepOk), [false, false, true, false, false]);
  assertEquals(doc.warnings.length, 4);
  assertStringIncludes(doc.warnings.join("\n"), "needs an id");
  assertStringIncludes(doc.warnings.join("\n"), "kebab-case");
  assertStringIncludes(doc.warnings.join("\n"), "already used");
  assertStringIncludes(doc.warnings.join("\n"), "exactly one path");
});

Deno.test("an unclosed workbook block runs to the end and is reported", () => {
  const text = `${fence}run read-form\nread-form.ts\n`;
  const doc = parseDoc(text);
  assertEquals(doc.blocks[0].end, text.length);
  assert(doc.warnings.some((w) => w.includes("no closing fence")));
});

Deno.test("task-list items are found outside code, with the offset of their check character", () => {
  const text = `- [ ] one\n- [x] two\n> - [ ] quoted\n1. [X] numbered\n${fence}\n- [ ] in code\n${fence}\n`;
  const doc = parseDoc(text);
  assertEquals(doc.tasks.map((t) => t.checked), [false, true, false, true]);
  for (const t of doc.tasks) assert(text[t.offset] === " " || text[t.offset].toLowerCase() === "x");
});

Deno.test("CRLF line endings parse the same", () => {
  const doc = parseDoc(`---\r\nurls: [https://a.example]\r\n---\r\n${fence}run go\r\ngo.ts\r\n${fence}\r\n`);
  assertEquals(doc.frontMatter, { urls: ["https://a.example"] });
  assertEquals(doc.blocks[0].path, "go.ts");
});

Deno.test("renderSource swaps blocks for placeholders and cuts other fences to one safe word", () => {
  const text = `---
urls: []
---
Intro

${fence}run go
go.ts
${fence}

${fence}"><style>body{display:none}</style>
code
${fence}
`;
  const doc = parseDoc(text);
  const out = renderSource(text, doc, "abc");
  assert(!out.includes("urls:"), "front matter is dropped");
  assert(!out.includes("go.ts"), "the block's body is gone");
  assertStringIncludes(out, `\n${placeholder("abc", 0)}\n`);
  assert(!out.includes("<style>"), "the fence's info string is cut");
  assertStringIncludes(out, `${fence}stylebodydisplaynonestyle\ncode`);
});
