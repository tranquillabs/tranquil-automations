<div align="center">

<img src="resources/banner.svg" alt="Tranquil Automations" width="720">

# Tranquil Automations

**Write plain JavaScript and run it against live browser tabs — the automation layer of [Tranquil Studio](https://github.com/tranquillabs/tranquil-client).**

</div>

---

> Part of the Tranquil toolkit, in early developer preview — see the [main repo](https://github.com/tranquillabs/tranquil-client) for status.

## What it is

`tranquil-automations` scripts live web apps from inside Tranquil Studio. Write a `.js` file and run
it against the active browser tab with **⌘⇧R** (whole file or a selection, REPL-style), or register
any `.js` as a named palette command. Scripts get a `tranquil` namespace with Puppeteer-backed page
control, background/off-screen pages, file I/O, and notifications. It also powers several tree-view
and tab UI enhancements.

## Features

- **Run JS against a live tab** — ⌘⇧R runs the whole file or the current selection.
- **`tranquil` namespace** — Puppeteer page control, background pages, file I/O, desktop notifications.
- **Named commands** — register any `.js` as an "Automations:" palette command.
- **Workspace UI** — vertical tab-list dock panel, tree-view row actions, folder-count pills, pane controls.

## Install

Bundled with Tranquil Studio. To run from source, follow the
[Local Dev Setup runbook](https://tranquillabs.dev/docs/v0.1.0/development/local-dev-setup).

## License

[MIT](LICENSE.md) © Tranquil Labs.
