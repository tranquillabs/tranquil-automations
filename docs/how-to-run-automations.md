# How to Run Automations

## Quick Start

1. Open a browser tab in Tranquil (any URL)
2. Open a `.js` automation file in the editor
3. Press `Cmd+Shift+R`

The script runs immediately. The `tranquil` namespace gives you full control over browser tabs, files, and the Tranquil editor.

### Run Only a Selection

If you **highlight** part of the file, `Cmd+Shift+R` runs just the selected text; with no selection, it runs the whole file. This is handy for a file with several independent blocks — select one block and run it on its own, like a REPL, without other blocks colliding (e.g. two blocks that each declare `const bg`).

---

## How Scripts Work

Scripts run in **Node/Atom context** — the same process as Tranquil itself. The runner injects a `tranquil` namespace, `require`, `atom`, `__dirname`, and `__filename`.

To interact with a browser tab, use `tranquil.getActiveTab()` which returns a real [Puppeteer Page](https://pptr.dev/api/puppeteer.page):

```js
const tab = await tranquil.getActiveTab();
const title = await tab.evaluate(() => document.title);
tranquil.notify(title);
```

`tab.evaluate()` runs its function in the browser context — DOM access, `document`, `window`, etc. Everything outside `evaluate()` runs in Node.

---

## Writing to Files

Scripts have full Node.js file access. `tranquil.writeFile` writes relative to the script's own directory:

```js
const tab = await tranquil.getActiveTab();
const content = await tab.evaluate(() => document.body.innerText);
await tranquil.openFile(tranquil.writeFile('output.txt', content));
```

---

## Background Pages

`tranquil.openBackgroundTab(url)` loads a page in an off-screen webview with no visible UI tab — useful for auth flows or scraping data without cluttering the editor. It returns a real Puppeteer Page; close it with `tranquil.closeTab(bg)` when done.

**Scrape an HTML page** — read the DOM with `evaluate`:

```js
const bg = await tranquil.openBackgroundTab('https://example.com');
const heading = await bg.evaluate(() => document.querySelector('h1')?.textContent);
await tranquil.closeTab(bg);
tranquil.notify(`Heading: ${heading}`);
```

**Fetch a JSON endpoint** — parse the response body:

```js
const bg = await tranquil.openBackgroundTab('https://jsonplaceholder.typicode.com/todos');
const data = await bg.evaluate(() => JSON.parse(document.body.innerText));
await tranquil.closeTab(bg);
tranquil.notify(`Fetched ${data.length} items`);
```

> A page returns HTML or JSON depending on the URL — use `JSON.parse(document.body.innerText)` only for endpoints that actually return JSON, and DOM queries for normal web pages.

---

## Multiple Tabs

```js
const tabs = await tranquil.getTabs();
for (const tab of tabs) {
  const title = await tab.evaluate(() => document.title);
  tranquil.notify(title);
}
```

Open a new tab and interact with it:

```js
const tab = await tranquil.openTab('https://example.com');
await tab.waitForSelector('h1');
await tab.click('h1');
```

---

## Registering Scripts to the Command Palette

Any `.js` file can be registered as a named command under the `Automations:` namespace:

1. Open the file in the editor
2. Open the command palette and run **Automations: Register Current File**
3. The command `Automations: Page Info` (derived from the filename) appears in the palette

Run **Automations: Unregister Current File** to remove it. Registered scripts persist across restarts.

---

## Tips

### Switching Between Editor and Browser

The runner remembers the last browser tab you visited. Switch to your `.js` file, edit it, press `Cmd+Shift+R` — it targets the browser tab you last viewed.

### Errors

If a script throws, a notification appears with the error message.

### Debugging

- `console.log` in the script body → Tranquil's renderer DevTools (`View → Toggle Developer Tools`)
- `console.log` inside `tab.evaluate()` → the webview's DevTools (`Cmd+Alt+I` while a browser tab is focused)

---

## Example Scripts

| File | What it does |
|---|---|
| `examples/page-info.js` | Extracts page title, link/image/heading counts, writes to `page-info.txt` |
| `examples/highlight-links.js` | Outlines all external links in orange |

See [tranquil-api.md](tranquil-api.md) for the full `tranquil` namespace reference.
