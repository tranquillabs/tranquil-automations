// Safe Markdown (lib/safe-markdown.js, ADR-0030): harden() leaves nothing live in a fragment, and
// classifyLink() decides what a click may do. The renderer itself needs Pulsar, so these tests
// feed harden() the kind of HTML Pulsar's renderer can produce, hostile parts included.
import { assert, assertEquals } from "jsr:@std/assert@^1";
import { DOMParser } from "https://raw.githubusercontent.com/tranquillabs/deno-dom/v0.1.56-tq.1/deno-dom-wasm.ts";
import type { SafeMarkdownModule } from "tranquil-automations/types/safe-markdown.ts";

// Filled in by evaluating the module; its shape is SafeMarkdownModule.
const mod = { exports: {} as SafeMarkdownModule };
new Function(
  "module",
  "exports",
  Deno.readTextFileSync(new URL(import.meta.resolve("tranquil-automations/lib/safe-markdown.js"))),
)(
  mod,
  mod.exports,
);
const { harden, classifyLink, escapeMarkdown } = mod.exports;

function hardened(html: string) {
  const doc = new DOMParser().parseFromString(`<body><div id="root">${html}</div></body>`, "text/html");
  const root = doc.getElementById("root");
  assert(root);
  harden(root);
  return root;
}

Deno.test("scripts, styles, frames, forms and SVG are removed with their content", () => {
  const root = hardened(
    `<p>keep</p><script>alert(1)</script><style>body{display:none}</style><iframe src="https://x"></iframe>` +
      `<form action="https://x"><button>go</button></form><svg onload="x()"><circle/></svg>`,
  );
  assertEquals(root.innerHTML, "<p>keep</p>");
});

Deno.test("an image becomes its alt text, so nothing is fetched", () => {
  const root = hardened(`<p>see <img src="https://tracker.example/p.png" alt="the chart"></p>`);
  assertEquals(root.innerHTML, "<p>see the chart</p>");
});

Deno.test("unknown elements are replaced by their text", () => {
  const root = hardened(
    `<p><span class="x">a</span><button onclick="x()">b</button><font color="red">c</font></p>`,
  );
  assertEquals(root.innerHTML, "<p>abc</p>");
});

Deno.test("attributes are stripped except a link's href, a safe code class and table alignment", () => {
  const root = hardened(
    `<p><a href="https://a.example" onclick="x()" target="_blank" style="color:red">a</a></p>` +
      `<pre><code class="language-ts" onmouseover="x()">x</code></pre>` +
      `<pre><code class="language-&quot;&gt;x">y</code></pre>` +
      `<table><tr><td style="text-align: right">1</td><td style="background:url(https://x)">2</td></tr></table>`,
  );
  const a = root.querySelector("a");
  assertEquals(a?.getAttribute("href"), "https://a.example");
  assertEquals(a?.attributes.length, 1);
  const codes = root.querySelectorAll("code");
  assertEquals(codes[0].getAttribute("class"), "language-ts");
  assertEquals(codes[0].attributes.length, 1);
  assertEquals(codes[1].attributes.length, 0);
  const cells = root.querySelectorAll("td");
  assertEquals(cells[0].getAttribute("style"), "text-align: right");
  assertEquals(cells[1].attributes.length, 0);
});

Deno.test("only a task checkbox survives as an input, and it is disabled", () => {
  const root = hardened(
    `<ul><li class="task-list-item"><input type="checkbox" checked id="cbx_0"><label for="cbx_0">done</label></li></ul>` +
      `<p><input type="text" value="x"><input type="hidden" name="t"></p>`,
  );
  const inputs = root.querySelectorAll("input");
  assertEquals(inputs.length, 1);
  assertEquals(inputs[0].getAttribute("type"), "checkbox");
  assert(inputs[0].hasAttribute("disabled"));
  assert(inputs[0].hasAttribute("checked"));
  assertEquals(inputs[0].getAttribute("id"), null);
  assertEquals(root.querySelector("label")?.attributes.length, 0);
});

Deno.test("comments are removed", () => {
  assertEquals(hardened(`<p>a<!-- hidden --></p>`).innerHTML, "<p>a</p>");
});

Deno.test("classifyLink: web links open, relative paths are checked, everything else is inert", () => {
  assertEquals(classifyLink("https://a.example/x"), { kind: "web", url: "https://a.example/x" });
  assertEquals(classifyLink("http://localhost:3000"), { kind: "web", url: "http://localhost:3000" });
  assertEquals(classifyLink("../apply/plan.json"), { kind: "relative", path: "../apply/plan.json" });
  assertEquals(classifyLink("notes%20today.md#top"), { kind: "relative", path: "notes today.md" });
  for (
    const href of [
      "javascript:alert(1)",
      "JaVaScRiPt:x",
      "file:///etc/passwd",
      "data:text/html,x",
      "mailto:a@b",
      "#top",
      "//evil.example/x",
      "",
      null,
    ]
  ) {
    assertEquals(classifyLink(href).kind, "inert", String(href));
  }
});

Deno.test("escapeMarkdown escapes every ASCII punctuation character, and only those", () => {
  assertEquals(escapeMarkdown("Read 13 fields"), "Read 13 fields");
  assertEquals(
    escapeMarkdown("![x](https://t.example/p.png)"),
    "\\!\\[x\\]\\(https\\:\\/\\/t\\.example\\/p\\.png\\)",
  );
  assertEquals(escapeMarkdown("<img src=x>"), "\\<img src\\=x\\>");
  assertEquals(escapeMarkdown("a_b *c* `d` ~e~ #f"), "a\\_b \\*c\\* \\`d\\` \\~e\\~ \\#f");
  assertEquals(escapeMarkdown("café — ok"), "café — ok");
});
