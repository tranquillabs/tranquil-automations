"use babel";

// Script permission headers (ADR-0022 specific 2, extended by ADR-0025). Declared statically in
// leading comments:
//
//   // @permissions browser net=api.github.com run=git read=/tmp/data
//   // @permissions none
//   // @timeout 15m
//
// Two kinds of key:
//
//   FLAG keys take values and map to Deno flags: net → --allow-net, run → --allow-run,
//   read/write → paths, env → names, import → --allow-import hosts.
//
//   CAPABILITY keys are bare words and gate host capabilities the sandbox cannot express as a
//   Deno flag: `browser` (drive tabs — navigate anywhere and run JS in pages, inside the user's
//   logged-in sessions) and `clipboard` (read and write the system clipboard).
//
// The capability keys exist because the Deno-flag axis was never the dangerous one. A script with
// no header could not open a socket, but it *could* drive an authenticated browser and read the
// clipboard, because both arrive over loopback and RPC rather than through the permission flags.
// Those are now declared, gated and consented like everything else.
//
// A header is REQUIRED. A script with no @permissions line is refused rather than run with a
// silent baseline — "declares nothing" and "needs nothing" should not look the same, and the only
// way to be sure an author considered the question is to make them answer it. `none` is the
// explicit way to say "only my own folder".
const FLAG_KEYS = ["net", "run", "read", "write", "env", "import"];
const CAPABILITY_KEYS = ["browser", "clipboard"];
const KNOWN_KEYS = [...FLAG_KEYS, ...CAPABILITY_KEYS];
const DEFAULT_TIMEOUT_MS = 10 * 60 * 1000;

class MissingHeaderError extends Error {}

function emptyGrants() {
  const g = {};
  for (const k of FLAG_KEYS) g[k] = [];
  for (const k of CAPABILITY_KEYS) g[k] = false;
  return g;
}

// Parse @permissions / @timeout from the leading comment block of a script source.
// Throws on a missing header, unknown keys, or a malformed timeout.
function parseHeader(source) {
  const grants = emptyGrants();
  let timeoutMs = DEFAULT_TIMEOUT_MS;
  let declared = false;

  for (const rawLine of String(source).split("\n")) {
    const line = rawLine.trim();
    if (line === "") continue;
    if (!line.startsWith("//")) break; // header ends at the first non-comment line
    const comment = line.replace(/^\/\/\s?/, "");

    const perm = comment.match(/^@permissions\s+(.*)$/);
    if (perm) {
      declared = true;
      for (const token of perm[1].trim().split(/\s+/)) {
        if (token === "none") continue; // explicit "nothing beyond my own folder"

        const eq = token.indexOf("=");
        const key = eq === -1 ? token : token.slice(0, eq);
        if (!KNOWN_KEYS.includes(key)) {
          throw new Error(`Unknown @permissions key "${key}" — allowed: ${KNOWN_KEYS.join(", ")}`);
        }

        if (CAPABILITY_KEYS.includes(key)) {
          if (eq !== -1) throw new Error(`@permissions ${key} takes no value — write just "${key}"`);
          grants[key] = true;
          continue;
        }

        if (eq === -1 || token.slice(eq + 1) === "") {
          throw new Error(`@permissions ${key} needs a value, e.g. ${key}=…`);
        }
        for (const value of token.slice(eq + 1).split(",")) {
          if (value && !grants[key].includes(value)) grants[key].push(value);
        }
      }
      continue;
    }

    const timeout = comment.match(/^@timeout\s+(\S+)$/);
    if (timeout) {
      timeoutMs = parseTimeout(timeout[1]);
    }
  }

  if (!declared) {
    throw new MissingHeaderError(
      'Add a "// @permissions" line to the leading comment block. Use "// @permissions none" for a ' +
        "script that only touches its own folder, or list what it needs, e.g. " +
        '"// @permissions browser net=api.github.com".'
    );
  }

  return { grants, timeoutMs };
}

// "90s" | "15m" | "2h" | "none" → milliseconds (null for none).
function parseTimeout(spec) {
  if (spec === "none") return null;
  const m = spec.match(/^(\d+)(s|m|h)$/);
  if (!m) throw new Error(`Bad @timeout "${spec}" — use e.g. 90s, 15m, 2h, or none`);
  const n = Number(m[1]);
  return n * { s: 1000, m: 60_000, h: 3_600_000 }[m[2]];
}

function hasGrants(grants) {
  return (
    FLAG_KEYS.some((k) => grants[k].length > 0) || CAPABILITY_KEYS.some((k) => grants[k] === true)
  );
}

// Canonical string form of a grant set — what consent approvals store and compare. Capabilities
// are included, so adding `browser` to a script re-prompts rather than riding an old approval.
function canonicalGrants(grants) {
  const parts = FLAG_KEYS.filter((k) => grants[k].length > 0).map(
    (k) => `${k}=${[...grants[k]].sort().join(",")}`
  );
  for (const k of CAPABILITY_KEYS) if (grants[k]) parts.push(k);
  return parts.sort().join(" ");
}

// Human-readable lines for the consent prompt. run= is rendered honestly — most binaries a
// script would run (git, npm, shells) amount to full user privilege — and so is `browser`, which
// acts inside whatever sessions the user is already signed in to.
function renderGrants(grants) {
  const lines = [];
  if (grants.browser) {
    lines.push("Control the browser: open any page and run code in it, as you (signed-in sessions)");
  }
  if (grants.clipboard) lines.push("Read and write the system clipboard");
  if (grants.net.length) lines.push(`Network access to: ${grants.net.join(", ")}`);
  if (grants.run.length) {
    lines.push(`Run commands as you (full user privilege): ${grants.run.join(", ")}`);
  }
  if (grants.read.length) lines.push(`Read files at: ${grants.read.join(", ")}`);
  if (grants.write.length) lines.push(`Write files at: ${grants.write.join(", ")}`);
  if (grants.env.length) lines.push(`Read environment variables: ${grants.env.join(", ")}`);
  if (grants.import.length) lines.push(`Import modules from: ${grants.import.join(", ")}`);
  return lines;
}

module.exports = {
  parseHeader,
  hasGrants,
  canonicalGrants,
  renderGrants,
  MissingHeaderError,
  FLAG_KEYS,
  CAPABILITY_KEYS,
  DEFAULT_TIMEOUT_MS,
};
