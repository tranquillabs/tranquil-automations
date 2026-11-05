// The shared UI layer, and the only file feature code imports from it. Nothing in ui/common
// imports a feature or anything in lib/, so the folder can move to its own repo (tranquil-ui) by
// changing this one import in each feature. See ADR-0032.
import "./base.css"; // Tailwind, Skeleton and the Markdown styles, built into each feature's stylesheet
export { attachNodes } from "./attach.js";
export { mountInShadow } from "./mount.js";
export { SveltePane } from "./pane-item.js";
