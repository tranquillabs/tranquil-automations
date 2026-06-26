# Tranquil API

`tranquil` is a namespace injected by the automation runner into every script. It bridges your script (running in Node/Atom context) to browser tabs via Puppeteer, and provides Tranquil-specific helpers for files, notifications, clipboard, and config.

Scripts also receive `require`, `atom`, `__dirname`, and `__filename` as injected globals for cases where direct Node or Atom access is needed.

---

## Tabs

Each tab method returns a real [Puppeteer `Page`](https://pptr.dev/api/puppeteer.page) — giving you the full `click()`, `evaluate()`, `waitForSelector()`, `type()`, `screenshot()`, `goto()`, and more.

### `tranquil.getActiveTab()` → `Promise<Page>`

Returns a Puppeteer Page for the most recently active browser tab in Tranquil. Throws if no browser tab has been visited.

```js
const tab = await tranquil.getActiveTab();
const title = await tab.evaluate(() => document.title);
```

### `tranquil.getTab(urlOrPattern)` → `Promise<Page>`

Finds an open tab by exact URL string or RegExp. Waits up to 5 seconds.

```js
const tab = await tranquil.getTab('https://github.com/pulls');
const tab = await tranquil.getTab(/github\.com\/pulls/);
```

### `tranquil.getTabs()` → `Promise<Page[]>`

Returns Puppeteer Pages for all open browser tabs (http/https only — excludes Tranquil's own UI).

```js
const tabs = await tranquil.getTabs();
tranquil.notify(`${tabs.length} tabs open`);
```

### `tranquil.openTab(url)` → `Promise<Page>`

Opens a new visible browser tab in Tranquil's UI and returns its Puppeteer Page once loaded. Waits up to 10 seconds.

```js
const tab = await tranquil.openTab('https://example.com');
await tab.waitForSelector('h1');
```

### `tranquil.openBackgroundTab(url)` → `Promise<Page>`

Loads a page in an off-screen webview with no visible UI tab — useful for auth flows, scraping, or fetching data before presenting it in a visible tab. Returns a real Puppeteer Page. Always close it with `tranquil.closeTab(bg)` when done so the hidden webview is destroyed.

```js
const bg = await tranquil.openBackgroundTab('https://api.example.com/data');
const data = await bg.evaluate(() => JSON.parse(document.body.innerText));
await tranquil.closeTab(bg);
```

### `tranquil.closeTab(page)` → `Promise<void>`

Closes a Puppeteer Page. For a visible tab it destroys the Tranquil UI tab; for a background tab it removes the off-screen webview.

```js
await tranquil.closeTab(tab);
```

---

## Files

All paths are relative to `__dirname` — the directory containing the running script.

### `tranquil.writeFile(filename, content)` → `string`

Writes `content` to `filename` (relative to `__dirname`). Returns the absolute path.

```js
const outputPath = tranquil.writeFile('results.txt', data);
```

### `tranquil.readFile(filename)` → `string`

Reads a file relative to `__dirname`. Returns its contents as a UTF-8 string.

```js
const config = JSON.parse(tranquil.readFile('config.json'));
```

### `tranquil.openFile(filePath, options?)` → `Promise<TextEditor>`

Opens a file in Tranquil's editor. Often combined with `writeFile`:

```js
await tranquil.openFile(tranquil.writeFile('output.txt', content));
```

The optional `options` object is passed straight to `atom.workspace.open`. The most useful key is `split: 'left' | 'right' | 'up' | 'down'`, which opens the file in a split pane instead of the active one — handy for keeping your script visible while showing its output beside it. Any other `workspace.open` option (`activatePane`, `pending`, etc.) also works.

```js
const out = tranquil.writeFile('page-info.txt', stats);
await tranquil.openFile(out, { split: 'down' });
```

If the file is already open, `openFile` reloads its content from disk in place and reveals it — it never closes/reopens the tab. The `split` option therefore applies on the first open (the file lands in the split) and the same tab refreshes on later runs.

---

## Notifications

### `tranquil.notify(message, level?)` → `void`

Shows a notification. `level` defaults to `'info'`. Valid levels: `'info'`, `'success'`, `'warning'`, `'error'`.

```js
tranquil.notify('Done!', 'success');
tranquil.notify('Something went wrong', 'error');
```

---

## Clipboard

This is Atom's clipboard — distinct from the browser clipboard available inside `tab.evaluate()`.

### `tranquil.clipboard.write(text)` → `void`

```js
tranquil.clipboard.write('text to copy');
```

### `tranquil.clipboard.read()` → `string`

```js
const text = tranquil.clipboard.read();
```

---

## Project

### `tranquil.getProjectDir()` → `string`

Returns the absolute path of the first open project root, or `''` if none is open.

```js
const outputPath = path.join(tranquil.getProjectDir(), 'reports', 'output.txt');
```

---

## Shell

### `tranquil.exec(command)` → `Promise<string>`

Runs a shell command with `cwd` set to `__dirname`. Resolves with trimmed stdout. Rejects on non-zero exit with the error object extended with a `stderr` property.

```js
const branch = await tranquil.exec('git branch --show-current');
tranquil.notify(`Current branch: ${branch}`);
```

---

## Config

Backed by Tranquil's persistent config store (`atom.config`). Values survive across script runs and app restarts. Use dot-namespaced keys and prefix with your script name to avoid collisions.

### `tranquil.config.get(key)` → `any`

```js
const lastPrice = tranquil.config.get('price-checker.lastPrice');
```

### `tranquil.config.set(key, value)` → `void`

```js
tranquil.config.set('price-checker.lastPrice', currentPrice);
```

---

## Auto-Inject

Register the current script to run automatically whenever a matching URL finishes loading — the same trigger as a manual `Cmd+Shift+R`, but fired by the page load event.

### `tranquil.autoInject.register(urlPattern)` → `void`

Registers the current script file for auto-injection on URLs matching `urlPattern` (string or RegExp). Persists across restarts.

```js
tranquil.autoInject.register(/github\.com\/.*\/pull\//);
tranquil.autoInject.register('example.com');
```

Run this once manually. After registration, the script fires automatically on every matching page load.

### `tranquil.autoInject.unregister()` → `void`

Removes the current script from auto-injection.

```js
tranquil.autoInject.unregister();
```
