<script>
  // One message or reply, as a row that shows its first line and opens to the whole of it. A
  // message is the person's, signed by Tranquil, shown as text; a reply is the LLM's, drawn as
  // Markdown through the shared renderer.
  import { Markdown } from "../common/index.js";

  let { entry, isOpen, setOpen, onLink } = $props();
</script>

<details
  class="entry border-surface-300-700 my-1 ml-6 border-l-2 pl-3 text-sm"
  open={isOpen(entry.key, entry.startOpen)}
  ontoggle={(e) => setOpen(entry.key, e.currentTarget.open)}
>
  <summary class="cursor-pointer">
    <span class="font-semibold">{entry.kind === "message" ? "You" : "Agent"}</span>
    {#if entry.time}<span class="text-surface-700-300"> · {entry.time}</span>{/if}
    <span class="text-surface-700-300"> · {entry.summary}</span>
  </summary>
  {#if entry.kind === "message"}
    <p class="mt-1 whitespace-pre-wrap">{entry.body}</p>
  {:else}
    <div class="mt-1"><Markdown md={entry.body} {onLink} /></div>
  {/if}
</details>
