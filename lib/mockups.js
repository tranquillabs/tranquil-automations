"use babel";
const { Disposable } = require("atom");
const path = require("path");
const paneControls = require("./pane-controls.js");

// Business-theme reference mockups (see docs/tranquil/business-theme-and-mockups.md).
// Static HTML in ../mockups, opened through the tranquil-browser file opener:
//   main-view.html → center, properties.html → right dock.

const MOCKUPS_DIR = path.resolve(__dirname, "../mockups");

function fileUrl(name) {
  // The tranquil-browser opener matches the `file:` scheme; forward slashes so
  // the URL is well-formed on every platform.
  return "file://" + path.join(MOCKUPS_DIR, name).replace(/\\/g, "/");
}

function isMockupUrl(url) {
  return typeof url === "string" && url.startsWith(fileUrl(""));
}

// True if a browser item with this URL is already open (guards against
// double-open on window reload, where Atom deserializes the mockups before
// packages activate). Keyed on getURL so it only matches tranquil-browser
// items, never an unrelated text editor for the same path.
function isOpen(url) {
  return atom.workspace
    .getPaneItems()
    .some((item) => item?.getURL?.() === url);
}

// ---- Theme sync -----------------------------------------------------------
// The mockups are webviews with their own document, so they can't see the app's
// theme. We drive them explicitly: set <html data-theme="light|dark"> to match
// the active UI theme and flip it live when the theme changes.

function themeMode() {
  try {
    const ui = atom.themes
      .getActiveThemes()
      .find((p) => p.metadata && p.metadata.theme === "ui");
    return ui && /dark/i.test(ui.name) ? "dark" : "light";
  } catch (e) {
    return "light";
  }
}

function mockupItems() {
  return atom.workspace
    .getPaneItems()
    .filter((item) => isMockupUrl(item?.getURL?.()));
}

function webviewFor(item) {
  return item && item.view && item.view.htmlv && item.view.htmlv[0];
}

function setWebviewTheme(webview, mode) {
  try {
    webview.executeJavaScript(
      "document.documentElement.setAttribute('data-theme'," +
        JSON.stringify(mode) +
        ")"
    );
  } catch (e) {
    // Webview not dom-ready yet — did-stop-loading below will re-apply.
  }
}

// Apply the current theme to a mockup item now and on every (re)load. The
// webview may not be built the instant open() resolves, so retry briefly.
function trackItemTheme(item, subscriptions) {
  let tries = 0;
  const attach = () => {
    const webview = webviewFor(item);
    if (!webview) {
      if (tries++ < 40) setTimeout(attach, 50);
      return;
    }
    setWebviewTheme(webview, themeMode());
    const onLoad = () => setWebviewTheme(webview, themeMode());
    webview.addEventListener("did-stop-loading", onLoad);
    if (subscriptions) {
      subscriptions.add(
        new Disposable(() =>
          webview.removeEventListener("did-stop-loading", onLoad)
        )
      );
    }
  };
  attach();
}

// Re-apply the theme to all open mockups whenever the active theme changes.
// Returns a Disposable.
function watchTheme(subscriptions) {
  const applyAll = () => {
    const mode = themeMode();
    for (const item of mockupItems()) {
      const webview = webviewFor(item);
      if (webview) setWebviewTheme(webview, mode);
    }
  };
  const disposable = atom.themes.onDidChangeActiveThemes(applyAll);
  if (subscriptions) subscriptions.add(disposable);
  // Cover mockups opened later or restored after us — attach a per-item load
  // listener so a reloaded webview re-applies the current theme.
  const onAdd = atom.workspace.onDidAddPaneItem(({ item }) => {
    if (isMockupUrl(item?.getURL?.())) trackItemTheme(item, subscriptions);
  });
  if (subscriptions) subscriptions.add(onAdd);
  // Initial pass for any mockups already open when we activate (deserialized
  // before this package). onDidAddPaneItem won't have fired for those.
  for (const item of mockupItems()) trackItemTheme(item, subscriptions);
  return disposable;
}

async function openMockups(subscriptions) {
  const mainUrl = fileUrl("main-view.html");
  const propsUrl = fileUrl("properties.html");

  try {
    // Properties → right dock. The browser model defaults to center-only, so we
    // pass allowedLocations/defaultLocation through opt to let it live in the
    // dock (see tranquil-browser-model.js getAllowedLocations/getDefaultLocation).
    // Theme sync for these newly opened items is handled by watchTheme()'s
    // onDidAddPaneItem hook (set up before this runs).
    if (!isOpen(propsUrl)) {
      await atom.workspace.open(propsUrl, {
        location: "right",
        allowedLocations: ["center", "right"],
        defaultLocation: "right",
        activatePane: false,
        // Mockups are chrome-less reference views — hide the browser url bar.
        hideURLBar: true,
      });
      atom.workspace.getRightDock().show();
    }

    // Main view → center. Opened last (activated) so focus lands in the editor.
    if (!isOpen(mainUrl)) {
      await atom.workspace.open(mainUrl, { hideURLBar: true });
    }
  } catch (e) {
    console.error("[tranquil-automations] Failed to open business mockups:", e);
  }
}

// Example pane-control registrations for the two mockups — demonstrates the
// registry (URL-matched items with real actions). Returns a Disposable.

// The mockups scroll inside inner `…__scroll` containers, not the window, so
// scroll-to-top must target those (window.scrollTo is a no-op here).
const SCROLL_TOP_JS =
  "document.querySelectorAll('.editor__scroll, .note-list__scroll, .properties__scroll')" +
  ".forEach(function (el) { el.scrollTo({ top: 0, behavior: 'smooth' }); });";

function registerMockupControls(subscriptions) {
  const disposables = [
    paneControls.register(fileUrl("main-view.html"), [
      {
        id: "reload",
        glyph: "⟳",
        title: "Reload view",
        action: (ctx) => ctx.executeJavaScript("location.reload()"),
      },
      {
        id: "scroll-top",
        glyph: "⤒",
        title: "Scroll to top",
        action: (ctx) => ctx.executeJavaScript(SCROLL_TOP_JS),
      },
      {
        id: "about",
        glyph: "ⓘ",
        title: "About this mockup",
        action: () =>
          atom.notifications.addInfo("Tranquil business-theme main view"),
      },
    ]),
    paneControls.register(fileUrl("properties.html"), [
      {
        id: "reload",
        glyph: "⟳",
        title: "Reload",
        action: (ctx) => ctx.executeJavaScript("location.reload()"),
      },
      {
        id: "scroll-top",
        glyph: "⤒",
        title: "Scroll to top",
        action: (ctx) => ctx.executeJavaScript(SCROLL_TOP_JS),
      },
    ]),
  ];
  const disposable = new Disposable(() => disposables.forEach((d) => d.dispose()));
  if (subscriptions) subscriptions.add(disposable);
  return disposable;
}

module.exports = {
  openMockups,
  watchTheme,
  registerMockupControls,
  fileUrl,
  MOCKUPS_DIR,
};
