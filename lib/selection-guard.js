"use babel";

// Is a selected snippet plausibly runnable on its own?
//
// Running a selection is a real feature — highlight a few statements, hit Run, see what they do.
// The trap is that it is IMPLICIT: any leftover selection silently changes what the Run button
// does, so a stray highlight like `} catch {` gets written to <scriptDir>/.runs/<runId>.ts and
// executed, and Deno reports "Expression expected" against a one-line temp file the user never
// wrote. The error is accurate and completely unhelpful.
//
// This is a cheap structural check, not a parser: it only asks whether brackets balance, which is
// what a half-selected block always fails. Anything that balances is passed straight through —
// the goal is to catch the obvious accident, not to police syntax (Deno remains the judge of that).

// Walks the source skipping strings, template literals, regex-ish comments and comments, so a
// brace inside "a { b" or a // comment cannot throw the count off.
function scanBrackets(source) {
  const stack = [];
  const pairs = { ")": "(", "]": "[", "}": "{" };
  let i = 0;

  while (i < source.length) {
    const ch = source[i];
    const next = source[i + 1];

    // Comments.
    if (ch === "/" && next === "/") {
      const nl = source.indexOf("\n", i);
      i = nl === -1 ? source.length : nl;
      continue;
    }
    if (ch === "/" && next === "*") {
      const end = source.indexOf("*/", i + 2);
      i = end === -1 ? source.length : end + 2;
      continue;
    }

    // Strings and template literals. Template interpolation is not walked: an unbalanced brace
    // inside `${...}` is vanishingly rare in a selection compared with the false positives that
    // trying to parse it would cause.
    if (ch === '"' || ch === "'" || ch === "`") {
      const quote = ch;
      i += 1;
      while (i < source.length) {
        if (source[i] === "\\") {
          i += 2;
          continue;
        }
        if (source[i] === quote) {
          i += 1;
          break;
        }
        i += 1;
      }
      continue;
    }

    if (ch === "(" || ch === "[" || ch === "{") stack.push(ch);
    else if (pairs[ch]) {
      // A closer with nothing open is the signature of a half-selected block.
      if (stack.pop() !== pairs[ch]) return { balanced: false, reason: "unopened" };
    }
    i += 1;
  }

  return stack.length ? { balanced: false, reason: "unclosed" } : { balanced: true };
}

// Returns null when the selection is fine to run, or a human-readable reason when it is not.
function selectionProblem(selection) {
  const text = String(selection || "").trim();
  if (!text) return null;
  const { balanced, reason } = scanBrackets(text);
  if (balanced) return null;
  return reason === "unopened"
    ? "The selection starts inside a block — it closes brackets it never opened."
    : "The selection leaves brackets open.";
}

module.exports = { selectionProblem, scanBrackets };
