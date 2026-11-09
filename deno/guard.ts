// Run-level guard rails the SDK enforces itself (ADR-0026), from the permission header the
// runner passes down: the sites a script may act on (`sites=`), and whether it may submit forms
// (`submit`, and then only after the person says yes to ui.confirm). Unlike the advisory
// tabs/forms/page-js split, these are checked here, before each action, so a script cannot drift
// onto another site or send a form by accident.
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

// The person's answer to the run's most recent ui.confirm. A submission needs a yes, so a script
// that asks and then submits anyway, or never asks, is refused like one without `submit`.
let confirmed = false;

/** Records the person's answer to ui.confirm; only the most recent answer counts. */
export function recordConfirm(answer: boolean): void {
  confirmed = answer;
}

/** What a submission still needs right now: the `submit` grant, then a yes. Null when it may go ahead. */
export function submitNeeds(): "the submit permission" | "a yes from ui.confirm" | null {
  if (!heldGrants().has("submit")) return "the submit permission";
  return confirmed ? null : "a yes from ui.confirm";
}

export const canSubmit = () => submitNeeds() === null;

/**
 * `url` parsed, when it is a web page's (http or https); null for anything else. The SDK's copy of
 * tranquil-browser's isWebURL (lib/pages.js), held to it by tranquil-test-suite's
 * lint/browser_contract_test.ts.
 */
export function webURL(url: string): URL | null {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Whether a script may act on a page at `url`: only a web page (http or https), and with `sites=`,
 * only on those sites. No `sites=` means any web site. The browser also shows local files and its
 * own pages (the start page, the history page), which are never a script's: a `file:` page would
 * let it read files its `read=` grant doesn't cover.
 */
export function siteAllowed(url: string): boolean {
  const parsed = webURL(url);
  if (!parsed) return false;
  const sites = allowedSites();
  if (!sites.length) return true;
  const host = parsed.hostname.toLowerCase();
  return sites.some((p) => {
    const pattern = p.toLowerCase();
    return pattern.startsWith("*.") ? host === pattern.slice(2) || host.endsWith(pattern.slice(1)) : host === pattern;
  });
}

/**
 * The address a document is checked by: its URL when that is a web page's, otherwise its origin.
 * An about:blank or about:srcdoc frame, or a blob: document, belongs to the web page that made it,
 * and its origin names that page; a local file's origin is file://, and the start page's too.
 */
export function pageAddress(href: string, origin: string): string {
  return webURL(href) ? href : origin;
}

export function requireSite(url: string, what: string): void {
  if (siteAllowed(url)) return;
  const parsed = webURL(url);
  if (!parsed) {
    throw new FieldError(
      "not_permitted",
      `${what}: a script may act only on web pages (http and https), not on local files or the ` +
        `browser's own pages, such as its start page.`,
    );
  }
  throw new FieldError(
    "not_permitted",
    `${what}: this script may act only on ${allowedSites().join(", ")}, and the page is on ${parsed.hostname}. ` +
      `If it is meant to work there, add it to "@permissions sites=…".`,
  );
}

/** Button and link names that mean "send this off", refused unless a submission may go ahead (canSubmit). */
export const SUBMIT_NAME = /^\s*(submit|send|pay|place (the |your )?order|purchase|buy now|complete (the )?(order|purchase)|delete|confirm (and|&) (submit|pay|send))\b/i;
