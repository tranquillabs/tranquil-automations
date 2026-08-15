"use babel";
const { CompositeDisposable, Disposable } = require("atom");
const { ipcRenderer } = require("electron");
const { githubUrls, demoUrls } = require("./constants.js");
const rpc = require("tranquil-rpc");
const paneControls = require("./pane-controls.js");
const paneControlsCapability = require("./pane-controls-capability.js");
const treeViewControls = require("./tree-view-controls.js");
const tabControls = require("./tab-controls.js");
const markdownPreviewControl = require("./markdown-preview-control.js");
const runAutomationControl = require("./run-automation-control.js");
const folderCounts = require("./folder-counts.js");
const rowActions = require("./row-actions.js");
const VerticalTabsView = require("./vertical-tabs-view.js");
const RunManager = require("./run-manager.js");
const denoConfigSeed = require("./deno-config-seed.js");
const runnerCapabilities = require("./runner-capabilities.js");
const AutomationRunsView = require("./runs-panel.js");
const { notify } = require("./notify.js");
const selectionGuard = require("./selection-guard.js");
const fs = require("fs");
const path = require("path");

export default {
  subscriptions: null,

  // Deserializer for the vertical tab list. Declared in package.json under
  // `deserializers` (not registered in activate()) so Pulsar installs it at
  // package LOAD time — BEFORE the workspace deserializes its state. Registering
  // it in activate() (which runs after workspace deserialize) was too late: the
  // restored item was dropped, its right dock came back empty→hidden, and the
  // showVerticalTabs observer then recreated + revealed the panel, reopening a
  // dock the user had closed. With the item restored here, the dock's own
  // visibility restores correctly and the observer leaves it alone.
  deserializeVerticalTabs(state) {
    return new VerticalTabsView(state);
  },

  // Same load-time rule as above: the Runs panel restores from the last session before
  // activate() runs; it late-binds to the RunManager via setRunManager in activate.
  deserializeRunsPanel(state) {
    return new AutomationRunsView(state);
  },

  config: {
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
    denoPath: {
      title: "Deno Path",
      description:
        "Absolute path to the `deno` binary used to run automations. Leave empty to find it on PATH.",
      type: "string",
      default: "",
    },
    approvedScriptPermissions: {
      title: "Approved Script Permissions",
      description:
        "Extra permission grants approved per script path (managed by the consent prompt; edit to revoke).",
      type: "array",
      default: [],
    },
  },

  activate(state) {
    this.services = {};
    this.subscriptions = new CompositeDisposable();

    // The Deno runner (ADR-0022): refresh the fallback deno.json (import-map file: URL must
    // track the installed package location) and restore run history.
    denoConfigSeed.seed();
    this.runManager = new RunManager(state && state.runManager);
    AutomationRunsView.setRunManager(this.runManager);

    // Runs panel: opener + toggle + failure-notification click-through.
    this.subscriptions.add(
      atom.workspace.addOpener((uri) =>
        uri === AutomationRunsView.URI ? new AutomationRunsView() : undefined
      )
    );
    const showRunsPanel = async (runId) => {
      const item = await atom.workspace.open(AutomationRunsView.URI, { activatePane: false });
      const container = atom.workspace.paneContainerForItem?.(item);
      if (container && typeof container.show === "function") container.show();
      if (runId && item instanceof AutomationRunsView) item.selectRun(runId);
      return item;
    };
    this.runManager.onShowRuns = (runId) => showRunsPanel(runId);
    this.subscriptions.add(
      atom.commands.add("atom-workspace", {
        "tranquil-automations:toggle-runs-panel": {
          displayName: "Automations: Toggle Runs Panel",
          didDispatch: () => {
            const existing = atom.workspace
              .getPaneItems()
              .find((it) => it instanceof AutomationRunsView);
            const container =
              existing && atom.workspace.paneContainerForItem?.(existing);
            if (
              existing &&
              container &&
              typeof container.isVisible === "function" &&
              container.isVisible()
            ) {
              container.hide();
            } else {
              showRunsPanel();
            }
          },
        },
      })
    );

    this.subscriptions.add(
      atom.commands.add("atom-workspace", {
        "tranquil-automations:run-automation": {
          displayName: "Automations: Run Automation",
          didDispatch: () => this.runAutomation(),
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
    // normal workspace item, so it restores across reloads via its deserializer
    // — registered at load time through package.json (`deserializers`), see
    // `deserializeVerticalTabs` above.
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
    // Retry briefly: right after workspace.open() resolves, the item→container registry
    // entry can lag, paneContainerForItem returns undefined, and a one-shot show() is
    // silently skipped — leaving the dock closed with the panel inside (races in fresh
    // windows; caught by the ADR-0012 smoke suite).
    const revealVerticalTabs = (item) => {
      const attempt = (tries) => {
        const container =
          atom.workspace.paneContainerForItem &&
          atom.workspace.paneContainerForItem(item);
        if (container && typeof container.show === "function") return container.show();
        if (tries > 0) setTimeout(() => attempt(tries - 1), 100);
      };
      attempt(10);
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
    // sync and the choice persists. When on, reveal (open the item if it's
    // missing, else just show its — possibly closed — dock).
    //
    // `observe` fires immediately on activation (window load) and then on every
    // change. On that first load-time call we must NOT force the dock open when
    // the panel item already exists: it was restored from the last session, and
    // the user may have closed its dock before reloading — forcing `show()` here
    // reopened a dock they had deliberately closed. So on load we only reveal
    // when there's no restored item yet (a fresh window, where showing vertical
    // tabs is the intended default); an existing item keeps whatever dock
    // visibility was restored. Any later user-driven change always reveals.
    let verticalTabsInitialObserve = true;
    this.subscriptions.add(
      atom.config.observe("tranquil-automations.showVerticalTabs", (on) => {
        const initial = verticalTabsInitialObserve;
        verticalTabsInitialObserve = false;
        const existing = findVerticalTabs();
        if (on) {
          if (existing) {
            if (!initial) revealVerticalTabs(existing);
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
        // Only remember automation editors as the fallback script source — output files
        // like page-info.txt must not clobber it, or running while a browser tab
        // is focused would pick up the wrong editor.
        const editorPath = item?.getPath?.();
        if (editorPath?.endsWith(".ts") || editorPath?.endsWith(".js")) {
          this._lastEditor = item;
        }
        if (!webView || instrumented.has(webView)) return;
        instrumented.add(webView);

        // App-managed URL triggers (ADR-0022): config-driven `autoInjectScripts` entries run
        // matching scripts through the Deno runner with TRANQUIL_TRIGGER=url:<url>. Debounced
        // per (script, url) — a page can fire did-stop-loading several times per load.
        const inject = () => {
          try {
            const url = webView.getURL();
            if (!url) return;

            this.services.tabs?.colorizeActiveTabs();

            const autoInjects = atom.config.get("tranquil-automations.autoInjectScripts") || [];
            for (const { pattern, path: filePath } of autoInjects) {
              if (!new RegExp(pattern).test(url) || !fs.existsSync(filePath)) continue;
              if (!filePath.endsWith(".ts")) {
                this._warnLegacyScript(filePath);
                continue;
              }
              this._urlTriggerDebounce = this._urlTriggerDebounce || new Map();
              const key = `${filePath}|${url}`;
              const last = this._urlTriggerDebounce.get(key) || 0;
              if (Date.now() - last < 2000) continue;
              this._urlTriggerDebounce.set(key, Date.now());
              this.runManager.run({ scriptPath: filePath, trigger: `url:${url}` });
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

    // Pane controls are an always-on feature:
    //  - inject the tab-bar clusters across center + left/right docks,
    //  - register the tree-view's own controls (New File / Folder / Refresh / Collapse),
    //  - register the RPC capabilities so ANY trusted page can self-register its controls,
    //  - give untrusted browser / custom HTML pages a host-defined default (reload).
    this.subscriptions.add(paneControls.activate());
    this.subscriptions.add(treeViewControls.activate());
    this.subscriptions.add(tabControls.activate());
    this.subscriptions.add(markdownPreviewControl.activate());
    this.subscriptions.add(
      runAutomationControl.activate(
        (editor) => this.runAutomation(editor),
        (scriptPath) => this.runManager.isDebugging(scriptPath)
      )
    );
    paneControlsCapability.registerCapabilities(rpc);
    this.subscriptions.add(
      paneControlsCapability.registerDefaultRemoteControls(rpc)
    );

    // Runner-audience capabilities (ADR-0022): tabs/ui/clipboard/workspace/config served to
    // Deno automation children over the token bridge. Webview guests never see these.
    this.subscriptions.add(runnerCapabilities.registerRunnerCapabilities(rpc));

    // Direct-child count badges on collapsed tree-view folders.
    if (atom.config.get("tranquil-automations.showFolderCounts")) {
      this.subscriptions.add(folderCounts.activate());
    }

    // Hover rename/delete buttons on tree-view rows.
    if (atom.config.get("tranquil-automations.showRowActions")) {
      this.subscriptions.add(rowActions.activate());
    }
  },


  // The Deno runner path (ADR-0022): run a .ts automation — the selection when there is one
  // (via <scriptDir>/.runs/<runId>.ts), else the whole file. `editor` is supplied by the
  // tab-bar run button (that specific file); the keymap/palette pass nothing and fall back to
  // the active (or last-focused) editor.
  runAutomation(editor) {
    editor = editor || atom.workspace.getActiveTextEditor() || this._lastEditor;
    if (!editor) return notify("addWarning", "No active editor");
    const filePath = editor.getPath();
    if (!filePath) return notify("addWarning", "Save the automation first");
    if (filePath.endsWith(".js")) {
      return notify("addWarning", "Automations are now TypeScript", {
        detail: "Rename the script to .ts and import from \"tranquil/automation\" — see Automations/README.",
      });
    }
    if (!filePath.endsWith(".ts")) {
      return notify("addWarning", "Active file is not a .ts automation");
    }
    // Running a selection is implicit — any leftover highlight silently changes what Run does —
    // so a half-selected block gets executed as a standalone file and Deno reports a syntax error
    // against a temp file the user never wrote. Catch the obvious case and say what happened.
    const selected = editor.getSelectedText();
    const problem = selectionGuard.selectionProblem(selected);
    if (problem) {
      return notify("addWarning", "That selection cannot run on its own", {
        detail: `${problem}\n\nSelect whole statements, or clear the selection to run the file.`,
      });
    }

    this.runManager.run({
      scriptPath: filePath,
      sourceOverride: selected || undefined,
      trigger: "manual",
    });
  },

  // One warning per legacy .js script per session — kept entries are preserved (no silent
  // data loss), they just point at the migration instead of running.
  _warnLegacyScript(filePath) {
    this._legacyWarned = this._legacyWarned || new Set();
    if (this._legacyWarned.has(filePath)) return;
    this._legacyWarned.add(filePath);
    notify("addWarning", "Automations are now TypeScript", {
      detail: `${path.basename(filePath)} is a .js script — rename it to .ts and import from "tranquil/automation". See Automations/README.`,
    });
  },

  registerAutomationCommand(name, filePath) {
    const key = `tranquil-automations:automation-${filePath.replace(/\W+/g, "-")}`;
    const disposable = atom.commands.add("atom-workspace", {
      [key]: {
        displayName: `Automations: ${name}`,
        didDispatch: () => {
          if (!filePath.endsWith(".ts")) return this._warnLegacyScript(filePath);
          this.runManager.run({ scriptPath: filePath, trigger: `command:${name}` });
        },
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
    if (!filePath || !filePath.endsWith(".ts")) {
      return notify("addWarning", "Active file is not a .ts automation");
    }

    const saved = atom.config.get("tranquil-automations.registeredAutomations") || [];
    if (saved.some((r) => r.path === filePath)) {
      const existing = saved.find((r) => r.path === filePath);
      return notify("addInfo", `Already registered: Automations: ${existing.name}`);
    }

    const name = path
      .basename(filePath, ".ts")
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
    this.runManager?.dispose();
    this.subscriptions.dispose();
  },

  // atom.file-icons (tranquil-theme-icons): file-type icons for the vertical tab
  // list's editor/file rows, matching the tree-view mapping.
  consumeFileIcons(service) {
    VerticalTabsView.setFileIconService(service);
    return new Disposable(() => VerticalTabsView.setFileIconService(null));
  },

  serialize() {
    return { runManager: this.runManager ? this.runManager.serialize() : undefined };
  },

  provideAutomations() {
    return { githubUrls, demoUrls };
  },

  // Lets other packages register tab-bar pane controls (see pane-controls.js).
  providePaneControls() {
    return { register: paneControls.register, refresh: paneControls.refresh };
  },

  // The runner surface tranquil-debug drives (ADR-0025). Debugging deliberately ignores any text
  // selection: a selection runs through a temp <scriptDir>/.runs/<runId>.ts entry, whose script
  // URL and line offsets would not match the file the user set breakpoints in — breakpoints would
  // silently never bind. Debug always runs the whole file.
  provideAutomationRunner() {
    const rm = this.runManager;
    return {
      runDebug: async ({ scriptPath }) => {
        const editor = atom.workspace
          .getTextEditors()
          .find((e) => e.getPath() === scriptPath);
        // Deno executes what is on disk; a dirty buffer would put breakpoints on lines the
        // debugger never sees.
        if (editor && editor.isModified()) await editor.save();
        return rm.run({ scriptPath, trigger: "debug", debug: true });
      },
      cancel: (runId, opts) => rm.cancel(runId, "cancelled", opts),
      setPaused: (runId, paused) => rm.setPaused(runId, paused),
      find: (runId) => rm.find(runId),
      onDidStartInspector: (cb) => rm.onDidStartInspector(cb),
      onDidUpdate: (cb) => rm.onDidUpdate(cb),
    };
  },

  consumeTabs(service) {
    this.services.tabs = service;
  },
};
