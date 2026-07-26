"use babel";

// Pane control for Markdown editors: a one-click "preview to the side" button on the
// tab-bar, driving the core markdown-preview package's existing toggle command. We don't
// own markdown-preview, so we only dispatch its command (Pulsar-first) — the preview's
// split-right placement is the package's own default (markdown-preview.openPreviewInSplitPane).

const paneControls = require("./pane-controls.js");

// Match text editors whose grammar is Markdown. Grammar-based (not extension) mirrors how
// markdown-preview itself decides what it can render. The preview view also reports a
// Markdown grammar (it borrows the source editor's), so exclude it by its own URI —
// otherwise the button would show on the preview pane too.
const MARKDOWN_SCOPES = new Set(["source.gfm", "text.md"]);
const isMarkdownEditor = (item) =>
  MARKDOWN_SCOPES.has(item?.getGrammar?.().scopeName) &&
  !(item?.getURI?.() || "").startsWith("markdown-preview://");

function activate() {
  return paneControls.register(isMarkdownEditor, [
    {
      id: "markdown-preview-toggle",
      icon: "open-preview",
      title: "Toggle Markdown Preview",
      action: (ctx) => ctx.dispatch("markdown-preview:toggle"),
    },
  ]);
}

module.exports = { activate };
