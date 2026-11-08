<script>
  // Markdown drawn as Svelte elements, for text Tranquil didn't write: from web pages, an LLM, or a
  // person (ADR-0032). Raw HTML in it is shown as text, never parsed; rehype-sanitize then keeps
  // only allowed elements, attributes and link schemes; and links, images and task boxes are drawn
  // by our own components: a link never navigates the window, an image shows its alt text and
  // loads nothing, and a task box is live only when the caller says so.
  //
  // `inserts` puts the caller's own component where a paragraph holds only a placeholder
  // `WB<nonce>N<index>` (plugins.ts); the component gets `index`.
  import Markdown from "svelte-exmarkdown";
  import { gfmPlugin } from "svelte-exmarkdown/gfm";
  import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
  import { setMarkdownContext } from "./context.ts";
  import { insertsAt, numberTasks } from "./plugins.ts";
  import ImageAlt from "./ImageAlt.svelte";
  import Link from "./Link.svelte";
  import TaskBox from "./TaskBox.svelte";

  let { md, onLink = () => {}, tasks = [], onTask = null, inserts = null } = $props();

  setMarkdownContext({
    get onLink() {
      return onLink;
    },
    get tasks() {
      return tasks;
    },
    get onTask() {
      return onTask;
    },
  });

  const plugins = $derived([
    gfmPlugin(),
    { rehypePlugin: [rehypeSanitize, defaultSchema] },
    { rehypePlugin: [numberTasks] },
    ...(inserts ? [{ rehypePlugin: [insertsAt, inserts.nonce], renderer: { "tq-insert": inserts.component } }] : []),
    { renderer: { a: Link, img: ImageAlt, input: TaskBox } },
  ]);
</script>

<Markdown {md} {plugins} />
