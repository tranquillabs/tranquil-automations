// The guard's decisions (ADR-0026). A submission needs the `submit` grant and a yes to the run's
// most recent ui.confirm, so a script that never asks, or asks and submits after a no, is refused
// like one without `submit`. A script acts only on web pages, and with `sites=` only on those
// sites: never on a local file or the browser's own pages, with or without `sites=`.
import { assertEquals, assertThrows } from "jsr:@std/assert@^1";
import {
  canSubmit,
  pageAddress,
  recordConfirm,
  requireSite,
  siteAllowed,
  submitNeeds,
} from "tranquil-automations/deno/guard.ts";
import { FieldError } from "tranquil-automations/deno/forms/types.ts";

// The browser's start page and history page, as the browser loads them.
const START_PAGE = "file:///Applications/Tranquil.app/tranquil-browser/resources/home.html?theme=dark";
const HISTORY_PAGE = "file:///Applications/Tranquil.app/tranquil-browser/resources/history.html";
const NOT_WEB = [
  START_PAGE,
  HISTORY_PAGE,
  "file:///etc/hosts",
  "data:text/html,hi",
  "about:blank",
  "null",
  "",
];

/** Runs `fn` with `sites=` set to `sites` (none when empty). */
function withSites(sites: string, fn: () => void) {
  try {
    Deno.env.set("TRANQUIL_SITES", sites);
    fn();
  } finally {
    Deno.env.delete("TRANQUIL_SITES");
  }
}

Deno.test("with no sites=, any web page is allowed, and nothing else is", () => {
  withSites("", () => {
    assertEquals(siteAllowed("https://example.com/form"), true);
    assertEquals(siteAllowed("http://localhost:3000/new-customer.html"), true);
    for (const url of NOT_WEB) assertEquals(siteAllowed(url), false, url);
  });
});

Deno.test("with sites=, only those sites' web pages are allowed", () => {
  withSites("example.com,*.example.org", () => {
    assertEquals(siteAllowed("https://example.com/"), true);
    assertEquals(siteAllowed("https://EXAMPLE.com/"), true);
    assertEquals(siteAllowed("https://example.org/"), true, "*.example.org includes example.org");
    assertEquals(siteAllowed("https://jobs.example.org/"), true);
    assertEquals(siteAllowed("https://www.example.com/"), false, "example.com is that host only");
    assertEquals(siteAllowed("https://example.com.evil.test/"), false);
    for (const url of NOT_WEB) assertEquals(siteAllowed(url), false, url);
  });
});

Deno.test("a document is checked by its URL when it's a web page, else by its origin", () => {
  assertEquals(pageAddress("https://example.com/a", "https://example.com"), "https://example.com/a");
  // An about:blank or about:srcdoc frame, or a blob: document, belongs to the page that made it.
  assertEquals(pageAddress("about:blank", "https://example.com"), "https://example.com");
  assertEquals(pageAddress("about:srcdoc", "https://example.com"), "https://example.com");
  assertEquals(pageAddress("blob:https://example.com/0f1e", "https://example.com"), "https://example.com");
  // A local file's origin is file://; a data: page's or a new blank tab's is opaque ("null").
  assertEquals(pageAddress(START_PAGE, "file://"), "file://");
  assertEquals(pageAddress("data:text/html,hi", "null"), "null");
  withSites("example.com", () => {
    assertEquals(siteAllowed(pageAddress("about:srcdoc", "https://example.com")), true);
    assertEquals(siteAllowed(pageAddress("about:blank", "https://evil.test")), false);
    assertEquals(siteAllowed(pageAddress(START_PAGE, "file://")), false);
  });
});

Deno.test("a refusal names the reason: not a web page, or not one of the sites", () => {
  withSites("example.com", () => {
    const local = assertThrows(() => requireSite("file://", "fields"), FieldError);
    assertEquals(local.code, "not_permitted");
    assertEquals(local.message.startsWith("not_permitted: fields: a script may act only on web pages"), true);
    const other = assertThrows(() => requireSite("https://evil.test/", "fields"), FieldError);
    assertEquals(other.message.includes("may act only on example.com, and the page is on evil.test"), true);
  });
});

Deno.test("a submission needs the submit grant and a yes to the most recent ui.confirm", () => {
  try {
    Deno.env.set("TRANQUIL_GRANTS", "submit,forms,tabs");
    assertEquals(submitNeeds(), "a yes from ui.confirm", "never asked");
    assertEquals(canSubmit(), false);

    recordConfirm(false);
    assertEquals(submitNeeds(), "a yes from ui.confirm", "asked, and the person said no");

    recordConfirm(true);
    assertEquals(submitNeeds(), null);
    assertEquals(canSubmit(), true);

    recordConfirm(false);
    assertEquals(canSubmit(), false, "a later no takes the yes back");

    Deno.env.set("TRANQUIL_GRANTS", "forms,tabs");
    recordConfirm(true);
    assertEquals(submitNeeds(), "the submit permission", "a yes is not enough without the grant");
  } finally {
    Deno.env.delete("TRANQUIL_GRANTS");
    recordConfirm(false);
  }
});
