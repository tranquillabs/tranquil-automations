"use babel";
const { CompositeDisposable } = require("atom");
const { ipcRenderer } = require("electron");
const { githubUrls } = require("./constants.js");
const fs = require("fs");
const path = require("path");

export default {
  subscriptions: null,

  activate(state) {
    this.services = {};
    this.subscriptions = new CompositeDisposable();

    ipcRenderer.on("uri-message", (event, url) => {
      atom.workspace.open(url);
    });

    ipcRenderer.on("webview-url-change", async (event, args) => {
      this.services.tabs?.colorizeActiveTabs();

      try {
        const webViewObj = atom.workspace.getActivePaneItem();
        const webView = webViewObj?.view?.htmlv?.[0];

        if (githubUrls.PR_PATTERN.test(args.url)) {
          webView.addEventListener('dom-ready', () => {
            webView.executeJavaScript(fs.readFileSync(
              path.resolve(__dirname, "github-copy-branch.js"),
              "utf8"
            ));
          });
        }
      } catch (e) {
        console.log(e);
      }
    });
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  serialize() {
    return {};
  },

  provideAutomations() {
    return { githubUrls };
  },

  consumeTabs(service) {
    this.services.tabs = service;
  },
};
