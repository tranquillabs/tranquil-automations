// Text a notification shows exactly as written (lib/notify.js): Pulsar's notifications render their
// message as Markdown with HTML on. The module needs require (for settings.js), so it is loaded
// through createRequire; it touches `atom` only when a notification is shown.
import { assertEquals } from "jsr:@std/assert@^1";
import { createRequire } from "node:module";
import type { NotifyModule } from "tranquil-automations/types/notify.ts";

const require = createRequire(import.meta.url);
const { escapeMarkdown }: NotifyModule = require(
  new URL(import.meta.resolve("tranquil-automations/lib/notify.js")).pathname,
);

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
