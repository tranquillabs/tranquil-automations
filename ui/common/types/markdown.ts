// What Markdown.svelte gives the components it draws links and task boxes with. Types only.

export interface MarkdownContext {
  /** Called with a link's href when it's clicked; the link itself never navigates. */
  readonly onLink: (href: string) => void;
  /**
   * The checked state of each task, as the caller knows it, and what to do when one is clicked.
   * A box is live only when its state here matches what it shows. Without `onTask`, boxes are
   * read-only.
   */
  readonly tasks: readonly boolean[];
  readonly onTask: ((index: number, wasChecked: boolean) => void) | null;
}
