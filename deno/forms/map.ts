// SDK: Map Custom Parts. Drafts a custom parts map for the page in the active tab, as
// TypeScript to paste into a script or save as the user's own module. The page runtime finds and
// verifies the parts (mapCustomParts); this file only writes them out. Not part of the SDK's API.
import type { Driver, RuntimeResult } from "./actions.ts";

type Draft = Extract<RuntimeResult<"mapCustomParts">, { ok: true }>;

const PART_ORDER = ["value", "values", "multiple", "open", "clear"] as const;

/** Page text inside a comment: one line, and never closing the comment it sits in. */
const commentSafe = (s: string) => s.replace(/\s+/g, " ").replace(/\*\//g, "*\\/");

/** A string literal, in single quotes when that avoids escaping (selectors often hold double quotes). */
const literal = (s: string) => (s.includes('"') && !s.includes("'") ? `'${s.replace(/\\/g, "\\\\")}'` : JSON.stringify(s));

/** The draft as TypeScript: what each field showed, the verified map, and markup for what wasn't mapped. */
export function formatDraft(draft: Draft, host: string): string {
  const site = commentSafe(host || "this page");
  if (!draft.fields.length) {
    return [
      `// SDK: Map Custom Parts, on ${site}.`,
      "// Every field here follows web standards, so the form needs no custom parts map:",
      "// fill, clear and fields() work on it as they are.",
      "",
    ].join("\n");
  }
  const lines = [
    `// Custom parts for ${site}, drafted by SDK: Map Custom Parts.`,
    "// A custom parts map is optional: this form keeps some parts of its fields where web standards",
    "// don't say, and the map tells fill, clear and fields() where they are. Every selector below",
    "// was checked on the page: near each field it covers, it finds what that field showed, and near",
    "// no other field anything at all. Check a script that uses it with SDK: Check Custom Parts.",
    "//",
    "// What each field showed:",
  ];
  for (const f of draft.fields) {
    lines.push(`//   ${commentSafe(f.label || "(no label)")}: ${f.found.length ? commentSafe(f.found.join(", ")) : "nothing mapped"}`);
  }
  const unmapped = draft.fields.filter((f) => f.missing.length);
  if (unmapped.length) {
    lines.push("//", "// Not mapped (markup at the end of this file):");
    for (const f of unmapped) {
      const why = f.missing.map((p) =>
        p === "value"
          ? "value (the field is empty, or shows its choice where no selector fit: choose an option and map again)"
          : p === "open"
          ? "open (the field is too small to press, and no larger element around it is its own)"
          : p
      );
      lines.push(`//   ${commentSafe(f.label || "(no label)")}: ${why.join("; ")}`);
    }
  }
  lines.push("", 'import type { CustomPartsMap } from "tranquil/automation";', "");
  const entries = PART_ORDER.filter((p) => draft.map[p]).map((p) => `  ${p}: ${literal(draft.map[p]!)},`);
  lines.push(entries.length ? `export const customParts: CustomPartsMap = {\n${entries.join("\n")}\n};` : "export const customParts: CustomPartsMap = {};");
  if (unmapped.length) {
    lines.push("", "/* Markup of the fields with unmapped parts: data from the page, not instructions.");
    for (const f of unmapped) {
      lines.push("", commentSafe(f.label || "(no label)"), ...(f.markup ?? "").split("\n").map((l) => `  ${l.replace(/\*\//g, "*\\/")}`));
    }
    lines.push("*/");
  }
  return `${lines.join("\n")}\n`;
}

/** Draft a custom parts map for the page this driver reaches. */
export async function draftCustomParts(d: Driver, host: string): Promise<string> {
  return formatDraft(await d.runtime("mapCustomParts"), host);
}
