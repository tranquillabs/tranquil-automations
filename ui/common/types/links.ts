// What a link in Tranquil's rendered Markdown may do (../links.ts). Types only.

/** A web page to open in a browser tab, a path to check and open in Tranquil, or nothing at all. */
export type LinkAction =
  | { kind: "web"; url: string }
  | { kind: "relative"; path: string }
  | { kind: "inert" };
