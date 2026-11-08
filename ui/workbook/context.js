// How Workbook.svelte hands its model and handlers to the blocks drawn inside the rendered
// Markdown (Block.svelte), which sit below the Markdown renderer in the component tree.
import { getContext, setContext } from "svelte";

const KEY = Symbol("tranquil-workbook");

export const setWorkbookContext = (ctx) => setContext(KEY, ctx);
export const getWorkbookContext = () => getContext(KEY);
