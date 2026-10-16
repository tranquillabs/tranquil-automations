// The capability grants a script declares in its @permissions header (ADR-0022, ADR-0026): the one
// list of their names in the SDK, and what each implies. The SDK's checks and the lint plugin take
// grants from here, typed, so a misspelled grant fails `deno check` rather than denying forever.
// The runner's copy in lib/permissions.js (the renderer loads JavaScript, not TypeScript) is held
// to this one by test/lib/permissions_test.ts.

/** Every capability grant, as written in the header. */
export const CAPABILITIES = ["browser", "tabs", "forms", "page-js", "submit", "clipboard"] as const;
export type Capability = (typeof CAPABILITIES)[number];

/** What a grant also gives. `browser` keeps meaning everything. */
export const IMPLIES: Readonly<Partial<Record<Capability, readonly Capability[]>>> = {
  browser: ["tabs", "forms", "page-js", "submit"],
  submit: ["forms", "tabs"],
  forms: ["tabs"],
  "page-js": ["tabs"],
};

export function isCapability(name: string): name is Capability {
  return (CAPABILITIES as readonly string[]).includes(name);
}

/** The grants some header tokens give, implications included. Value tokens (sites=…) are skipped. */
export function grantsOf(tokens: Iterable<string>): ReadonlySet<Capability> {
  const held = new Set<Capability>();
  const add = (grant: Capability) => {
    if (held.has(grant)) return;
    held.add(grant);
    for (const implied of IMPLIES[grant] ?? []) add(implied);
  };
  for (const token of tokens) if (isCapability(token)) add(token);
  return held;
}

/**
 * The grants this run holds, from the runner (`TRANQUIL_GRANTS`, implications already applied).
 * Read from env rather than probed on the host stub: capnweb proxies property access, so an
 * ungranted capability is not observably undefined there. A name this SDK does not know means the
 * runner and the SDK disagree, which is a bug, so it throws instead of being ignored.
 */
export function heldGrants(): ReadonlySet<Capability> {
  let raw = "";
  try {
    raw = Deno.env.get("TRANQUIL_GRANTS") ?? "";
  } catch {
    return new Set(); // ungranted env access: no capability grants
  }
  const names = raw.split(",").filter(Boolean);
  const unknown = names.filter((name) => !isCapability(name));
  if (unknown.length) {
    throw new Error(`The runner granted ${unknown.join(", ")}, which this SDK does not know. Reload the window and run again.`);
  }
  return new Set(names as Capability[]);
}
