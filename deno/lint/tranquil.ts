/// <reference lib="deno.unstable" />
// Tranquil lint plugin (ADR-0026). Enabled by the seeded ~/.tranquil/automations/deno.json;
// run with `deno lint --config ~/.tranquil/automations/deno.json`. Page code (callbacks passed to tab.evaluate/waitFor) runs
// inside the page and reaches the browser only through its `page` argument, typed by the Page
// declaration. These rules keep that explicit:
//
//   page-free-global    browser globals used inside page code without `page.` (Deno's own lib
//                       declares fetch, location, localStorage and friends, so the type checker
//                       cannot catch these)
//   page-js-undeclared  page code in a script whose @permissions header lacks page-js/browser
//                       (a file with no header is a module a script imports: the importing
//                       script's header governs it, so it isn't flagged)
//   opaque-page-code    string-form evaluate(): code in a string cannot be checked at all
//   brittle-css-target  a CSS target likely to break on the site's next build: positional
//                       (:nth-child), generated ids or hashed class names, long chains
//   submit-unconfirmed  a script with the submit grant (or browser) that never asks with ui.confirm()
//   sites-undeclared    a script that acts on pages (forms, page-js, submit, browser) with no
//                       sites= limit
//   literal-secret      a secret written into the script: a string literal filled with
//                       { sensitive: true }, or into a password, card or code field
import { brittleness, cssNodes, literalTarget, targetNodes } from "./targets.ts";
import { type Capability, grantsOf } from "../grants.ts";

const BROWSER_GLOBALS = new Set([
  "document",
  "window",
  "self",
  "globalThis",
  "location",
  "navigator",
  "history",
  "fetch",
  "XMLHttpRequest",
  "WebSocket",
  "EventSource",
  "localStorage",
  "sessionStorage",
  "indexedDB",
  "caches",
  "cookieStore",
  "open",
  "alert",
]);

const PAGE_CALL = "CallExpression[callee.type='MemberExpression'][callee.property.name=/^(evaluate|waitFor)$/]";
const PAGE_FN = `${PAGE_CALL} > :matches(ArrowFunctionExpression, FunctionExpression)`;

/** The tokens of the script's @permissions lines. */
function headerTokens(text: string): string[] {
  const tokens: string[] = [];
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (line === "") continue;
    if (!line.startsWith("//")) break;
    const m = line.match(/^\/\/\s?@permissions\s+(.*)$/);
    if (m) tokens.push(...m[1].trim().split(/\s+/));
  }
  return tokens;
}

/** Whether the file has a @permissions header: an automation does, a module it imports doesn't. */
function hasHeader(text: string): boolean {
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (line === "") continue;
    if (!line.startsWith("//")) return false;
    if (/^\/\/\s?@permissions\b/.test(line)) return true;
  }
  return false;
}

/** The grants the script's header gives, implications included (browser gives page-js and submit). */
function headerGrants(text: string): ReadonlySet<Capability> {
  return grantsOf(headerTokens(text));
}

/** Grants that act on pages rather than only read them. */
const ACTS_ON_PAGES: readonly Capability[] = ["forms", "page-js", "submit"];

const SECRET_LABEL = /pass(word|code)|\bpin\b|card|cvv|cvc|security code|one-?time|\botp\b|verification code|secret|token/i;

function methodOf(call: Deno.lint.CallExpression): string | null {
  const callee = call.callee;
  return callee.type === "MemberExpression" && !callee.computed && callee.property.type === "Identifier"
    ? callee.property.name
    : null;
}

function isStringLiteral(node: Deno.lint.Node | undefined): boolean {
  return !!node && ((node.type === "Literal" && typeof node.value === "string") ||
    (node.type === "TemplateLiteral" && node.expressions.length === 0));
}

function hasSensitiveTrue(node: Deno.lint.Node | undefined): boolean {
  if (!node || node.type !== "ObjectExpression") return false;
  return node.properties.some((p) =>
    p.type === "Property" && !p.computed && p.key.type === "Identifier" && p.key.name === "sensitive" &&
    p.value.type === "Literal" && p.value.value === true
  );
}

const plugin: Deno.lint.Plugin = {
  name: "tranquil",
  rules: {
    "page-free-global": {
      create(context) {
        return {
          [`${PAGE_FN} Identifier`](node: Deno.lint.Identifier) {
            if (!BROWSER_GLOBALS.has(node.name)) return;
            const parent = node.parent;
            // `page.document`, `{ document: 1 }`: a property name, not a reference.
            if (parent.type === "MemberExpression" && parent.property === node && !parent.computed) return;
            if (parent.type === "Property" && parent.key === node && !parent.computed) return;
            context.report({
              node,
              message: `Page code uses the global \`${node.name}\`. Use \`page.${node.name}\` from the callback's ` +
                "first argument, so the web APIs a script touches are explicit (ADR-0026).",
            });
          },
        };
      },
    },

    "page-js-undeclared": {
      create(context) {
        const text = context.sourceCode.text;
        const allowed = !hasHeader(text) || headerGrants(text).has("page-js");
        return {
          [PAGE_FN](node: Deno.lint.Node) {
            if (allowed) return;
            context.report({
              node,
              message: 'Page code needs "// @permissions page-js" (or "browser") in the header. ' +
                "If a form verb (fill, click, upload, fields) can do this instead, prefer it: those need only `forms` or `tabs`.",
            });
          },
        };
      },
    },

    "opaque-page-code": {
      create(context) {
        return {
          "CallExpression[callee.type='MemberExpression'][callee.property.name='evaluate']"(
            node: Deno.lint.CallExpression,
          ) {
            const first = node.arguments[0];
            if (!first) return;
            const isString = (first.type === "Literal" && typeof first.value === "string") ||
              first.type === "TemplateLiteral";
            if (!isString) return;
            context.report({
              node: first,
              message: "evaluate() with a string cannot be type-checked or linted. Pass a function: " +
                "tab.evaluate((page) => …).",
            });
          },
        };
      },
    },

    "brittle-css-target": {
      create(context) {
        const check = (node: Deno.lint.Node) => {
          const css = node.type === "Literal" && typeof node.value === "string"
            ? node.value
            : node.type === "TemplateLiteral" && node.expressions.length === 0
            ? node.quasis[0]?.cooked ?? ""
            : "";
          const why = css && brittleness(css);
          if (!why) return;
          context.report({
            node,
            message: `This selector is likely to break: ${why}. Prefer the { label } target ` +
              "`tab.fields()` lists, or one of the alternates it gives (stable ids, names, test hooks).",
          });
        };
        return {
          CallExpression(call: Deno.lint.CallExpression) {
            for (const target of targetNodes(call)) cssNodes(target).forEach(check);
            const callee = call.callee;
            const first = call.arguments[0];
            if (
              first && callee.type === "MemberExpression" && !callee.computed &&
              callee.property.type === "Identifier" && callee.property.name === "waitFor"
            ) check(first);
          },
        };
      },
    },

    "submit-unconfirmed": {
      create(context) {
        if (!headerGrants(context.sourceCode.text).has("submit")) return {};
        let asks = false;
        return {
          CallExpression(call: Deno.lint.CallExpression) {
            if (methodOf(call) === "confirm") asks = true;
          },
          "Program:exit"(node: Deno.lint.Program) {
            if (asks) return;
            context.report({
              node,
              message: 'This script may submit forms but never asks: call ui.confirm("…") before the click that ' +
                "submits, so the person running it decides. (It answers no by itself in unattended runs.)",
            });
          },
        };
      },
    },

    "sites-undeclared": {
      create(context) {
        const tokens = headerTokens(context.sourceCode.text);
        const held = grantsOf(tokens);
        const acts = ACTS_ON_PAGES.some((grant) => held.has(grant));
        if (!acts || tokens.some((t) => t.startsWith("sites="))) return {};
        return {
          Program(node: Deno.lint.Program) {
            context.report({
              node,
              message: 'Add "sites=" to @permissions with the sites this script works on (e.g. sites=jobs.example.com or ' +
                "sites=*.example.com). The SDK then refuses to act anywhere else, and the consent prompt says where.",
            });
          },
        };
      },
    },

    "literal-secret": {
      create(context) {
        return {
          CallExpression(call: Deno.lint.CallExpression) {
            if (methodOf(call) !== "fill") return;
            const [targetNode, value, options] = call.arguments;
            if (!isStringLiteral(value)) return;
            const target = targetNode ? literalTarget(targetNode) : null;
            const label = target && typeof target === "object" && "label" in target && typeof target.label === "string"
              ? target.label
              : "";
            if (hasSensitiveTrue(options) || SECRET_LABEL.test(label)) {
              context.report({
                node: value!,
                message: "A secret written into the script ends up in version control and logs. Read it at run time " +
                  "instead (files.read from a file declared with read=), and fill it with { sensitive: true }.",
              });
            }
          },
        };
      },
    },
  },
};

export default plugin;
