// Workbook disk access (ui/workbook/disk.ts, ADR-0030): every path a workbook names stays inside
// its project, reads are capped, and writes go through a temporary file and a rename.
import { assert, assertEquals, assertStringIncludes } from "jsr:@std/assert@^1";
import * as disk from "tranquil-automations/ui/workbook/disk.ts";

function project() {
  const root = Deno.makeTempDirSync({ prefix: "workbook-disk-" });
  Deno.mkdirSync(`${root}/jobs`);
  Deno.mkdirSync(`${root}/apply`);
  Deno.writeTextFileSync(`${root}/apply/read.ts`, "// @permissions tabs\n");
  Deno.writeTextFileSync(`${root}/jobs/a.workbook.md`, "# A\n");
  return { root, doc: `${root}/jobs/a.workbook.md` };
}

Deno.test("a path relative to the workbook resolves inside the project, ../ included", () => {
  const { root, doc } = project();
  const r = disk.resolveInProject(root, doc, "../apply/read.ts", { ext: ".ts" });
  assert(r.ok);
  if (r.ok) assertEquals(r.abs, `${root}/apply/read.ts`);
  assert(
    disk.resolveInProject(root, doc, "a/not-yet-written.json").ok,
    "a file that doesn't exist yet is fine",
  );
});

Deno.test("absolute, home-relative and escaping paths are refused", () => {
  const { root, doc } = project();
  for (const rel of ["/etc/passwd", "~/x.ts", "../../outside.ts", ""]) {
    const r = disk.resolveInProject(root, doc, rel);
    assert(!r.ok, rel);
  }
  const r = disk.resolveInProject(root, doc, "../../outside.ts");
  if (!r.ok) assertStringIncludes(r.reason, "outside this project");
});

Deno.test("a symlink can't lead out of the project", () => {
  const { root, doc } = project();
  const outside = Deno.makeTempDirSync({ prefix: "workbook-outside-" });
  Deno.writeTextFileSync(`${outside}/evil.ts`, "// @permissions none\n");
  // Deno.symlinkSync needs unscoped read and write, so the link is made with ln (allowed by name
  // in the test task), as tranquil-test-suite's lint tests do.
  const made = new Deno.Command("ln", { args: ["-s", outside, `${root}/jobs/link`] }).outputSync();
  assert(made.success, new TextDecoder().decode(made.stderr));
  const r = disk.resolveInProject(root, doc, "link/evil.ts", { ext: ".ts" });
  assert(!r.ok);
});

Deno.test("a run path must end in .ts when asked", () => {
  const { root, doc } = project();
  const r = disk.resolveInProject(root, doc, "../apply/read.js", { ext: ".ts" });
  assert(!r.ok);
  if (!r.ok) assertStringIncludes(r.reason, "must end in .ts");
});

Deno.test("readCapped reads, cuts at the cap, and reports a missing file", () => {
  const { root } = project();
  Deno.writeTextFileSync(`${root}/big.txt`, "x".repeat(100));
  const whole = disk.readCapped(`${root}/big.txt`);
  assert(whole.ok && whole.text.length === 100 && !whole.truncated);
  const cut = disk.readCapped(`${root}/big.txt`, 10);
  assert(cut.ok && cut.text === "x".repeat(10) && cut.truncated);
  const missing = disk.readCapped(`${root}/nope.txt`);
  assert(!missing.ok && missing.missing);
});

Deno.test("writeDoc applies an edit through a temporary file, and leaves nothing behind", () => {
  const { doc } = project();
  const dir = doc.slice(0, doc.lastIndexOf("/"));
  Deno.chmodSync(doc, 0o640);
  assertEquals(disk.writeDoc(doc, (t) => t + "more\n"), { ok: true, changed: true });
  assertEquals(Deno.readTextFileSync(doc), "# A\nmore\n");
  assertEquals(Deno.statSync(doc).mode! & 0o777, 0o640, "the file keeps its permissions");
  assertEquals([...Deno.readDirSync(dir)].map((e) => e.name), ["a.workbook.md"], "no temporary file left");
  assertEquals(disk.writeDoc(doc, () => null), { ok: true, changed: false });
});

Deno.test("writeDoc reads again when someone else wrote the file during an edit", () => {
  const { doc } = project();
  let calls = 0;
  const result = disk.writeDoc(doc, (t) => {
    calls++;
    if (calls === 1) Deno.writeTextFileSync(doc, "# B\n"); // another writer, mid-edit
    return t + "mine\n";
  });
  assertEquals(result, { ok: true, changed: true });
  assertEquals(calls, 2);
  assertEquals(Deno.readTextFileSync(doc), "# B\nmine\n", "the edit applies to what's there now");
});

Deno.test("writeDoc writes a symlinked workbook through to its file", async () => {
  const { root, doc } = project();
  const link = `${root}/link.workbook.md`;
  const made = await new Deno.Command("ln", { args: ["-s", doc, link] }).output();
  assert(made.success);
  assertEquals(disk.writeDoc(link, (t) => t + "via link\n"), { ok: true, changed: true });
  assert(Deno.lstatSync(link).isSymlink, "the link is still a link");
  assertEquals(Deno.readTextFileSync(doc), "# A\nvia link\n");
});
