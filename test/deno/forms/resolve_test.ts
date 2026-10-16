// Offline resolution: the page runtime's resolver and kind detection on deno-dom, over markup
// shaped like the forms the SDK has to handle. Fast, no browser.
import { assertEquals, assertMatch, assertThrows } from "jsr:@std/assert@^1";
import { checkTargets, fieldOf, fieldsOf } from "tranquil-automations/deno/testing.ts";
import { type Document, DOMParser } from "https://raw.githubusercontent.com/tranquillabs/deno-dom/v0.1.56-tq.1/deno-dom-wasm.ts";
import type { Page } from "tranquil-automations/deno/page.ts";
import { createFormsRuntime, type FormsRuntime } from "tranquil-automations/deno/forms/runtime.ts";
import { type CustomPartsMap, FieldError } from "tranquil-automations/deno/forms/types.ts";

const APPLICATION = `
<div class="form-field-entry">
  <label class="form-question-title" for="field_name">Name</label>
  <input id="field_name" name="field_name" required></div>
<div class="form-field-entry">
  <label class="form-question-title _required_1x3">Where are you located?</label>
  <input role="combobox" placeholder="Start typing..."></div>
<div class="autofill"><label for="af">Autofill from resume</label><input type=file id=af></div>
<label for="field_resume">Resume</label><input type=file id="field_resume">`;

const CUSTOM_SELECT = `
<div class="field"><label id="q1-label" for="q1">Will you require sponsorship? *</label>
  <div class="picker__control"><div class="picker__value-container">
    <div class="picker__single-value">No</div>
    <input class="picker__input" id="q1" role="combobox" aria-labelledby="q1-label" aria-required="true">
  </div></div>
  <input required tabindex="-1" aria-hidden="true" class="required-twin"></div>
<div class="field"><label for="first_name">First Name*</label>
  <input id="first_name" value="Ada" aria-invalid="true" aria-errormessage="first_name-error">
  <span id="first_name-error" class="error">Too short</span></div>
<fieldset><legend>Gender</legend>
  <label><input type=radio name=g value=m> Male</label>
  <label><input type=radio name=g value=f checked> Female</label></fieldset>`;

/** Where CUSTOM_SELECT's picker keeps what web standards don't describe. */
const PICKER: CustomPartsMap = { value: ".picker__single-value", open: ".picker__control" };

/** A runtime result that must have succeeded, narrowed to its success shape. */
function ok<R extends { ok: boolean }>(r: R): Extract<R, { ok: true }> {
  if (!r.ok) throw new Error(`expected success, got ${JSON.stringify(r)}`);
  return r as Extract<R, { ok: true }>;
}

/** A runtime result that must have failed, narrowed to its failure shape. */
function failed<R extends { ok: boolean }>(r: R): Extract<R, { ok: false }> {
  if (r.ok) throw new Error(`expected a failure, got ${JSON.stringify(r)}`);
  return r as Extract<R, { ok: false }>;
}

Deno.test("fields: labels, kinds, values and validation", () => {
  assertEquals(
    fieldsOf(APPLICATION).map((f) => [f.label, f.kind, f.required]),
    [
      ["Name", "text", true],
      ["Where are you located?", "select", true],
      ["Autofill from resume", "file", false],
      ["Resume", "file", false],
    ],
  );
  const gh = fieldsOf(CUSTOM_SELECT, { customParts: PICKER });
  assertEquals(gh.map((f) => f.label), ["Will you require sponsorship?", "First Name", "Gender"]);
  assertEquals([gh[0].value, gh[0].required], ["No", true], "the shown value, from the map; hidden twin ignored");
  const bare = fieldsOf(CUSTOM_SELECT)[0];
  assertEquals([bare.value, bare.empty], ["", true], "without a map, the standards find no value");
  assertEquals([gh[1].invalid, gh[1].error], [true, "Too short"]);
  assertEquals(gh[1].required, true, "a trailing * on the label marks it required");
  assertEquals(gh[2].required, false, "no marker, no required attribute");
  assertEquals([gh[2].kind, gh[2].value, gh[2].options], ["radio", "Female", ["Male", "Female"]]);
});

Deno.test("targets: label, question text, role within, regex", () => {
  assertEquals(fieldOf(APPLICATION, { label: "where are you located?" }).kind, "select");
  assertEquals(fieldOf(APPLICATION, { label: "Resume" }).label, "Resume", "the decoy file input is a different field");
  assertEquals(fieldOf(CUSTOM_SELECT, { label: "Will you require sponsorship?" }).kind, "select");
  assertEquals(fieldOf(CUSTOM_SELECT, { label: /gender/i }).kind, "radio");
  assertEquals(fieldOf(CUSTOM_SELECT, { role: "radio", name: "Female" }).label, "Gender");
  assertEquals(fieldOf(CUSTOM_SELECT, "#first_name").label, "First Name");
});

Deno.test("groups: shared-name radios, Yes/No buttons, checkbox groups, single checkbox", () => {
  const html = `
    <div class="entry"><span class="question-title">Years of experience</span>
      <div><input type=radio id=e0 name=answer value="0-2"><label for=e0>0-2</label></div>
      <div><input type=radio id=e1 name=answer value="3-5"><label for=e1>3-5</label></div></div>
    <div class="entry"><span class="question-title">Notice period</span>
      <div><input type=radio id=n0 name=answer value="Now"><label for=n0>Now</label></div>
      <div><input type=radio id=n1 name=answer value="Later"><label for=n1>Later</label></div></div>
    <div class="entry"><span class="question-title">Are you authorized to work in the US?</span>
      <div class="yesno"><button aria-pressed="false">Yes</button><button aria-pressed="true">No</button>
      <input type=checkbox name=auth></div></div>
    <div class="entry"><span class="question-title">How did you hear about us?</span>
      <div><input type=checkbox id=c0 value=LinkedIn><label for=c0>LinkedIn</label></div>
      <div><input type=checkbox id=c1 value=Referral checked><label for=c1>Referral</label></div></div>
    <label><input type=checkbox name=consent value=1> I agree to the privacy policy</label>`;
  assertEquals(fieldsOf(html).map((f) => [f.label, f.kind, f.value]), [
    ["Years of experience", "radio", null],
    ["Notice period", "radio", null],
    ["Are you authorized to work in the US?", "buttons", "No"],
    ["How did you hear about us?", "checkbox", ["Referral"]],
    ["I agree to the privacy policy", "checkbox", false],
  ]);
});

Deno.test("question text never leaks across fields", () => {
  const html = `<form>
    <div class="field"><label for="first">First name *</label><input id="first"></div>
    <div class="field"><label for="email">Email</label><input id="email" type="email"></div>
    <div class="question"><div class="question-title">Where are you located?</div><input name="location"></div>
  </form>`;
  assertEquals(fieldsOf(html).map((f) => f.label), ["First name", "Email", "Where are you located?"]);
  assertEquals(fieldOf(html, { label: "Where are you located?" }).kind, "text", "exactly one match");
});

Deno.test("misses and ambiguity are errors with candidates", () => {
  const miss = assertThrows(() => fieldOf(APPLICATION, { label: "Email" }), FieldError);
  assertEquals(miss.code, "not_found");
  const twice = `<label for=a>Phone</label><input id=a><label for=b>Phone</label><input id=b>`;
  const amb = assertThrows(() => fieldOf(twice, { label: "Phone" }), FieldError);
  assertEquals([amb.code, amb.candidates], ["ambiguous", ["Phone", "Phone"]]);
  const scoped = `<section id=home><label for=a>Phone</label><input id=a></section>
    <section id=work><label for=b>Phone</label><input id=b></section>`;
  assertEquals(fieldOf(scoped, { label: "Phone", within: "#work" }).label, "Phone");
});

Deno.test("targets: verified unique, `within` for repeated labels, stable alternates", () => {
  const html = `
    <label for=email>Email</label><input id=email name=email type=email autocomplete=email>
    <section id=home><label for=p1>Phone</label><input id=p1 name="phone_home" type=tel></section>
    <section id="work"><label for=":r7:">Phone</label><input id=":r7:" type=tel></section>
    <div><label for=f1>Note</label><textarea id=f1></textarea></div>
    <div><label for=f2>Note</label><textarea id=f2></textarea></div>`;
  const f = fieldsOf(html);
  assertEquals(f.map((x) => x.target), [
    { label: "Email" },
    { label: "Phone", within: "#home" },
    { label: "Phone", within: "#work" },
    "#f1", // "Note" repeats with no stable container: a stable id is the target
    "#f2",
  ]);
  assertEquals(f[0].alternates, ["#email", "input[name=email]"], "copy-change-proof alternates, verified unique");
  assertEquals(f[2].alternates, undefined, "a generated counter id (`:r7:`) is never offered");
  for (const x of f) assertEquals(fieldOf(html, x.target!).label, x.label, `${JSON.stringify(x.target)} resolves back`);
  const twins = `<div><label>Note</label><textarea></textarea></div><div><label>Note</label><textarea></textarea></div>`;
  assertEquals(fieldsOf(twins).map((x) => x.target), [undefined, undefined], "nothing unique: no target rather than a wrong one");
});

Deno.test("field facts: multiple, input type, constraints, hint, placeholder", () => {
  const html = `
    <label for=e>Email</label><input id=e type=email maxlength=40 aria-describedby="e-help e-err">
    <span id=e-help>We never share it</span><span id=e-err class=error></span>
    <label for=z>ZIP</label><input id=z pattern="[0-9]{5}" placeholder="12345">
    <label for=s>Skills</label><select id=s multiple><option>Go</option><option>TS</option></select>
    <label for=r>Resume</label><input type=file id=r>`;
  const f = fieldsOf(html);
  assertEquals(f.map((x) => [x.label, x.multiple, x.inputType, x.maxLength, x.pattern, x.hint, x.placeholder]), [
    ["Email", false, "email", 40, undefined, "We never share it", undefined],
    ["ZIP", false, "text", undefined, "[0-9]{5}", undefined, "12345"],
    ["Skills", true, undefined, undefined, undefined, undefined, undefined],
    ["Resume", false, undefined, undefined, undefined, undefined, undefined],
  ]);
});

Deno.test("one visibility rule: CSS and role targets ignore hidden elements, like labels do", () => {
  const html = `<input class=q hidden><input class=q aria-label="Visible one">
    <button hidden>Next</button><button type=button>Next</button>
    <input class=gone style="display:none">`;
  assertEquals(fieldOf(html, ".q").label, "Visible one");
  assertEquals(fieldOf(html, { role: "button", name: "Next" }).kind, "other");
  assertEquals(assertThrows(() => fieldOf(html, ".gone"), FieldError).code, "timeout", "only hidden matches");
});

Deno.test("checkTargets: every target on every saved page", () => {
  const clean = `<label for=a>Email</label><input id=a><label for=b>Phone</label><input id=b>`;
  const variant = `<label for=a>E-mail address</label><input id=a><label for=b>Phone</label><input id=b>`;
  const rows = checkTargets([{ label: "Phone" }, { label: "Email" }, { label: /e-?mail/i }], { clean, variant });
  assertEquals(rows.map((r) => [r.snapshot, r.ok, r.code ?? r.label]), [
    ["clean", true, "Phone"],
    ["clean", true, "Email"],
    ["clean", true, "Email"],
    ["variant", true, "Phone"],
    ["variant", false, "not_found"], // the copy changed: caught before a live run
    ["variant", true, "E-mail address"], // a RegExp survives it
  ]);
});

// The page runtime itself, for the parts testing.ts does not expose.
function runtimeFor(html: string) {
  return runtimeOn(new DOMParser().parseFromString(html, "text/html")!);
}

/** The page runtime on a document the test keeps, to change the page between calls. */
function runtimeOn(document: Document) {
  const page = {
    document,
    getComputedStyle: () => ({ display: "block", visibility: "visible", opacity: "1" }),
    requestAnimationFrame: (cb: (t: number) => void) => setTimeout(() => cb(0), 0),
    setTimeout: (cb: () => void, ms?: number) => setTimeout(cb, ms),
  } as unknown as Page;
  return createFormsRuntime(page);
}

/** The ref of the field a label names, for the runtime calls that take one. */
function refFor(rt: FormsRuntime, label: string): string {
  return ok(rt.resolve({ label: { text: label } })).field.ref.ref;
}

Deno.test("listings withhold secrets: passwords, card numbers, one-time codes", () => {
  const html = `<label for=u>Username</label><input id=u value="ada">
    <label for=p>Password</label><input id=p type=password value="hunter2">
    <label for=c>Card number</label><input id=c autocomplete="cc-number" value="4111111111111111">
    <label for=o>Code</label><input id=o autocomplete="one-time-code" value="123456">`;
  assertEquals(fieldsOf(html).map((f) => [f.label, f.value, f.sensitive]), [
    ["Username", "ada", undefined],
    ["Password", null, true],
    ["Card number", null, true],
    ["Code", null, true],
  ]);
});

Deno.test("names follow the W3C rules: headings, alt text, content before tooltip", () => {
  const html = `<h2>Contact details</h2>
    <a href="/x"><img src=x.png alt="Settings"></a>
    <button title="Opens the form">Apply now</button>
    <button><svg><title>Close</title></svg></button>`;
  assertEquals(fieldOf(html, { role: "heading", name: "Contact details" }).kind, "other");
  assertEquals(fieldOf(html, { role: "link", name: "Settings" }).kind, "other");
  assertEquals(fieldOf(html, { role: "button", name: "Apply now" }).kind, "other");
  assertEquals(fieldOf(html, { role: "button", name: "Close" }).kind, "other");
});

Deno.test("label markers: a trailing *, : or (optional) is not part of the label", () => {
  const html = `<label for=a>Phone:</label><input id=a><label for=b>Company (optional)</label><input id=b>`;
  assertEquals(fieldsOf(html).map((f) => f.label), ["Phone", "Company"]);
  assertEquals(fieldOf(html, { label: "Company" }).label, "Company");
  assertEquals(fieldOf(`<label for=c>Email: *</label><input id=c>`, { label: "email" }).label, "Email");
});

Deno.test("options: exact, prefix and substring all ignore case and accents", () => {
  const rt = runtimeFor(`<fieldset><legend>City</legend>
    <label><input type=radio name=c> Lisbon</label><label><input type=radio name=c> São Paulo</label>
    <label><input type=radio name=c> Porto Alegre</label><label><input type=radio name=c> Ilha de São Jorge</label></fieldset>`);
  const ref = refFor(rt, "City");
  assertEquals(ok(rt.memberIndex(ref, "LISBON")).index, 0, "exact");
  assertEquals(ok(rt.memberIndex(ref, "sao")).index, 1, "prefix, before the substring match in Ilha de São Jorge");
  assertEquals(ok(rt.memberIndex(ref, "alegre")).index, 2, "substring");
  assertEquals(failed(rt.memberIndex(ref, "o")).code, "ambiguous");
});

Deno.test("options: an earlier level wins; ties and misses name the options", () => {
  const rt = runtimeFor(`<fieldset><legend>Country</legend>
    <label><input type=radio name=c> Portugal</label><label><input type=radio name=c> Portugal (Azores)</label>
    <label><input type=radio name=c> Spain</label><label><input type=radio name=c> Spain</label></fieldset>`);
  const ref = refFor(rt, "Country");
  assertEquals(ok(rt.memberIndex(ref, "portugal")).index, 0, "an exact match beats a prefix match");
  const tie = failed(rt.memberIndex(ref, "Spain"));
  assertEquals([tie.code, tie.candidates], ["ambiguous", ["Spain", "Spain"]]);
  const miss = failed(rt.memberIndex(ref, "France"));
  assertEquals([miss.code, miss.options], ["no_option", ["Portugal", "Portugal (Azores)", "Spain", "Spain"]]);
});

Deno.test("label targets ignore case, accents, spacing and full-width forms", () => {
  const html = `<label for=a>  First
      name </label><input id=a><label for=b>Prénom</label><input id=b><label for=c>Ｅｍａｉｌ</label><input id=c>`;
  assertEquals(fieldOf(html, { label: "first name" }).label, "First name");
  assertEquals(fieldOf(html, { label: "PRENOM" }).label, "Prénom");
  assertEquals(fieldOf(html, { label: "email" }).label, "Ｅｍａｉｌ");
});

Deno.test("a disabled or read-only field is not_editable; only disabled is worth waiting for", () => {
  const rt = runtimeFor(`
    <label for=a>Plan</label><select id=a disabled><option>Free</option></select>
    <fieldset disabled><label for=b>Seats</label><select id=b><option>1</option></select></fieldset>
    <label for=c>Region</label><select id=c aria-disabled=true><option>EU</option></select>
    <label for=d>Currency</label><select id=d aria-readonly=true><option>EUR</option></select>`);
  for (const label of ["Plan", "Seats", "Region"]) {
    const r = failed(rt.selectNative(refFor(rt, label), ["x"]));
    assertEquals([r.code, r.wait], ["not_editable", true], label);
  }
  const r = failed(rt.selectNative(refFor(rt, "Currency"), ["EUR"]));
  assertEquals([r.code, r.wait], ["not_editable", undefined]);
});

Deno.test("comboState: open, searchable, and only the options a person can pick", () => {
  const rt = runtimeFor(`
    <label for=a>Country</label><input id=a role=combobox aria-expanded=true aria-controls=lb>
    <ul id=lb role=listbox><li role=option>Portugal</li><li role=option aria-disabled=true>Spain</li>
      <li role=option hidden>France</li></ul>
    <label for=b>Size</label><input id=b role=combobox inputmode=none aria-expanded=false>
    <span id=t>Color</span><div role=combobox aria-labelledby=t aria-expanded=false></div>`);
  assertEquals(ok(rt.comboState(refFor(rt, "Country"))), {
    ok: true,
    value: "",
    expanded: true,
    searchable: true,
    options: ["Portugal"],
  });
  const size = ok(rt.comboState(refFor(rt, "Size")));
  assertEquals([size.expanded, size.searchable], [false, false], "inputmode=none is not typed into");
  assertEquals(ok(rt.comboState(refFor(rt, "Color"))).searchable, false, "not an input");
});

Deno.test("members: button and checkbox groups report labels and state", () => {
  const rt = runtimeFor(`
    <div><span class="question-title">Are you authorized to work in the US?</span>
      <div><button aria-pressed="false" aria-label="Answer yes">Yes</button><button aria-pressed="true">No</button></div></div>
    <div><span class="question-title">How did you hear about us?</span>
      <div><input type=checkbox id=c0><label for=c0>LinkedIn</label></div>
      <div><input type=checkbox id=c1 checked><label for=c1>Referral</label></div></div>`);
  const auth = refFor(rt, "Are you authorized to work in the US?");
  assertEquals(ok(rt.members(auth)).members, [{ label: "Yes", on: false }, { label: "No", on: true }]);
  assertEquals(ok(rt.memberIndex(auth, "yes")).index, 0);
  const heard = refFor(rt, "How did you hear about us?");
  assertEquals(ok(rt.members(heard)).members, [{ label: "LinkedIn", on: false }, { label: "Referral", on: true }]);
  assertEquals(ok(rt.memberIndex(heard, "referral")).index, 1);
});

Deno.test("a ref goes stale when its field is removed or relabelled", () => {
  const html = `<div id=wrap><label id=l for=a>Email</label><input id=a></div><label for=b>Phone</label><input id=b>`;
  const document = new DOMParser().parseFromString(html, "text/html")!;
  const rt = runtimeOn(document);
  const email = refFor(rt, "Email");
  const phone = refFor(rt, "Phone");
  assertEquals(ok(rt.read(email)).value, "");
  document.getElementById("l")!.textContent = "Work email";
  assertMatch(failed(rt.read(email)).message, /changed since fields\(\)/);
  document.getElementById("b")!.remove();
  const gone = failed(rt.read(phone));
  assertEquals(gone.code, "stale_ref");
  assertMatch(gone.message, /no longer in the page/);
  assertEquals(failed(rt.read("999:text|Email")).code, "stale_ref", "a ref this page never issued");
});

Deno.test("text targets: innermost visible match, a label's text means its field", () => {
  const html = `<div class=banner><div class="btn">Accept all</div><span hidden>Accept all</span></div>
    <label for=e>Email</label><input id=e>
    <p>Read the terms</p><p>Read the terms</p>`;
  assertEquals(fieldOf(html, { text: "Accept all" }).kind, "other", "the inner div, not the banner");
  assertEquals(fieldOf(html, { text: "email" }).kind, "text", "label text → its field");
  assertEquals(assertThrows(() => fieldOf(html, { text: "Read the terms" }), FieldError).code, "ambiguous");
  assertEquals(assertThrows(() => fieldOf(html, { text: /^decline/i }), FieldError).code, "not_found");
});

Deno.test("clickables: buttons and form links with verified targets, page links left out", () => {
  const html = `<nav><a href="/">Home</a></nav>
    <form><label for=e>Email</label><input id=e>
      <a href="/terms">Terms</a>
      <button type=button>Next</button><button type=button id=save>Save</button>
      <div><button type=button>Remove</button></div><div><button type=button>Remove</button></div>
    </form>`;
  const r = ok(runtimeFor(html).clickables());
  assertEquals(r.clickables.map((c: { role: string; name: string; target?: unknown }) => [c.role, c.name, c.target]), [
    ["link", "Terms", { role: "link", name: "Terms" }],
    ["button", "Next", { role: "button", name: "Next" }],
    ["button", "Save", { role: "button", name: "Save" }],
    ["button", "Remove", undefined], // twice, with nothing stable around either: no target rather than a wrong one
    ["button", "Remove", undefined],
  ]);
  assertEquals(ok(runtimeFor(html).clickables({ all: true })).total, 6, "--all adds the nav link");
});

Deno.test("probe (for waitFor): visible, hidden, absent; several visible matches count as visible", () => {
  const rt = runtimeFor(`<p class=r>one</p><p class=r>two</p><div id=spin hidden>Saving</div>`);
  assertEquals(rt.probe({ css: ".r" }).state, "visible");
  assertEquals(rt.probe({ css: "#spin" }).state, "hidden");
  assertEquals(rt.probe({ css: "#nope" }).state, "absent");
});

Deno.test("empty, and secrets flagged everywhere but withheld only from listings", () => {
  const html = `<label for=a>Name</label><input id=a value="Ada"><label for=b>City</label><input id=b>
    <label for=p>Password</label><input id=p type=password value="hunter2">`;
  assertEquals(fieldsOf(html).map((f) => [f.label, f.empty]), [["Name", false], ["City", true], ["Password", false]]);
  const pw = fieldOf(html, { label: "Password" });
  assertEquals([pw.sensitive, pw.value], [true, "hunter2"], "resolve keeps the value (fill reads it back) but flags it");
});

Deno.test("text and attr read an element without page code", () => {
  const rt = runtimeFor(`<div role=status>  Application
    received:   <b>A-1042</b> </div><a href="/receipt.pdf">Download receipt</a>`);
  assertEquals(ok(rt.textOf({ role: "status" })).text, "Application received: A-1042");
  assertEquals(ok(rt.attrOf({ role: "link", name: { text: "Download receipt" } }, "href")).value, "/receipt.pdf");
  assertEquals(failed(rt.textOf({ text: { text: "Nope" } })).code, "not_found");
});
