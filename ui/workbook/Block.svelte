<script>
  // One of the workbook's own blocks, drawn where its placeholder sits in the rendered Markdown
  // (the shared Markdown component's `inserts`). It finds its model by index in the workbook's
  // context.
  import { getWorkbookContext } from "./context.js";
  import ConversationEntry from "./ConversationEntry.svelte";
  import FileView from "./FileView.svelte";
  import OutputBlock from "./OutputBlock.svelte";
  import RunCard from "./RunCard.svelte";
  import UnverifiedBlock from "./UnverifiedBlock.svelte";

  let { index } = $props();
  const wb = getWorkbookContext();
  const block = $derived(wb.model?.blocks?.[index]);
</script>

{#if block}
  {#if block.kind === "run"}
    <RunCard run={block} locked={wb.model.locked} isOpen={wb.isOpen} setOpen={wb.setOpen} onRun={wb.onRun} onAsk={wb.onAsk} />
  {:else if block.kind === "file"}
    <FileView file={block} isOpen={wb.isOpen} setOpen={wb.setOpen} />
  {:else if block.kind === "output"}
    <OutputBlock output={block} />
  {:else if block.kind === "unverified"}
    <UnverifiedBlock {block} />
  {:else}
    <ConversationEntry entry={block} isOpen={wb.isOpen} setOpen={wb.setOpen} onLink={wb.onLink} />
  {/if}
{/if}
