// The capability session with the host renderer: capnweb over the token-authenticated
// WebSocket bridge. One lazy singleton session per run; process death revokes everything.
import { RpcSession } from "npm:capnweb@0.9.0";
import { connectTransport } from "./transport.ts";
import { type Capability, heldGrants } from "./grants.ts";
import type { TabDescriptor } from "./tabs.ts";
import type { ActionEntry } from "./log.ts";

/**
 * The host capabilities a run can call: what tranquil-automations lib/runner-capabilities.js
 * serves to the runner audience, as the stub exposes it (every call returns a promise). Keep this
 * in step with that file; a capability the run was not granted is missing on the host side.
 */
export interface HostApi {
  tabs: {
    active(): Promise<TabDescriptor>;
    find(query: string | { regex: string; flags: string }): Promise<TabDescriptor>;
    all(): Promise<TabDescriptor[]>;
    open(
      url: string,
      options: { background?: boolean; location?: "center" | "right" | "bottom"; activate?: boolean; hideURLBar?: boolean },
    ): Promise<TabDescriptor>;
    close(tabId: string): Promise<void>;
    focus(tabId: string): Promise<boolean>;
    /** A fresh descriptor for a tab whose CDP target was replaced (reload, pane move). */
    restamp(tabId: string): Promise<TabDescriptor>;
    /** null flips; resolves the new state (true = hidden). */
    setURLBarHidden(tabId: string, hidden: boolean | null): Promise<boolean>;
    /** PNG, base64. */
    screenshot(tabId: string): Promise<string>;
  };
  ui: {
    open(path: string, options: { split?: "up" | "down" | "left" | "right" }): Promise<void>;
    notify(message: string, level: "info" | "success" | "warning" | "error"): Promise<void>;
    confirm(message: string, timeoutMs: number): Promise<boolean>;
  };
  run: {
    action(entry: ActionEntry): Promise<void>;
    result(value: unknown): Promise<void>;
  };
  clipboard: {
    read(): Promise<string>;
    write(text: string): Promise<void>;
  };
  workspace: {
    projectDir(): Promise<string>;
  };
  config: {
    get(key: string): Promise<unknown>;
    set(key: string, value: unknown): Promise<void>;
  };
}

let hostPromise: Promise<HostApi> | null = null;

/** The host capability stub (tabs, ui, clipboard, workspace, config — runner audience). */
export function host(): Promise<HostApi> {
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
      const session = new RpcSession(transport);
      // The stub forwards each call to the host, which serves HostApi (see above).
      return session.getRemoteMain() as unknown as HostApi;
    })();
  }
  return hostPromise;
}

/**
 * Refuse an SDK call the run's header did not grant (ADR-0026: tabs / forms / page-js, with
 * `browser` meaning all three). Checked before any work, so the error names the missing key.
 */
export function requireGrant(grant: Capability, what: string): void {
  if (heldGrants().has(grant)) return;
  throw new Error(
    `This automation needs "// @permissions ${grant}" (or "browser") to use ${what}. ` +
      "Add it to the leading comment block and run again.",
  );
}

/**
 * Invoke a host capability, cleaning the error on failure. Cap'n Web reconstructs a thrown host
 * error inside its read loop, so the raw rejection's stack points at Cap'n Web internals rather
 * than the script. Re-throwing a fresh Error here makes V8 capture the script's own async stack
 * (the `tabs.active()` / `ui.open()` call site) — the "real file:line" the runner promises.
 */
export async function hostCall<T>(
  fn: (host: HostApi) => Promise<T> | T,
  requires?: { capability: string; grant: Capability },
): Promise<T> {
  // The grant first: an ungranted call must name what is missing, not fail on the connection.
  if (requires && !heldGrants().has(requires.grant)) {
    throw new Error(
      `This automation needs "// @permissions ${requires.grant}" to use ` +
        `${requires.capability}. Add it to the leading comment block and run again.`,
    );
  }
  const h = await host();
  try {
    return await fn(h);
  } catch (e) {
    throw new Error(e instanceof Error ? e.message : String(e));
  }
}
