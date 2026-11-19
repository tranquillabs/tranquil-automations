// The run's environment (ADR-0022 specific 2): the names the runner sets for every run, and the one
// place the SDK reads them. The runner's copy, ENV_NAMES in lib/permissions.js (the renderer loads
// JavaScript, not TypeScript), and the names the test task may read in deno.json are held to this
// list by test/deno/run_env_test.ts.
//
// A name that is missing means the script isn't running under the runner, or the runner and the
// SDK disagree, so reading it throws. It never falls back to a value: the fallbacks this replaced
// all widened what a script could do. An empty `sites=` meant any site, a missing parts check
// meant acting for real, and a missing port meant whatever answers on 9222.
//
// Read when a value is needed, never at module load, so the SDK still loads outside a run (its
// testing module, `deno check`, the tests). deno/main.ts reads every name before the script
// starts, so a run with one missing refuses to start rather than failing partway through.

/** Every name the runner sets, as lib/run-manager.js passes them to `deno run`. */
export const RUN_ENV_NAMES = [
  "TRANQUIL_RPC_URL",
  "TRANQUIL_RPC_TOKEN",
  "TRANQUIL_RUN_ID",
  "TRANQUIL_SCRIPT_DIR",
  "TRANQUIL_TRIGGER",
  "TRANQUIL_CDP_PORT",
  "TRANQUIL_ENTRY",
  "TRANQUIL_GRANTS",
  "TRANQUIL_SITES",
  "TRANQUIL_CHECK_PARTS",
] as const;
export type RunEnvName = (typeof RUN_ENV_NAMES)[number];

/**
 * A name's value as the runner set it, which may be "" (no sites, no grants, not a parts check).
 * Throws when it is unset or the run may not read it.
 */
export function runEnv(name: RunEnvName): string {
  let value: string | undefined;
  try {
    value = Deno.env.get(name);
  } catch {
    value = undefined; // not granted: the same as unset, since the runner grants every name
  }
  if (value === undefined) {
    throw new Error(
      `${name} is not set, so this script isn't running under Tranquil's runner. Run it from Tranquil.`,
    );
  }
  return value;
}
