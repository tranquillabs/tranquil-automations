"use babel";

// Building the temp entry for a run-selection.
//
// A selection runs as its own module, so `const tab = await tabs.active()` fails with "tabs is
// not defined" — the import lives at the top of the file, outside what was highlighted. The old
// in-editor runner injected globals and hid this; a Deno module cannot. Selecting the imports
// every time is not a REPL.
//
// So the file's imports are carried over, and appended AFTER the selection rather than before.
// ES module imports are hoisted — they bind before evaluation regardless of position, verified
// against Deno with a top-level await ahead of them — so appending keeps the selection's own line
// numbers at 1:1 with what was highlighted. A stack trace still points at the line the user is
// looking at, which is the whole reason the temp file exists.

// Top-level import statements, in source order, including multi-line and side-effect forms.
function collectImports(source) {
  const lines = String(source).split("\n");
  const imports = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!/^\s*import\s/.test(line) && !/^\s*import\s*\{/.test(line)) {
      i += 1;
      continue;
    }
    // A statement may span lines until the one carrying its specifier.
    const buf = [lines[i]];
    while (i < lines.length && !/from\s*["'][^"']+["']|^\s*import\s*["'][^"']+["']/.test(lines[i])) {
      i += 1;
      if (i < lines.length) buf.push(lines[i]);
    }
    imports.push(buf.join("\n").trimEnd());
    i += 1;
  }
  return imports;
}

// The module specifier an import statement refers to, or null.
function specifierOf(statement) {
  const m = statement.match(/["']([^"']+)["']\s*;?\s*$/);
  return m ? m[1] : null;
}

// Selection + the file's imports it does not already have. Returns the selection unchanged when
// there is nothing to add, so an ordinary whole-statement selection is untouched.
function buildSelectionEntry(fileSource, selection) {
  const text = String(selection);
  const already = new Set(collectImports(text).map(specifierOf).filter(Boolean));
  const carried = collectImports(fileSource).filter((statement) => {
    const spec = specifierOf(statement);
    return spec && !already.has(spec);
  });
  if (!carried.length) return text;

  return (
    `${text}\n\n` +
    "// Imports carried over from the file so the selection can run on its own. Appended, not\n" +
    "// prepended: imports are hoisted, so this keeps the selection's line numbers intact.\n" +
    `${carried.join("\n")}\n`
  );
}

module.exports = { buildSelectionEntry, collectImports, specifierOf };
