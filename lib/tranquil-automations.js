"use babel";
const { CompositeDisposable, Disposable } = require("atom");
const { ipcRenderer } = require("electron");
const { githubUrls, demoUrls } = require("./constants.js");
const { openMockups, watchTheme, MOCKUPS_DIR } = require("./mockups.js");
const rpc = require("tranquil-rpc");
const paneControls = require("./pane-controls.js");
const paneControlsCapability = require("./pane-controls-capability.js");
const treeViewControls = require("./tree-view-controls.js");
const tabControls = require("./tab-controls.js");
const mockupControls = require("./mockup-controls.js");
const folderCounts = require("./folder-counts.js");
const rowActions = require("./row-actions.js");
const VerticalTabsView = require("./vertical-tabs-view.js");
const { notify } = require("./notify.js");
const fs = require("fs");
const path = require("path");

export default {
  subscriptions: null,

  config: {
    showBusinessMockups: {
      title: "Show Business Theme Mockups",
      description:
        "Auto-open the business-theme reference mockups (main view + properties) on startup and show the custom tab-bar controls.",
      type: "boolean",
      default: true,
    },
    showFolderCounts: {
      title: "Show Folder Counts in the Tree View",
      description:
        "Show a direct-child count badge on collapsed folders in the tree view.",
      type: "boolean",
      default: true,
    },
    showRowActions: {
      title: "Show Rename/Delete Buttons on Tree View Rows",
      description:
        "Show rename and delete buttons on hover over a tree view file or folder, so they don't require the right-click context menu.",
      type: "boolean",
      default: true,
    },
    showVerticalTabs: {
      title: "Show Vertical Tab List (Right Dock)",
      description:
        "Show a panel in the right dock listing the main view's open tabs; click one to activate it in the main view.",
      type: "boolean",
      default: false,
    },
  },

  activate(state) {
    this.services = {};
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(
      atom.commands.add("atom-workspace", {
        "tranquil-automations:run-in-webview": {
          displayName: "Automations: Run in Webview",
          didDispatch: () => this.runInWebview(),
        },
        "tranquil-automations:register-current-file": {
          displayName: "Automations: Register Current File",
          didDispatch: () => this.registerCurrentFile(),
        },
        "tranquil-automations:unregister-current-file": {
          displayName: "Automations: Unregister Current File",
          didDispatch: () => this.unregisterCurrentFile(),
        },
      })
    );

    ipcRenderer.on("uri-message", (event, url) => {
      atom.workspace.open(url);
    });

    // Vertical tab list: a right-dock panel that mirrors the main (center)
    // view's open tabs; clicking one activates it in the center. The panel is a
    // normal workspace item, so it restores across reloads via its deserializer.
    this.subscriptions.add(
      atom.deserializers.add({
        name: VerticalTabsView.DESERIALIZER,
        deserialize: (state) => new VerticalTabsView(state),
      })
    );
    this.subscriptions.add(
      atom.workspace.addOpener((uri) =>
        uri === VerticalTabsView.URI ? new VerticalTabsView() : undefined
      )
    );
    // Helpers for showing/finding the panel. activatePane:false keeps keyboard
    // focus in the editor, but that leaves the target dock hidden — and a dock
    // can also be closed while the panel item still exists inside it. So whenever
    // vertical tabs are on, show the item's container explicitly (it's a Dock
    // with show()/isVisible(); the center container has neither, hence the guards).
    const findVerticalTabs = () =>
      atom.workspace
        .getPaneItems()
        .find((it) => it instanceof VerticalTabsView);
    const revealVerticalTabs = (item) => {
      const container =
        atom.workspace.paneContainerForItem &&
        atom.workspace.paneContainerForItem(item);
      if (container && typeof container.show === "function") container.show();
    };
    const verticalTabsVisible = (item) => {
      const container =
        item &&
        atom.workspace.paneContainerForItem &&
        atom.workspace.paneContainerForItem(item);
      // No isVisible() => the center container, which is always visible.
      return !!(
        container &&
        (typeof container.isVisible !== "function" || container.isVisible())
      );
    };

    this.subscriptions.add(
      atom.commands.add("atom-workspace", {
        "tranquil-automations:toggle-vertical-tabs": {
          displayName: "Tabs: Toggle Vertical Tab List",
          didDispatch: () => {
            const existing = findVerticalTabs();
            if (verticalTabsVisible(existing)) {
              // Visible → hide it.
              atom.config.set("tranquil-automations.showVerticalTabs", false);
            } else if (
              atom.config.get("tranquil-automations.showVerticalTabs")
            ) {
              // Config already on but the dock is closed — reveal it directly
              // (a no-op config re-set wouldn't re-fire the observer).
              if (existing) revealVerticalTabs(existing);
              else
                atom.workspace
                  .open(VerticalTabsView.URI, { activatePane: false })
                  .then(revealVerticalTabs);
            } else {
              atom.config.set("tranquil-automations.showVerticalTabs", true);
            }
          },
        },
      })
    );
    // Config drives visibility so the settings checkbox and the command stay in
    // sync and the choice persists. When on, always reveal (open the item if it's
    // missing, else just show its — possibly closed — dock).
    this.subscriptions.add(
      atom.config.observe("tranquil-automations.showVerticalTabs", (on) => {
        const existing = findVerticalTabs();
        if (on) {
          if (existing) {
            revealVerticalTabs(existing);
          } else {
            atom.workspace
              .open(VerticalTabsView.URI, { activatePane: false })
              .then(revealVerticalTabs);
          }
        } else if (existing) {
          atom.workspace.paneForItem(existing)?.destroyItem(existing);
        }
      })
    );

    const instrumented = new WeakSet();

    this.subscriptions.add(
      atom.workspace.observeActivePaneItem((item) => {
        const webView = item?.view?.htmlv?.[0];
        if (webView) this._lastWebView = webView;
        // Only remember .js editors as the fallback script source — output files
        // like page-info.txt must not clobber it, or running while a browser tab
        // is focused would pick up the wrong (non-.js) editor.
        if (item?.getPath?.()?.endsWith(".js")) this._lastEditor = item;
        if (!webView || instrumented.has(webView)) return;
        instrumented.add(webView);

        const inject = () => {
          try {
            const url = webView.getURL();
            if (!url) return;

            this.services.tabs?.colorizeActiveTabs();

            const autoInjects = atom.config.get("tranquil-automations.autoInjectScripts") || [];
            for (const { pattern, path: filePath } of autoInjects) {
              if (new RegExp(pattern).test(url) && fs.existsSync(filePath)) {
                this.runFile(filePath);
              }
            }
          } catch (e) {
            // Webview not yet attached to DOM — did-stop-loading will retry
          }
        };

        webView.addEventListener("did-stop-loading", inject);
        inject();
      })
    );

    const saved = atom.config.get("tranquil-automations.registeredAutomations") || [];
    saved.forEach(({ name, path: filePath }) => this.registerAutomationCommand(name, filePath));

    // Pane controls are an always-on feature, independent of the mockups flag:
    //  - inject the tab-bar clusters across center + left/right docks,
    //  - register the tree-view's own controls (New File / Folder / Refresh / Collapse),
    //  - register the business-theme mockups' own controls (host-side, by URL),
    //  - register the RPC capabilities so ANY trusted page can self-register its controls,
    //  - give untrusted browser / custom HTML pages a host-defined default (reload).
    this.subscriptions.add(paneControls.activate());
    this.subscriptions.add(treeViewControls.activate());
    this.subscriptions.add(tabControls.activate());
    this.subscriptions.add(mockupControls.activate());
    paneControlsCapability.registerCapabilities(rpc);
    this.subscriptions.add(
      paneControlsCapability.registerDefaultRemoteControls(rpc)
    );

    // Business-theme reference mockups — only the *opening* of the mockups (and trusting
    // their dir so they can self-register over RPC) is gated behind the config flag.
    // Deferred to the next tick so the workspace (and the tabs package) has finished its
    // own startup deserialization first.
    if (atom.config.get("tranquil-automations.showBusinessMockups")) {
      // Trust the mockups dir so tranquil-rpc injects its guest runtime into these file:// pages
      // (registered before the mockups open, so their first load is already trusted).
      rpc.addTrustedRoot(MOCKUPS_DIR);
      // Watch first so its onDidAddPaneItem catches the mockups openMockups opens.
      watchTheme(this.subscriptions);
      process.nextTick(() => openMockups(this.subscriptions));
    }

    // Direct-child count badges on collapsed tree-view folders.
    if (atom.config.get("tranquil-automations.showFolderCounts")) {
      this.subscriptions.add(folderCounts.activate());
    }

    // Hover rename/delete buttons on tree-view rows.
    if (atom.config.get("tranquil-automations.showRowActions")) {
      this.subscriptions.add(rowActions.activate());
    }
  },

  async getBrowser() {
    if (!this._browser) {
      const puppeteer = require("puppeteer-core");
      this._browser = await puppeteer.connect({
        browserURL: "http://localhost:9222",
        defaultViewport: null,
      });
      this._browser.on("disconnected", () => { this._browser = null; });
    }
    return this._browser;
  },

  runInWebview() {
    const editor = atom.workspace.getActiveTextEditor() || this._lastEditor;
    if (!editor) return notify("addWarning", "No active editor");
    const filePath = editor.getPath();
    if (!filePath || !filePath.endsWith(".js")) {
      return notify("addWarning", "Active file is not a .js automation");
    }
    const selected = editor.getSelectedText();
    this.runScript(selected || editor.getText(), filePath);
  },

  runFile(filePath) {
    this.runScript(fs.readFileSync(filePath, "utf8"), filePath);
  },

  async runScript(content, scriptPath) {
    let browser;
    try {
      browser = await this.getBrowser();
    } catch (e) {
      return notify("addError", "Cannot connect to browser", {
        detail: "Tranquil must be started with --remote-debugging-port=9222",
      });
    }

    const scriptDir = scriptPath
      ? path.dirname(scriptPath)
      : (atom.project.getPaths()[0] || "");

    const isWebviewTarget = (t) => /^https?:/.test(t.url());

    // Guard conditions (no tab open, etc.) are setup issues, not script bugs —
    // throw these so the catch can show a warning instead of a red error.
    const userError = (message) =>
      Object.assign(new Error(message), { userFacing: true });

    const tranquil = {
      getActiveTab: async () => {
        // getURL() throws if the webview is detached (closed tab) or not yet
        // dom-ready — treat either as "no active tab" rather than leaking the
        // raw Electron WebView error.
        let url;
        try {
          url = this._lastWebView?.getURL();
        } catch (e) {
          url = null;
        }
        if (!url) throw userError("No active browser tab");
        const target = await browser.waitForTarget(
          (t) => isWebviewTarget(t) && t.url() === url,
          { timeout: 5000 }
        );
        return target.page();
      },

      getTab: async (urlOrPattern) => {
        const match =
          typeof urlOrPattern === "string"
            ? (t) => t.url() === urlOrPattern
            : (t) => urlOrPattern.test(t.url());
        const target = await browser.waitForTarget(
          (t) => isWebviewTarget(t) && match(t),
          { timeout: 5000 }
        );
        return target.page();
      },

      getTabs: async () => {
        const targets = browser.targets().filter(isWebviewTarget);
        return Promise.all(targets.map((t) => t.page()));
      },

      openTab: async (url) => {
        await atom.workspace.open(url);
        const target = await browser.waitForTarget(
          (t) => isWebviewTarget(t) && t.url() === url,
          { timeout: 10000 }
        );
        return target.page();
      },

      openBackgroundTab: async (url) => {
        // Electron's CDP doesn't support Target.createTarget, so browser.newPage()
        // fails ("Not supported"). Instead create a real but off-screen <webview>
        // element and attach Puppeteer to the new target by matching its URL.
        if (!url) throw userError("openBackgroundTab requires a url");
        const before = new Set(browser.targets());
        const wv = document.createElement("webview");
        wv.setAttribute("src", url);
        wv.style.cssText =
          "position:absolute;left:-10000px;top:0;width:1024px;height:768px;";
        document.body.appendChild(wv);
        try {
          await Promise.race([
            new Promise((resolve) =>
              wv.addEventListener("did-stop-loading", resolve, { once: true })
            ),
            new Promise((resolve) => setTimeout(resolve, 15000)),
          ]);
          const target = await browser.waitForTarget(
            (t) => isWebviewTarget(t) && !before.has(t) && t.url() === wv.getURL(),
            { timeout: 10000 }
          );
          const page = await target.page();
          page.__tranquilBgWebview = wv;
          return page;
        } catch (e) {
          wv.remove();
          throw e;
        }
      },

      closeTab: async (page) => {
        // Background tabs are off-screen <webview> elements — removing the element
        // destroys the page (page.close() is unsupported for these in Electron).
        if (page.__tranquilBgWebview) {
          page.__tranquilBgWebview.remove();
          return;
        }
        const url = page.url();
        atom.workspace.getPaneItems().forEach((item) => {
          if (item?.view?.htmlv?.[0]?.getURL?.() === url) {
            atom.workspace.paneForItem(item)?.destroyItem(item);
          }
        });
        await page.close().catch(() => {});
      },

      writeFile: (filename, content) => {
        const abs = path.resolve(scriptDir, filename);
        fs.writeFileSync(abs, content, "utf8");
        return abs;
      },

      readFile: (filename) =>
        fs.readFileSync(path.resolve(scriptDir, filename), "utf8"),

      openFile: async (filePath, options = {}) => {
        // If the file is already open, refresh its content from disk and reveal
        // it in place — don't close/reopen (jarring) and don't leave stale text.
        // workspace.open's `split` only applies on first open, which is fine: the
        // file lands in the split on run #1 and refreshes there on later runs.
        const abs = path.resolve(filePath);
        const existing = atom.workspace
          .getPaneItems()
          .find((item) => item?.getPath?.() === abs);
        if (existing) {
          existing.getBuffer?.()?.reload?.();
          const pane = atom.workspace.paneForItem(existing);
          pane?.activateItem(existing);
          pane?.activate();
          return existing;
        }
        return atom.workspace.open(filePath, options);
      },

      notify: (message, level = "info") => {
        const fn =
          { info: "addInfo", success: "addSuccess", warning: "addWarning", error: "addError" }[level] ||
          "addInfo";
        atom.notifications[fn](message);
      },

      clipboard: {
        read: () => atom.clipboard.read(),
        write: (text) => atom.clipboard.write(text),
      },

      getProjectDir: () => atom.project.getPaths()[0] || "",

      exec: (command) =>
        new Promise((resolve, reject) => {
          require("child_process").exec(command, { cwd: scriptDir }, (err, stdout, stderr) => {
            if (err) reject(Object.assign(err, { stderr }));
            else resolve(stdout.trimEnd());
          });
        }),

      config: {
        get: (key) => atom.config.get(key),
        set: (key, value) => atom.config.set(key, value),
      },

      // Register items (with click actions) into the tab-bar pane controls of
      // panes whose active item matches. Returns a Disposable to unregister.
      paneControls: {
        register: (match, items) => paneControls.register(match, items),
      },

      autoInject: {
        register: (urlPattern) => {
          if (!scriptPath) {
            notify("addWarning", "Cannot register unsaved script for auto-inject");
            return;
          }
          const patternStr = urlPattern instanceof RegExp ? urlPattern.source : urlPattern;
          const saved = atom.config.get("tranquil-automations.autoInjectScripts") || [];
          if (!saved.some((s) => s.path === scriptPath)) {
            saved.push({ pattern: patternStr, path: scriptPath });
            atom.config.set("tranquil-automations.autoInjectScripts", saved);
          }
          notify("addSuccess", `Auto-inject registered for /${patternStr}/`);
        },
        unregister: () => {
          if (!scriptPath) return;
          const saved = atom.config.get("tranquil-automations.autoInjectScripts") || [];
          atom.config.set(
            "tranquil-automations.autoInjectScripts",
            saved.filter((s) => s.path !== scriptPath)
          );
          notify("addInfo", "Auto-inject unregistered");
        },
      },
    };

    try {
      const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
      const fn = new AsyncFunction(
        "tranquil", "require", "atom", "__dirname", "__filename",
        content
      );
      await fn(tranquil, require, atom, scriptDir, scriptPath || "");
    } catch (e) {
      if (e.userFacing) {
        notify("addWarning", e.message);
      } else {
        const label = scriptPath ? path.basename(scriptPath) : "untitled";
        notify("addError", `Script error in ${label}`, { detail: e.message });
      }
    }
  },

  registerAutomationCommand(name, filePath) {
    const key = `tranquil-automations:automation-${filePath.replace(/\W+/g, "-")}`;
    const disposable = atom.commands.add("atom-workspace", {
      [key]: {
        displayName: `Automations: ${name}`,
        didDispatch: () => this.runFile(filePath),
      },
    });
    this._automationDisposables = this._automationDisposables || new Map();
    this._automationDisposables.set(filePath, disposable);
    this.subscriptions.add(disposable);
  },

  registerCurrentFile() {
    const editor = atom.workspace.getActiveTextEditor();
    if (!editor) return notify("addWarning", "No active editor");
    const filePath = editor.getPath();
    if (!filePath || !filePath.endsWith(".js")) {
      return notify("addWarning", "Active file is not a .js file");
    }

    const saved = atom.config.get("tranquil-automations.registeredAutomations") || [];
    if (saved.some((r) => r.path === filePath)) {
      const existing = saved.find((r) => r.path === filePath);
      return notify("addInfo", `Already registered: Automations: ${existing.name}`);
    }

    const name = path
      .basename(filePath, ".js")
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    saved.push({ name, path: filePath });
    atom.config.set("tranquil-automations.registeredAutomations", saved);
    this.registerAutomationCommand(name, filePath);
    notify("addSuccess", `Registered: Automations: ${name}`);
  },

  unregisterCurrentFile() {
    const editor = atom.workspace.getActiveTextEditor();
    if (!editor) return notify("addWarning", "No active editor");
    const filePath = editor.getPath();
    if (!filePath) return notify("addWarning", "File has no path");

    const saved = atom.config.get("tranquil-automations.registeredAutomations") || [];
    const entry = saved.find((r) => r.path === filePath);
    if (!entry) return notify("addWarning", "File is not registered");

    atom.config.set(
      "tranquil-automations.registeredAutomations",
      saved.filter((r) => r.path !== filePath)
    );

    const disposable = this._automationDisposables?.get(filePath);
    if (disposable) {
      disposable.dispose();
      this._automationDisposables.delete(filePath);
    }

    notify("addInfo", `Unregistered: Automations: ${entry.name}`);
  },

  deactivate() {
    this._browser?.disconnect().catch(() => {});
    this.subscriptions.dispose();
  },

  // atom.file-icons (tranquil-theme-icons): file-type icons for the vertical tab
  // list's editor/file rows, matching the tree-view mapping.
  consumeFileIcons(service) {
    VerticalTabsView.setFileIconService(service);
    return new Disposable(() => VerticalTabsView.setFileIconService(null));
  },

  serialize() {
    return {};
  },

  provideAutomations() {
    return { githubUrls, demoUrls };
  },

  // Lets other packages register tab-bar pane controls (see pane-controls.js).
  providePaneControls() {
    return { register: paneControls.register };
  },

  consumeTabs(service) {
    this.services.tabs = service;
  },
};
