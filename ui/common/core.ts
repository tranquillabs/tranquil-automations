// The shared UI layer's plain TypeScript, with no Svelte or CSS, so feature services and Deno
// tests can import it. index.js re-exports it with the Svelte parts; feature code imports the
// layer only through one of the two (ADR-0032).
export { classifyLink } from "./links.ts";
export type { LinkAction } from "./types/links.ts";
