"use babel";

// Pane control for Markdown: a single tab-bar button that toggles between source and
// preview (tranquil-config swaps the pane item in place — see its markdown-preview:toggle
// interception), driving the core markdown-preview package's existing toggle command. We
// don't own markdown-preview, so we only dispatch its command (Pulsar-first).

const paneControls = require("./pane-controls.js");

// Match text editors whose grammar is Markdown. Grammar-based (not extension) mirrors how
// markdown-preview itself decides what it can render. The preview view matches too — it
// borrows the source editor's grammar — which is what we want: the same button, same icon,
// shows on both sides of the toggle.
const MARKDOWN_SCOPES = new Set(["source.gfm", "text.md"]);
const isMarkdownEditor = (item) =>
  MARKDOWN_SCOPES.has(item?.getGrammar?.().scopeName);

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
