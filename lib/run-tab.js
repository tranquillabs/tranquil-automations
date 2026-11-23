// Which browser tab a run's `tabs.active()` acts on, decided once, when the run starts: the
// browser tab with focus, else the one browser tab showing a web page in a pane. No guess from
// history: with no web page showing, or more than one, the run's `tabs.active()` fails and says
// how to name the page instead. Pure (the browser bits are passed in), so the tests load it
// directly; lib/run-manager.js gathers the workspace and keeps the answer by run id.
//
// The module's shape is RunTabModule in types/run-tab.ts.
/** @typedef {import("../types/run-tab.ts").RunStartView} RunStartView */
/** @typedef {import("../types/run-tab.ts").RunTabHelpers} RunTabHelpers */
/** @typedef {import("../types/run-tab.ts").RunTab} RunTab */
/** @typedef {import("../types/browser-pages.ts").Webview} Webview */

const ELSE =
  "Show the page beside the script (split the pane) or click into it, then run again, or have " +
  "the script name its page with tabs.find(url) or tabs.open(url).";

/**
 * @param {RunStartView} view
 * @param {RunTabHelpers} helpers
 * @returns {RunTab}
 */
function pickRunTab({ focusedItem, shownItems }, { webviewOf, isWebURL }) {
  /**
   * The item's webview, if it is a browser tab on a web page.
   * @param {unknown} item
   * @returns {Webview | null}
   */
  const onWebPage = (item) => {
    const webview = webviewOf(item);
    if (!webview || !webview.isConnected) return null;
    try {
      return isWebURL(webview.getURL()) ? webview : null;
    } catch {
      return null; // getURL throws until the page is attached and ready
    }
  };

  const focused = onWebPage(focusedItem);
  if (focused) return { ok: true, webview: focused };

  /** @type {Webview[]} */
  const shown = [];
  for (const item of new Set(shownItems)) {
    const webview = onWebPage(item);
    if (webview) shown.push(webview);
  }
  if (shown.length === 1) return { ok: true, webview: shown[0] };
  return {
    ok: false,
    message:
      shown.length === 0
        ? `tabs.active(): no web page was showing when the run started. ${ELSE}`
        : `tabs.active(): ${shown.length} web pages were showing when the run started, so it isn't clear which one. ${ELSE}`,
  };
}

module.exports = { pickRunTab };
