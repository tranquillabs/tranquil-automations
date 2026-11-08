// How Markdown.svelte hands its caller's handlers to the components it draws elements with.
import { getContext, setContext } from "svelte";
import type { MarkdownContext } from "../types/markdown.ts";

const KEY = Symbol("tranquil-markdown");

export const setMarkdownContext = (ctx: MarkdownContext): MarkdownContext => setContext(KEY, ctx);
export const getMarkdownContext = (): MarkdownContext => getContext<MarkdownContext>(KEY);
