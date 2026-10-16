// SDK: Map Custom Parts. A built-in script that ships with Tranquil and runs through the
// normal runner: it drafts a custom parts map for the form in the active tab and hands it back
// as TypeScript, which the command opens in a new editor. It only reads the page.
// @permissions tabs
import { context, tabs } from "./mod.ts";

const tab = await tabs.active();
await context.result({ draft: await tab._mapCustomParts() });
