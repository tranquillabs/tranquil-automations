// What lib/workbook-signatures.js exports. The module is plain JavaScript, so its shapes are
// declared here, once, for every TypeScript that loads it. Types only.
import type { Block } from "./workbook-format.ts";

export interface WorkbookSignaturesModule {
  /** The signing key at `keyPath`, made (mode 0600) on first use. */
  loadKey(keyPath: string): Uint8Array;
  /** The hex signature over a block's kind, id, attributes (not `sig`) and body. */
  sign(key: Uint8Array, kind: string, id: string | undefined, attrs: Record<string, string>, body: string): string;
  /** Whether the block's `sig` attribute is Tranquil's signature for it. */
  verify(key: Uint8Array, block: Pick<Block, "kind" | "id" | "attrs" | "body">): boolean;
}
