// What lib/notify.js exports, as far as its test uses it. The module is plain JavaScript, so its
// shapes are declared here for the TypeScript that loads it. Types only.

export interface NotifyModule {
  /** Escapes every ASCII punctuation character, so Markdown and HTML both render as plain text. */
  escapeMarkdown(text: string): string;
}
