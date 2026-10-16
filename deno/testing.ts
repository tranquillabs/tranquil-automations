// tranquil/automation/testing (ADR-0026): run the SDK's field resolver over saved HTML, so a
// script's targets can be tested without a browser. Test-only; never needed at run time.
//
//   import { checkTargets, fieldsOf } from "tranquil/automation/testing";
//   const fields = fieldsOf(Deno.readTextFileSync("apply.html"));
//
// Resolution here is structural: no layout, so visibility comes from `hidden` and inline
// `display: none` only, and values are what the HTML says.
import { DOMParser } from "https://raw.githubusercontent.com/tranquillabs/deno-dom/v0.1.56-tq.1/deno-dom-wasm.ts";
import type { Page } from "./page.ts";
import { createFormsRuntime, type FormsRuntime } from "./forms/runtime.ts";
import { describeTarget, FieldError, toWire, toWireParts } from "./forms/types.ts";
import type { CustomPartsMap, ErrorCode, Field, Kind, Target } from "./forms/types.ts";
import { rankSuggestions } from "./forms/rank.ts";

/** The three candidates closest to what the target asked for. */
function closest(target: Target, candidates: string[]): string[] {
  const wanted = typeof target === "object" && "label" in target && typeof target.label === "string"
    ? target.label
    : typeof target === "object" && "name" in target && typeof target.name === "string"
    ? target.name
    : null;
  return (wanted ? rankSuggestions(wanted, candidates) : candidates).slice(0, 3);
}

/** Options every helper takes: the script's custom parts maps, as `tab.useCustomParts()` would get them. */
export interface OfflineOptions {
  customParts?: CustomPartsMap | CustomPartsMap[];
}

function offlinePage(html: string, options: OfflineOptions = {}): FormsRuntime {
  const document = new DOMParser().parseFromString(html, "text/html");
  if (!document) throw new Error("Could not parse the HTML");
  const page = {
    document,
    getComputedStyle: () => ({ display: "block", visibility: "visible", opacity: "1", pointerEvents: "auto" }),
    requestAnimationFrame: (cb: (t: number) => void) => setTimeout(() => cb(0), 0),
    setTimeout: (cb: () => void, ms?: number) => setTimeout(cb, ms),
    CSS: { escape: (s: string) => s.replace(/[^\w-]/g, (c) => `\\${c}`) },
  } as unknown as Page;
  const runtime = createFormsRuntime(page);
  const maps = options.customParts === undefined ? [] : [options.customParts].flat();
  runtime.useCustomParts(toWireParts(maps));
  return runtime;
}

/** The fields `tab.fields()` would report for this HTML (structurally; see module notes). */
export function fieldsOf(html: string, options: { within?: Target } & OfflineOptions = {}): Field[] {
  const result = offlinePage(html, options).fields(options.within ? toWire(options.within) : undefined);
  if (!result.ok) throw new FieldError(result.code as ErrorCode, result.message, result);
  return result.fields as Field[];
}

/** The field a target resolves to in this HTML, or the FieldError `fill` would throw. */
export function fieldOf(html: string, target: Target, options: OfflineOptions = {}): Field {
  const result = offlinePage(html, options).resolve(toWire(target));
  if (!result.ok) {
    throw new FieldError(
      result.code as ErrorCode,
      `${describeTarget(target)}: ${result.message}`,
      result,
    );
  }
  return result.field as Field;
}

/** One target checked against one saved page, by `checkTargets`. */
export interface TargetCheck {
  target: Target;
  snapshot: string;
  ok: boolean;
  /** The field it matched, when it matched exactly one. */
  label?: string;
  kind?: Kind;
  /** Why it did not: `not_found`, `ambiguous`, … */
  code?: ErrorCode;
  message?: string;
  /** For `not_found`, the labels on that page closest to the target; for `ambiguous`, the matches. */
  candidates?: string[];
}

/**
 * Check every target against every saved page: each must match exactly one field on each.
 * Save the page in each state it can be in (signed in or out, after a validation error, an
 * A/B variant), for example with a script that writes
 * `page.document.documentElement.outerHTML` to a file, so a target that only works on one of
 * them shows up here instead of on a live run.
 *
 *     const pages = { clean: Deno.readTextFileSync("apply.html"), errors: Deno.readTextFileSync("apply-errors.html") };
 *     const failed = checkTargets([{ label: "Email" }, { label: "Phone", within: "#work" }], pages).filter((c) => !c.ok);
 */
export function checkTargets(
  targets: Target[],
  snapshots: Record<string, string>,
  options: OfflineOptions = {},
): TargetCheck[] {
  const out: TargetCheck[] = [];
  for (const [snapshot, html] of Object.entries(snapshots)) {
    const runtime = offlinePage(html, options);
    for (const target of targets) {
      let result;
      try {
        result = runtime.resolve(toWire(target));
      } catch (e) {
        out.push({ target, snapshot, ok: false, message: e instanceof Error ? e.message : String(e) });
        continue;
      }
      out.push(
        result.ok
          ? { target, snapshot, ok: true, label: result.field.label, kind: result.field.kind }
          : {
            target,
            snapshot,
            ok: false,
            code: result.code as ErrorCode,
            message: result.message,
            ...(result.candidates?.length ? { candidates: closest(target, result.candidates) } : {}),
          },
      );
    }
  }
  return out;
}
