<script>
  // A workbook. It owns what the view shows: the file's content as the service last read it, which
  // rows are open, and the scroll position. The service (lib/workbook-service.js) does everything
  // that needs Node or Pulsar: reading and watching files, checking paths, rendering Markdown and
  // opening links.
  import { flushSync } from "svelte";
  import { SvelteSet } from "svelte/reactivity";
  import FileView from "./FileView.svelte";
  import RunCard from "./RunCard.svelte";
  import UnverifiedBlock from "./UnverifiedBlock.svelte";

  let { filePath, scrollTop = 0, service, setTitle } = $props();

  let model = $state.raw(null); // kept raw, not deep-proxied: it holds DOM nodes
  const open = new SvelteSet(); // the rows the person opened, kept across redraws
  let scroller;
  let drawn = false;

  // Draw each new version of the file, keeping the scroll position (or following the end).
  $effect(() =>
    service.watchWorkbook(filePath, (next) => {
      const atBottom = drawn && scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 40;
      const top = drawn ? scroller.scrollTop : scrollTop;
      flushSync(() => (model = next));
      scroller.scrollTop = atBottom ? scroller.scrollHeight : top;
      drawn = true;
      setTitle(next.title);
    })
  );

  export function serialize() {
    return { scrollTop: scroller?.scrollTop ?? 0 };
  }

  const toggle = (key, isOpen) => (isOpen ? open.add(key) : open.delete(key));

  // Links never navigate the window; the service decides what each one may do.
  const linkIn = (e) => e.composedPath().find((n) => n.tagName === "A");
  function onclick(e) {
    const a = linkIn(e);
    if (!a) return;
    e.preventDefault();
    service.openLink(filePath, a.getAttribute("href"));
  }
  function refuseLink(e) {
    if (linkIn(e)) e.preventDefault();
  }

  // Puts a run of rendered Markdown (already hardened, lib/safe-markdown.js) in place.
  function markdown(node, nodes) {
    node.replaceChildren(...nodes);
    return { update: (next) => node.replaceChildren(...next) };
  }
</script>

<div class="scroller" bind:this={scroller}>
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions (these handlers only catch clicks and drags on the links inside, which are focusable and fire a click on Enter; the div itself isn't something to press) -->
  <div class="workbook" {onclick} onauxclick={refuseLink} ondragstart={refuseLink}>
    {#if model?.error}
      <div class="card preset-tonal-error p-3">{model.error}</div>
    {:else if model}
      {#if model.warnings.length}
        <div class="card preset-tonal-warning mb-4 p-3">
          <p class="font-semibold">This workbook has problems:</p>
          <ul class="mt-1 list-disc pl-5">
            {#each model.warnings as warning}<li>{warning}</li>{/each}
          </ul>
        </div>
      {/if}
      <div class="markdown">
        {#each model.segments as segment (segment.key)}
          {#if segment.kind === "markdown"}
            <div class="contents" use:markdown={segment.nodes}></div>
          {:else if segment.block.kind === "run"}
            <RunCard run={segment.block} {open} onToggle={toggle} />
          {:else if segment.block.kind === "file"}
            <FileView file={segment.block} {open} onToggle={toggle} />
          {:else}
            <UnverifiedBlock block={segment.block} />
          {/if}
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .scroller {
    height: 100%;
    overflow-y: auto;
  }
  .workbook {
    max-width: 52em;
    margin: 0 auto;
    padding: 16px 24px 48px;
  }
</style>
