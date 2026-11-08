// The shared UI layer's entry for Svelte code; core.ts is its entry for plain TypeScript. Feature
// code imports the layer only through these two, and nothing in ui/common imports a feature or
// anything in lib/, so the folder can move to its own repo (tranquil-ui) by changing those imports
// in each feature. See ADR-0032.
import "./base.css"; // Tailwind, Skeleton and the Markdown styles, built into each feature's stylesheet
export * from "./core.ts";
export { default as Markdown } from "./markdown/Markdown.svelte";
export { mountInShadow } from "./mount.js";
export { SveltePane } from "./pane-item.js";
