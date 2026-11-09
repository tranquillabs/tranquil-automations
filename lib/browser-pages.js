// tranquil-browser's lib/pages.js: what every browser page is held to (its settings, the session a
// window's pages share, which addresses are web pages). Loaded through the app: tranquil-client
// depends on tranquil-browser, so the runner and the pane controls read the same file as the main
// process, without this package depending on tranquil-browser itself, which would bring in all of
// that package's dependencies. pages.js needs only Node's own modules.
//
// Through Node's createRequire, anchored at the app's package.json, not require.resolve with
// `paths`: the require Pulsar hands package code (src/native-compile-cache.js) has a resolve that
// ignores its options, so `paths` would be dropped and the lookup would start from this package.
const { createRequire } = require("module");
const path = require("path");

/** @typedef {import("../types/browser-pages.ts").Webview} Webview */
/** @typedef {import("../types/browser-pages.ts").BrowserItem} BrowserItem */

const appRequire = createRequire(path.join(atom.getLoadSettings().resourcePath, "package.json"));
const pages = appRequire("tranquil-browser/lib/pages.js");
// The browser's IPC channel names (tranquil-browser lib/ipc.js), loaded the same way.
const { CHANNELS } = appRequire("tranquil-browser/lib/ipc.js");

/**
 * The <webview> of a browser tab's pane item, or null for any other item.
 * @param {unknown} item
 * @returns {Webview | null}
 */
function webviewOf(item) {
  const view = item ? /** @type {BrowserItem} */ (item).view : undefined;
  return (view && view.htmlv && view.htmlv[0]) || null;
}

/**
 * This window's session partition, which its browser tabs and scripts' background tabs share. The
 * id is one Tranquil adds to Pulsar's load settings (tranquil-client atom-window.js), so Atom's
 * published types don't list it.
 * @returns {string | null}
 */
function windowPartition() {
  const settings = /** @type {import("atom").WindowLoadSettings & { windowSessionId?: string }} */ (
    atom.getLoadSettings()
  );
  return pages.windowPartition(settings.windowSessionId);
}

// Named here, as the editor can't follow appRequire to pages.js, and only what this package uses.
module.exports = {
  /** @type {{ clearSiteCookies: string }} The browser's IPC channel names this package sends on. */
  CHANNELS: { clearSiteCookies: CHANNELS.clearSiteCookies },
  /** @type {(url: unknown) => boolean} Whether an address is a web page's: http or https. */
  isWebURL: pages.isWebURL,
  webviewOf,
  windowPartition,
};
