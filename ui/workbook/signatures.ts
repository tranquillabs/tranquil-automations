// Signatures on the blocks only Tranquil writes into a workbook (ADR-0030): a run's output and the
// person's messages. A block draws as Tranquil's (Code output, You) only when its signature checks
// out, so text an LLM or a web page wrote can't pass as either.
//
// HMAC-SHA256 with a key in ~/.tranquil/workbook-signing.key (mode 0600), over the block's kind,
// its id, every attribute but `sig`, and its body. Advisory: anything running as the same user can
// read the key. No Pulsar: the caller passes the key's path, which keeps this testable.
import { Buffer } from "node:buffer";
import crypto from "node:crypto";
import fs from "node:fs";
import type { Block } from "./types/format.ts";

const codeOf = (
  e: unknown,
) => (typeof e === "object" && e !== null && "code" in e ? String(e.code) : undefined);

/** The signing key, made on first use: 32 random bytes, readable by this user only. */
export function loadKey(keyPath: string): Uint8Array {
  try {
    return Buffer.from(fs.readFileSync(keyPath, "utf8").trim(), "hex");
  } catch (e) {
    if (codeOf(e) !== "ENOENT") throw e;
  }
  const key = crypto.randomBytes(32);
  try {
    fs.writeFileSync(keyPath, key.toString("hex"), { mode: 0o600, flag: "wx" });
  } catch (e) {
    if (codeOf(e) === "EEXIST") return loadKey(keyPath); // made at the same moment by another window
    throw e;
  }
  return key;
}

/** What a signature covers, in one string: the same block always gives the same text. */
function canonical(
  kind: string,
  id: string | undefined,
  attrs: Record<string, string>,
  body: string,
): string {
  const fields = Object.keys(attrs).filter((k) => k !== "sig").sort().map((k) => [k, attrs[k]]);
  return JSON.stringify([kind, id || "", fields, String(body).replace(/\r\n?/g, "\n")]);
}

/** The signature for a block, as hex. */
export function sign(
  key: Uint8Array,
  kind: string,
  id: string | undefined,
  attrs: Record<string, string>,
  body: string,
): string {
  return crypto.createHmac("sha256", key).update(canonical(kind, id, attrs, body)).digest("hex");
}

/** Whether a parsed block's `sig` attribute is Tranquil's signature for it. */
export function verify(key: Uint8Array, block: Pick<Block, "kind" | "id" | "attrs" | "body">): boolean {
  const given = block.attrs.sig;
  if (typeof given !== "string" || !/^[0-9a-f]{64}$/.test(given)) return false;
  const expected = sign(key, block.kind, block.id, block.attrs, block.body);
  return crypto.timingSafeEqual(Buffer.from(given, "hex"), Buffer.from(expected, "hex"));
}
