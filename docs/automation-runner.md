# Automation Runner Architecture

## Overview

Scripts run in **Node/Atom context** (the Tranquil renderer process) via an `AsyncFunction`. The runner injects a `tranquil` namespace, `require`, `atom`, `__dirname`, and `__filename` as parameters.

Browser tab access uses [Puppeteer](https://pptr.dev) connecting to Tranquil's Chromium instance over the DevTools Protocol on port 9222. Each tab returned by `tranquil.getActiveTab()` / `getTabs()` / `openTab()` is a real Puppeteer `Page` with the full API.

---

## How It Works

```text
Script file (.js)
      ↓
  runScript(content, scriptPath)
      ↓
  getBrowser() → puppeteer.connect('ws://localhost:9222')
      ↓
  Build tranquil namespace (tab management, files, notifications, clipboard, exec, config)
      ↓
  AsyncFunction('tranquil', 'require', 'atom', '__dirname', '__filename', content)
      ↓
  Script runs — calls tranquil.getActiveTab() etc.
      ↓
  Puppeteer targets filtered by /^https?:/ URL pattern
      ↓
  Returns real Puppeteer Page → script uses full Page API
```

Puppeteer connects lazily on first script run and stays connected until Tranquil quits. On disconnect (e.g. if port 9222 drops), the next run reconnects automatically.

---

## Entry Points

Two ways to trigger a script — both call `runScript(content, scriptPath)`:

| Trigger | Source | Method |
|---|---|---|
| `Cmd+Shift+R` | Active text editor | `runInWebview()` → `runScript` |
| Command palette | Registered file path on disk | `runFile(filePath)` → `runScript` |

---

## Command Palette Registration

Scripts can be registered as named palette commands under the `Automations:` namespace via **Automations: Register Current File**. Registered scripts are persisted in `atom.config` under `tranquil-automations.registeredAutomations` and re-registered on every activation.

Registration derives the display name from the filename: `page-info.js` → `Automations: Page Info`.

---

## Target Discovery

Puppeteer's `browser.targets()` sees all Chromium render processes — including Tranquil's own UI windows. Webview targets (browser tabs) are identified by URL pattern `/^https?:/`, which excludes `file://`, `about:blank`, and `devtools://` targets used by Tranquil internals.

`getActiveTab()` matches the URL of `_lastWebView` (tracked via `observeActivePaneItem`) against Puppeteer targets.

---

## Port 9222

Enabled in `tranquil-client/src/main-process/start.js`:

```js
app.commandLine.appendSwitch('remote-debugging-port', '9222');
```

This starts a WebSocket server on `localhost:9222` that speaks the Chrome DevTools Protocol. Puppeteer connects via `browserURL: 'http://localhost:9222'` — it fetches `/json/version` internally to resolve the actual WebSocket endpoint. Any process on localhost can also connect — this is acceptable for a local dev tool.

Verify it's working: visit `http://localhost:9222/json` while Tranquil is running.

---

## Auto-Injection (Separate Mechanism)

The existing URL-pattern auto-injection (`observeActivePaneItem` + `did-stop-loading`) is a separate, independent mechanism. It injects scripts directly via `webView.executeJavaScript()` without Puppeteer and is unaffected by anything above. It runs regardless of whether a script is actively being executed by the runner.

---

## Future Ideas

### Browser-Context

- Page snapshot → outline of all headings, copied to clipboard
- Highlight keywords → mark all occurrences of a word
- Copy table as CSV → find `<table>`, serialize rows, copy to clipboard
- Strip formatting → remove inline styles and class attributes
- Extract all links → deduplicate hrefs, write to file
- Remove distractions → hide cookie banners, sticky headers

### Multi-Step (Puppeteer)

- Auto-fill recurring form → navigate, fill known fields, submit
- Paginated scraper → extract rows, click "next", repeat, save CSV
- Price checker → go to product URL, compare to stored threshold, notify on change
- Deploy gate → poll CI dashboard, wait for green, notify
- Cross-tab copy → extract from one tab, paste into another
- Login + navigate → authenticate, land on target page, hand off to extraction script
