// Which browser tab a run's tabs.active() acts on (lib/run-tab.js): the focused web page, else the
// one web page showing; never a guess when there is none or several.
import { assert, assertEquals, assertStringIncludes } from "jsr:@std/assert@^1";
import type { Webview } from "tranquil-automations/types/browser-pages.ts";
import type { RunTab, RunTabHelpers, RunTabModule } from "tranquil-automations/types/run-tab.ts";

const mod = { exports: {} as RunTabModule };
new Function(
  "module",
  "exports",
  Deno.readTextFileSync(new URL(import.meta.resolve("tranquil-automations/lib/run-tab.js"))),
)(mod, mod.exports);
const { pickRunTab } = mod.exports;

/** A pane item: a browser tab on `url` (attached unless said otherwise), or an editor with none. */
interface Item {
  url?: string;
  attached?: boolean;
  ready?: boolean;
}
const tab = (url: string, more: Partial<Item> = {}): Item => ({ url, attached: true, ready: true, ...more });
const editor: Item = {};

// Only the parts of a webview the picker reads; the casts stand in for the real element.
const webviews = new Map<Item, Webview>();
const helpers: RunTabHelpers = {
  webviewOf(item) {
    const it = item as Item;
    if (it.url === undefined) return null;
    if (!webviews.has(it)) {
      webviews.set(it, {
        isConnected: it.attached !== false,
        getURL: () => {
          if (it.ready === false) throw new Error("not attached yet");
          return it.url ?? "";
        },
      } as unknown as Webview);
    }
    return webviews.get(it) ?? null;
  },
  isWebURL: (url) => typeof url === "string" && /^https?:/i.test(url),
};

const pick = (focusedItem: Item, shownItems: Item[]): RunTab => pickRunTab({ focusedItem, shownItems }, helpers);
const chose = (result: RunTab, item: Item) => assert(result.ok && result.webview === helpers.webviewOf(item));

Deno.test("the focused web page wins, whatever else is showing", () => {
  const a = tab("https://a.example/"), b = tab("https://b.example/");
  chose(pick(b, [a, b]), b);
});

Deno.test("from an editor, the one web page showing in a pane", () => {
  const a = tab("https://a.example/");
  chose(pick(editor, [editor, a]), a);
});

Deno.test("the focused tab also showing counts once", () => {
  const a = tab("https://a.example/");
  chose(pick(editor, [a, a]), a);
});

Deno.test("no web page showing fails, saying how to name the page", () => {
  const result = pick(editor, [editor]);
  assert(!result.ok);
  assertStringIncludes(result.message, "no web page was showing");
  assertStringIncludes(result.message, "tabs.find(url)");
});

Deno.test("two web pages showing fails rather than guessing", () => {
  const result = pick(editor, [tab("https://a.example/"), tab("https://b.example/")]);
  assert(!result.ok);
  assertStringIncludes(result.message, "2 web pages were showing");
});

Deno.test("the start page, a closed tab and a page not yet ready don't count", () => {
  const start = tab("file:///app/resources/home.html");
  const closed = tab("https://gone.example/", { attached: false });
  const loading = tab("https://later.example/", { ready: false });
  const page = tab("https://a.example/");
  chose(pick(start, [start, closed, loading, page]), page);
  assertEquals(pick(start, [start, closed, loading]).ok, false);
});
