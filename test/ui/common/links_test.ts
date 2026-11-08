// What clicking a link in rendered Markdown may do (ui/common/links.ts).
import { assertEquals } from "jsr:@std/assert@^1";
import { classifyLink } from "tranquil-automations/ui/common/links.ts";

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
