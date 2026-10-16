// The SDK works from web standards and names no framework, UI library or site (ADR-0026): a form
// built some other way is described by the script's own custom parts map. This keeps knowledge of
// one page's quirks from creeping back into the SDK's code, comments included.
import { assertEquals } from "jsr:@std/assert@^1";

const NAMES = [
  "react", "preact", "vue", "angular", "svelte", "ember", "jquery", "mui", "radix", "headlessui",
  "downshift", "emotion", "styled-components", "ashby", "greenhouse", "lever", "workday",
];
const NAMED = new RegExp(`(?<![\\w-])(${NAMES.join("|")})(?![\\w])`, "i");

async function* sources(dir: URL): AsyncGenerator<URL> {
  for await (const entry of Deno.readDir(dir)) {
    const url = new URL(entry.name + (entry.isDirectory ? "/" : ""), dir);
    if (entry.isDirectory) yield* sources(url);
    else if (/\.(ts|js)$/.test(entry.name)) yield url;
  }
}

Deno.test("SDK code names no framework, library or site", async () => {
  const sdk = new URL(import.meta.resolve("tranquil-automations/deno/"));
  const found: string[] = [];
  for await (const file of sources(sdk)) {
    const lines = (await Deno.readTextFile(file)).split("\n");
    lines.forEach((line, i) => {
      const m = NAMED.exec(line);
      if (m) found.push(`${file.pathname.slice(sdk.pathname.length)}:${i + 1} names "${m[1]}"`);
    });
  }
  assertEquals(found, [], "describe the structure instead, and leave page-specific knowledge to custom parts maps");
});
