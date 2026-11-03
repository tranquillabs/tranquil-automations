// What lib/safe-markdown.js exports (ADR-0030). The module is plain JavaScript, so its shapes are
// declared here, once, for every TypeScript that loads it. Types only. render() is left out: it
// needs Pulsar's window, so only the workbook view calls it.

/** What clicking a link in a workbook may do. */
export type LinkAction =
  | { kind: "web"; url: string }
  | { kind: "relative"; path: string }
  | { kind: "inert" };

export interface SafeMarkdownModule {
  /** Makes a parsed DOM node safe, in place, and returns it. */
  harden<T>(root: T): T;
  classifyLink(href: string | null | undefined): LinkAction;
  escapeMarkdown(text: string): string;
}
