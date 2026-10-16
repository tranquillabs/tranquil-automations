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
//   read/write paths are resolved against the script's directory when relative, so a script names
//   what it touches: `write=output.md`, `write=results`. There is NO implicit grant for the
//   script's own folder — it used to be added silently, which meant a script declaring `none`
//   could still write next to itself, a permission nobody agreed to and the header never
//   mentioned. A bare "." is rejected (see SELF_DIR): path grants are recursive, so it would
//   restore that same blanket, only written down.
//
//   CAPABILITY keys are bare words and gate host capabilities the sandbox cannot express as a
//   Deno flag. The browser is split three ways (ADR-0026), all inside the user's signed-in
//   sessions:
//     `tabs`     open, navigate and close tabs; read URLs, titles and form fields
//     `forms`    type, select, click and upload into pages (implies `tabs`)
//     `page-js`  run the script's own JavaScript in pages (implies `tabs`)
//     `browser`  all three, plus `submit`, unchanged from before the split
//   plus `submit` (send forms: a submit button, Enter in a field; implies `forms`) and
//   `clipboard` (read and write the system clipboard).
//
//   One more value key, `sites=`, lists the sites a script may act on (exact hosts, or
//   `*.example.com`, which also covers example.com). Unlike the browser split, `sites` and
//   `submit` are enforced by the SDK itself before each action (ADR-0026).
//
//   The split is advisory until CDP goes through a host-side filtered proxy: a script granted
//   any browser key can reach the CDP port. It makes intent explicit and lets the SDK and the
//   consent prompt hold scripts to it.
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
const CAPABILITY_KEYS = ["browser", "tabs", "forms", "page-js", "submit", "clipboard"];
// What each browser key also grants. `browser` keeps meaning everything. These two lists mirror
// deno/grants.ts, the SDK's typed copy; test/lib/permissions_test.ts fails if they differ.
const IMPLIES = {
  browser: ["tabs", "forms", "page-js", "submit"],
  submit: ["forms", "tabs"],
  forms: ["tabs"],
  "page-js": ["tabs"],
};
// Value keys the SDK enforces itself rather than Deno: the sites a script may act on.
const SITE_KEY = "sites";
const SITE_PATTERN = /^(\*\.)?[a-z0-9-]+(\.[a-z0-9-]+)*$/i;
// Keys whose values are filesystem paths, and the forms that mean "my whole folder".
// Those are rejected: a bare "." is as broad as the implicit grant it replaced, just
// written down, and it is the value people reach for by reflex.
const PATH_KEYS = ["read", "write"];
const SELF_DIR = new Set([".", "./", ".\\"]);
const KNOWN_KEYS = [...FLAG_KEYS, ...CAPABILITY_KEYS, SITE_KEY];
const DEFAULT_TIMEOUT_MS = 10 * 60 * 1000;

class MissingHeaderError extends Error {}

function emptyGrants() {
  const g = {};
  for (const k of FLAG_KEYS) g[k] = [];
  for (const k of CAPABILITY_KEYS) g[k] = false;
  g.sites = [];
  // The capability keys exactly as the header wrote them, before IMPLIES expands them. Approvals
  // compare these, so a script that already declared `browser` keeps its approval.
  g.declaredCapabilities = [];
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
          if (!grants.declaredCapabilities.includes(key)) grants.declaredCapabilities.push(key);
          for (const implied of IMPLIES[key] || []) grants[implied] = true;
          continue;
        }

        if (eq === -1 || token.slice(eq + 1) === "") {
          throw new Error(`@permissions ${key} needs a value, e.g. ${key}=…`);
        }
        if (key === SITE_KEY) {
          for (const site of token.slice(eq + 1).split(",")) {
            if (!site) continue;
            if (!SITE_PATTERN.test(site)) {
              throw new Error(
                `@permissions sites=${site} is not a site: write hosts like example.com or *.example.com (no scheme, path or port)`
              );
            }
            if (!grants.sites.includes(site.toLowerCase())) grants.sites.push(site.toLowerCase());
          }
          continue;
        }
        for (const value of token.slice(eq + 1).split(",")) {
          if (!value) continue;
          if (PATH_KEYS.includes(key) && SELF_DIR.has(value)) {
            throw new Error(
              `@permissions ${key}=${value} is not allowed — name what you ${key}, e.g. ` +
                `${key}=output.md or ${key}=results. Deno path grants are recursive, so "." ` +
                `would hand the script its whole folder and everything under it, including ` +
                `folders that do not exist yet.`
            );
          }
          if (!grants[key].includes(value)) grants[key].push(value);
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
    FLAG_KEYS.some((k) => grants[k].length > 0) ||
    CAPABILITY_KEYS.some((k) => grants[k] === true) ||
    (grants.sites || []).length > 0
  );
}

// Canonical string form of a grant set — what consent approvals store and compare. Capabilities
// are included, so adding `browser` to a script re-prompts rather than riding an old approval.
function canonicalGrants(grants) {
  const parts = FLAG_KEYS.filter((k) => grants[k].length > 0).map(
    (k) => `${k}=${[...grants[k]].sort().join(",")}`
  );
  const declared = grants.declaredCapabilities || CAPABILITY_KEYS.filter((k) => grants[k]);
  for (const k of declared) parts.push(k);
  if ((grants.sites || []).length) parts.push(`sites=${[...grants.sites].sort().join(",")}`);
  return parts.sort().join(" ");
}

// Human-readable lines for the consent prompt. run= is rendered honestly — most binaries a
// script would run (git, npm, shells) amount to full user privilege — and so is `browser`, which
// acts inside whatever sessions the user is already signed in to.
function renderGrants(grants) {
  const lines = [];
  if (grants.browser) {
    lines.push("Control the browser: open any page and run code in it, as you (signed-in sessions)");
  } else {
    if (grants["page-js"]) {
      lines.push(
        "Run its own code inside pages, as you: it can read page data and cookies and send requests as you"
      );
    }
    if (grants.forms) lines.push("Fill in and click on pages, as you (typing, choosing options, uploading files)");
    if (grants.tabs) lines.push("Open and read browser tabs: pages, titles and form fields, as you");
  }
  if (grants.submit) {
    lines.push("Submit forms, as you: send applications, messages or orders (it is asked to confirm with you first)");
  }
  if (grants.tabs) {
    lines.push(
      (grants.sites || []).length
        ? `Only on these sites: ${grants.sites.join(", ")}`
        : "On any site (the script declares no sites= limit)"
    );
  }
  if (grants.clipboard) lines.push("Read and write the system clipboard");
  if (grants.net.length) lines.push(`Network access to: ${grants.net.join(", ")}`);
  if (grants.run.length) {
    lines.push(`Run commands as you (full user privilege): ${grants.run.join(", ")}`);
  }
  // Paths are explicit now — "." is rejected at parse time — so show them as declared. A
  // directory grant is still recursive, hence "(and anything inside)" for non-file-looking paths.
  const describePaths = (paths) =>
    paths.map((p) => (/\.[a-z0-9]+$/i.test(p) ? p : `${p} (and anything inside)`)).join(", ");
  if (grants.read.length) lines.push(`Read files at: ${describePaths(grants.read)}`);
  if (grants.write.length) lines.push(`Write files at: ${describePaths(grants.write)}`);
  if (grants.env.length) lines.push(`Read environment variables: ${grants.env.join(", ")}`);
  if (grants.import.length) lines.push(`Import modules from: ${grants.import.join(", ")}`);
  return lines;
}

// The sensitive web APIs a script's page code reaches through the `page` scope (ADR-0026), for
// the consent prompt. Page code reaches the browser only as `page.…` (the lint plugin flags
// anything else), so this is a property-access match, not a guess. Advisory, like the grants: a
// determined script can hide an access from any static scan.
const PAGE_API_GROUPS = [
  ["make network requests as you", /\bpage\s*\.\s*(fetch|XMLHttpRequest|WebSocket|EventSource|navigator\s*\.\s*sendBeacon)\b/],
  ["read cookies", /\bpage\s*\.\s*document\s*\.\s*cookie\b|\bpage\s*\.\s*cookieStore\b/],
  ["read stored site data", /\bpage\s*\.\s*(localStorage|sessionStorage|indexedDB|caches)\b/],
  ["navigate or open windows", /\bpage\s*\.\s*(location\s*\.\s*(assign|replace|reload)|open|history)\b|\bpage\s*\.\s*location\s*\.\s*href\s*=[^=]/],
  ["use the clipboard", /\bpage\s*\.\s*navigator\s*\.\s*clipboard\b/],
];

function pageApiUse(source) {
  const text = String(source);
  return PAGE_API_GROUPS.filter(([, re]) => re.test(text)).map(([label]) => label);
}

module.exports = {
  pageApiUse,
  parseHeader,
  hasGrants,
  canonicalGrants,
  renderGrants,
  MissingHeaderError,
  FLAG_KEYS,
  CAPABILITY_KEYS,
  IMPLIES,
  DEFAULT_TIMEOUT_MS,
};
