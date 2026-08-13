// The capability session with the host renderer: capnweb over the token-authenticated
// WebSocket bridge. One lazy singleton session per run; process death revokes everything.
import { RpcSession } from "capnweb";
import { connectTransport } from "./transport.ts";

// deno-lint-ignore no-explicit-any
type HostStub = any;

let hostPromise: Promise<HostStub> | null = null;

/** The host capability stub (tabs, ui, clipboard, workspace, config — runner audience). */
export function host(): Promise<HostStub> {
  if (!hostPromise) {
    hostPromise = (async () => {
      const url = Deno.env.get("TRANQUIL_RPC_URL");
      const token = Deno.env.get("TRANQUIL_RPC_TOKEN");
      if (!url || !token) {
        throw new Error(
          "Not running under the Tranquil runner (TRANQUIL_RPC_URL/TOKEN missing) — " +
            "run this script from Tranquil with cmd-shift-R.",
        );
      }
      const transport = await connectTransport(url, token);
      // deno-lint-ignore no-explicit-any
      const session = new RpcSession(transport as any);
      return session.getRemoteMain() as HostStub;
    })();
  }
  return hostPromise;
}

/**
 * Invoke a host capability, cleaning the error on failure. Cap'n Web reconstructs a thrown host
 * error inside its read loop, so the raw rejection's stack points at Cap'n Web internals rather
 * than the script. Re-throwing a fresh Error here makes V8 capture the script's own async stack
 * (the `tabs.active()` / `ui.open()` call site) — the "real file:line" the runner promises.
 */
export async function hostCall<T>(fn: (host: HostStub) => Promise<T> | T): Promise<T> {
  const h = await host();
  try {
    return await fn(h);
  } catch (e) {
    throw new Error(e instanceof Error ? e.message : String(e));
  }
}
