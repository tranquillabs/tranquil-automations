// Signatures on outputs and messages (lib/workbook-signatures.js, ADR-0030): a signed block checks
// out, and any change to it, or a signature moved to another block, doesn't. The module needs
// Node's crypto and fs, so it is loaded through createRequire.
import { assert, assertEquals } from "jsr:@std/assert@^1";
import { createRequire } from "node:module";
import type { WorkbookSignaturesModule } from "tranquil-automations/types/workbook-signatures.ts";

const require = createRequire(import.meta.url);
const sigs: WorkbookSignaturesModule = require(
  new URL(import.meta.resolve("tranquil-automations/lib/workbook-signatures.js")).pathname,
);

function freshKey() {
  const dir = Deno.makeTempDirSync({ prefix: "workbook-sigs-" });
  return { path: `${dir}/workbook-signing.key`, dir };
}

Deno.test("the key is made once, readable by this user only, and read back the same", () => {
  const { path } = freshKey();
  const key = sigs.loadKey(path);
  assertEquals(key.length, 32);
  assertEquals(Deno.statSync(path).mode! & 0o777, 0o600);
  assertEquals(sigs.loadKey(path), key);
});

Deno.test("a signed block checks out, and any change to it doesn't", () => {
  const key = sigs.loadKey(freshKey().path);
  const attrs = { state: "ok", hash: "abc123", script: "read.ts" };
  const block = { kind: "output" as const, id: "read", attrs, body: "Read 6 fields" };
  const sig = sigs.sign(key, block.kind, block.id, attrs, block.body);
  const signed = { ...block, attrs: { ...attrs, sig } };
  assert(sigs.verify(key, signed));

  assert(!sigs.verify(key, { ...signed, body: "Read 7 fields" }), "body");
  assert(!sigs.verify(key, { ...signed, id: "fill" }), "a signature moved to another step");
  assert(!sigs.verify(key, { ...signed, kind: "message" as const }), "kind");
  assert(!sigs.verify(key, { ...signed, attrs: { ...signed.attrs, hash: "def456" } }), "the script's hash");
  assert(!sigs.verify(key, { ...signed, attrs: { ...signed.attrs, state: "failed" } }), "the state");
  assert(!sigs.verify(key, { ...block, attrs: { ...attrs, sig: "forged" } }), "a made-up signature");
  assert(!sigs.verify(key, block), "no signature");
});

Deno.test("CRLF in the body signs the same as LF, and another key doesn't verify", () => {
  const key = sigs.loadKey(freshKey().path);
  const sig = sigs.sign(key, "message", undefined, { at: "t" }, "line 1\nline 2");
  assert(sigs.verify(key, { kind: "message" as const, id: undefined, attrs: { at: "t", sig }, body: "line 1\r\nline 2" }));
  const other = sigs.loadKey(freshKey().path);
  assert(!sigs.verify(other, { kind: "message" as const, id: undefined, attrs: { at: "t", sig }, body: "line 1\nline 2" }));
});
