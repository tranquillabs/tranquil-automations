"use babel";

// Host-side pane controls for the business-theme mockups, using the standard
// (host-registered, codicon) system — the same path as the tree-view controls.
// The mockup pages used to self-register these over tranquil-rpc on
// `tranquilhost:ready`, but that depends on the page being trusted at load time
// (a startup/reload race). Registering host-side and matched by URL is trust-
// independent: the actions run in the page via ctx.executeJavaScript (the webview),
// which is exactly how the untrusted-page default reload already works.

const paneControls = require("./pane-controls.js");
const { isMockupUrl } = require("./mockups.js");
const { notify } = require("./notify.js");

// Scroll every scroll container in the mockup back to the top.
const SCROLL_TOP_JS =
  "document.querySelectorAll('.editor__scroll,.note-list__scroll,.properties__scroll')" +
  ".forEach((el) => el.scrollTo({ top: 0, behavior: 'smooth' }))";

const urlOf = (item) => item?.getURL?.() || item?.getURI?.() || "";

function activate() {
  return paneControls.register((item) => isMockupUrl(urlOf(item)), [
    {
      id: "mockup-reload",
      icon: "refresh",
      title: "Reload view",
      action: (ctx) => ctx.executeJavaScript("location.reload()"),
    },
    {
      id: "mockup-scroll-top",
      icon: "arrow-up",
      title: "Scroll to top",
      action: (ctx) => ctx.executeJavaScript(SCROLL_TOP_JS),
    },
    {
      id: "mockup-about",
      icon: "info",
      title: "About",
      action: (ctx) => {
        const which = urlOf(ctx.item).endsWith("properties.html")
          ? "properties"
          : "main";
        notify("addInfo", `Tranquil business-theme ${which} view`);
      },
    },
  ]);
}

module.exports = { activate };
