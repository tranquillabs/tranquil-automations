// Script permission headers (ADR-0022 specific 2). Declared statically in leading comments:
//
//   // @permissions net=api.github.com run=git read=/tmp/data
//   // @timeout 15m
//
// Keys map to Deno flags: net → --allow-net append, run → --allow-run, read/write → paths,
// env → names, import → --allow-import hosts. Unknown keys refuse the run (fail closed).
const KNOWN_KEYS = ["net", "run", "read", "write", "env", "import"];
const DEFAULT_TIMEOUT_MS = 10 * 60 * 1000;

function emptyGrants() {
  const g = {};
  for (const k of KNOWN_KEYS) g[k] = [];
  return g;
}

// Parse @permissions / @timeout from the leading comment block of a script source.
// Throws on unknown permission keys or a malformed timeout.
function parseHeader(source) {
  const grants = emptyGrants();
  let timeoutMs = DEFAULT_TIMEOUT_MS;

  for (const rawLine of String(source).split("\n")) {
    const line = rawLine.trim();
    if (line === "") continue;
    if (!line.startsWith("//")) break; // header ends at the first non-comment line
    const comment = line.replace(/^\/\/\s?/, "");

    const perm = comment.match(/^@permissions\s+(.*)$/);
    if (perm) {
      for (const token of perm[1].trim().split(/\s+/)) {
        const eq = token.indexOf("=");
        const key = eq === -1 ? token : token.slice(0, eq);
        if (!KNOWN_KEYS.includes(key)) {
          throw new Error(`Unknown @permissions key "${key}" — allowed: ${KNOWN_KEYS.join(", ")}`);
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
  return KNOWN_KEYS.some((k) => grants[k].length > 0);
}

// Canonical string form of a grant set — what consent approvals store and compare.
function canonicalGrants(grants) {
  return KNOWN_KEYS.filter((k) => grants[k].length > 0)
    .map((k) => `${k}=${[...grants[k]].sort().join(",")}`)
    .join(" ");
}

// Human-readable lines for the consent prompt. run= is rendered honestly — most binaries a
// script would run (git, npm, shells) amount to full user privilege.
function renderGrants(grants) {
  const lines = [];
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
  DEFAULT_TIMEOUT_MS,
};
