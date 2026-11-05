<script>
  // A workbook. It owns what the view shows: the file's content as the service last read it, which
  // rows are open, the scroll position, and the message being written. The service
  // (lib/workbook-service.js) does everything that needs Node or Pulsar, and every action it takes
  // writes the workbook, whose change brings the next model here.
  import { flushSync, tick } from "svelte";
  import { SvelteMap } from "svelte/reactivity";
  import { attachNodes } from "../common/index.js";
  import ConversationEntry from "./ConversationEntry.svelte";
  import FileView from "./FileView.svelte";
  import OutputBlock from "./OutputBlock.svelte";
  import RunCard from "./RunCard.svelte";
  import UnverifiedBlock from "./UnverifiedBlock.svelte";

  let { filePath, scrollTop = 0, service, composer, setTitle } = $props();

  let model = $state.raw(null); // kept raw, not deep-proxied: it holds DOM nodes
  const opened = new SvelteMap(); // rows the person opened or closed, kept across redraws
  let askStep = $state(null); // the step the next message is about, if any
  let scroller;
  let content = $state(null);
  let drawn = false;
  const sendKeys = /Mac/.test(navigator.platform) ? "⌘↩" : "Ctrl+Enter";

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

  // The task boxes in the rendered Markdown, in order, are live when they match the workbook's
  // tasks one for one and nothing locks the workbook. A click asks the service to write the tick.
  $effect(() => {
    const current = model;
    tick().then(() => {
      if (!current || current !== model || !content) return;
      const boxes = Array.from(content.querySelectorAll('input[type="checkbox"]'));
      const live = boxes.length === current.tasks.length && !current.locked;
      boxes.forEach((box, i) => {
        box.disabled = !live;
        box.onclick = live
          ? (e) => {
            e.preventDefault();
            service.toggleTask(filePath, i, current.tasks[i]);
          }
          : null;
      });
    });
  });

  // ⌘↩ in the message box sends, as the Send button does.
  $effect(() => {
    const sub = composer.onSubmit(send);
    return () => sub.dispose();
  });

  export function serialize() {
    return { scrollTop: scroller?.scrollTop ?? 0 };
  }

  const isOpen = (key, byDefault) => (opened.has(key) ? opened.get(key) : byDefault);
  const setOpen = (key, open) => opened.set(key, open);

  function ask(stepId) {
    askStep = stepId;
    composer.focus();
  }

  function send() {
    if (model?.locked) return;
    if (service.sendMessage(filePath, composer.getText(), askStep)) {
      composer.clear();
      askStep = null;
    }
  }

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
</script>

<div class="view">
  <div class="scroller" bind:this={scroller}>
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions (these handlers only catch clicks and drags on the links inside, which are focusable and fire a click on Enter; the div itself isn't something to press) -->
    <div class="workbook" {onclick} onauxclick={refuseLink} ondragstart={refuseLink}>
      {#if model?.error}
        <div class="card preset-tonal-error p-3">{model.error}</div>
      {:else if model}
        {#if model.locked}
          <div class="card preset-tonal-warning mb-4 p-3">
            This workbook has unsaved changes in an editor. Save or discard them to run steps, tick boxes or send
            messages.
          </div>
        {/if}
        {#if model.warnings.length}
          <div class="card preset-tonal-warning mb-4 p-3">
            <p class="font-semibold">This workbook has problems:</p>
            <ul class="mt-1 list-disc pl-5">
              {#each model.warnings as warning}<li>{warning}</li>{/each}
            </ul>
          </div>
        {/if}
        <div class="markdown" bind:this={content}>
          {#each model.segments as segment (segment.key)}
            {#if segment.kind === "markdown"}
              <div class="contents" use:attachNodes={segment.nodes}></div>
            {:else if segment.block.label}
              <UnverifiedBlock block={segment.block} />
            {:else if segment.block.kind === "run"}
              <RunCard
                run={segment.block}
                {isOpen}
                {setOpen}
                onRun={(id) => service.runStep(filePath, id)}
                onAsk={ask}
              />
            {:else if segment.block.kind === "file"}
              <FileView file={segment.block} {isOpen} {setOpen} />
            {:else if segment.block.kind === "output"}
              <OutputBlock output={segment.block} />
            {:else}
              <ConversationEntry entry={segment.block} {isOpen} {setOpen} />
            {/if}
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <div class="composer border-surface-200-800 border-t px-6 py-3">
    {#if askStep}
      <div class="mb-1 flex items-center gap-2 text-sm">
        <span>About step <code>{askStep}</code></span>
        <button type="button" class="btn btn-sm preset-tonal-surface" onclick={() => (askStep = null)}>Not about a step</button>
      </div>
    {/if}
    <div class="flex items-end gap-2">
      <div class="min-w-0 flex-1"><svelte:element this={"slot"} name="composer" /></div>
      <button type="button" class="btn preset-filled-primary-500" disabled={model?.locked} onclick={send}>Send</button>
    </div>
    <p class="text-surface-700-300 mt-1 text-xs">{sendKeys} sends. Your LLM reads the workbook and replies in it.</p>
  </div>
</div>

<style>
  .view {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .scroller {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }
  .workbook {
    max-width: 52em;
    margin: 0 auto;
    padding: 16px 24px 48px;
  }
</style>
