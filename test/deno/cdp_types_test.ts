// The typed CDP subset in deno/cdp.ts, checked at compile time: `deno test` type-checks this file,
// so every @ts-expect-error below must still be an error and every other line must compile.
import type { CdpConnection } from "tranquil-automations/deno/cdp.ts";

// Never called: only its types matter.
async function _types(conn: CdpConnection) {
  const nav: { frameId: string; errorText?: string } = await conn.send("Page.navigate", { url: "https://example.com/" });
  void nav;
  await conn.send("Runtime.enable"); // no params to give
  // @ts-expect-error a command the SDK has not declared cannot be sent
  await conn.send("Network.getAllCookies");
  // @ts-expect-error a command with required params needs them
  await conn.send("Page.navigate");
  // @ts-expect-error params are checked
  await conn.send("Input.insertText", { txt: "x" });
  const loaded: { timestamp: number } = await conn.waitForEvent("Page.loadEventFired");
  void loaded;
  // @ts-expect-error an undeclared event
  conn.on("Network.requestWillBeSent", () => {});
}

Deno.test("CdpConnection's protocol types are checked when this file type-checks", () => {
  void _types;
});
