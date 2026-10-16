// Run-level guard rails the SDK enforces itself (ADR-0026), from the permission header the
// runner passes down: the sites a script may act on (`sites=`), and whether it may submit forms
// (`submit`). Unlike the advisory tabs/forms/page-js split, these are checked here, before each
// action, so a script cannot drift onto another site or send a form by accident.
import { FieldError } from "./forms/types.ts";
import { heldGrants } from "./grants.ts";

function env(name: string): string {
  try {
    return Deno.env.get(name) ?? "";
  } catch {
    return "";
  }
}

/** Host patterns from `@permissions sites=…`: exact hosts, or `*.example.com` (which also matches example.com). */
export function allowedSites(): string[] {
  return env("TRANQUIL_SITES").split(",").filter(Boolean);
}

export const canSubmit = () => heldGrants().has("submit");

/** Whether a page at `url` is inside the declared sites. No `sites=` means any site; non-web pages (the start page) always pass. */
export function siteAllowed(url: string): boolean {
  const sites = allowedSites();
  if (!sites.length) return true;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return true;
  const host = parsed.hostname.toLowerCase();
  return sites.some((p) => {
    const pattern = p.toLowerCase();
    return pattern.startsWith("*.") ? host === pattern.slice(2) || host.endsWith(pattern.slice(1)) : host === pattern;
  });
}

export function requireSite(url: string, what: string): void {
  if (siteAllowed(url)) return;
  let host = url;
  try {
    host = new URL(url).hostname;
  } catch { /* keep the raw string */ }
  throw new FieldError(
    "not_permitted",
    `${what}: this script may act only on ${allowedSites().join(", ")}, and the page is on ${host}. ` +
      `If it is meant to work there, add it to "@permissions sites=…".`,
  );
}

/** Button and link names that mean "send this off", refused without the `submit` grant. */
export const SUBMIT_NAME = /^\s*(submit|send|pay|place (the |your )?order|purchase|buy now|complete (the )?(order|purchase)|delete|confirm (and|&) (submit|pay|send))\b/i;
