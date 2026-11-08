// What clicking a link in rendered Markdown may do. Web links open in a Tranquil browser tab,
// relative paths open in Tranquil once the caller has checked they stay where they should, and
// anything else (javascript:, file:, data:, mailto:, in-page anchors) does nothing.
import type { LinkAction } from "./types/links.ts";

export function classifyLink(href: string | null | undefined): LinkAction {
  const h = String(href || "").trim();
  if (/^https?:\/\//i.test(h)) return { kind: "web", url: h };
  if (h === "" || h.startsWith("#") || h.startsWith("//") || /^[a-z][a-z0-9+.-]*:/i.test(h)) {
    return { kind: "inert" };
  }
  try {
    return { kind: "relative", path: decodeURI(h.split("#")[0]) };
  } catch {
    return { kind: "inert" }; // a malformed escape
  }
}
