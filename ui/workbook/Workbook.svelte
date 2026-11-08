<script>
  // A workbook. It owns what the view shows: the file's content as the service last read it, which
  // rows are open, the scroll position, and the message being written. The service (service.ts)
  // does everything that needs Node or Pulsar, and every action it takes writes the workbook,
  // whose change brings the next model here. The document is drawn by the shared Markdown
  // component, with each of the workbook's own blocks (Block.svelte) in place of its placeholder.
  import { flushSync } from "svelte";
  import { SvelteMap } from "svelte/reactivity";
  import { Markdown } from "../common/index.js";
  import Block from "./Block.svelte";
  import { setWorkbookContext } from "./context.js";

  let { filePath, scrollTop = 0, service, composer, setTitle } = $props();

  let model = $state.raw(null);
  const opened = new SvelteMap(); // rows the person opened or closed, kept across redraws
  let askStep = $state(null); // the step the next message is about, if any
  let scroller;
  let drawn = false;
  const sendKeys = /Mac/.test(navigator.platform) ? "⌘↩" : "Ctrl+Enter";

  const isOpen = (key, byDefault) => (opened.has(key) ? opened.get(key) : byDefault);
  const setOpen = (key, open) => opened.set(key, open);
  const onLink = (href) => service.openLink(filePath, href);

  function ask(stepId) {
    askStep = stepId;
    composer.focus();
  }

  setWorkbookContext({
    get model() {
      return model;
    },
    isOpen,
    setOpen,
    onLink,
    onRun: (id) => service.runStep(filePath, id),
    onAsk: ask,
  });

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

  // ⌘↩ in the message box sends, as the Send button does.
  $effect(() => {
    const sub = composer.onSubmit(send);
    return () => sub.dispose();
  });

  export function serialize() {
    return { scrollTop: scroller?.scrollTop ?? 0 };
  }

  function send() {
    if (!model || model.error || model.locked) return;
    if (service.sendMessage(filePath, composer.getText(), askStep)) {
      composer.clear();
      askStep = null;
    }
  }

  const onTask = $derived(
    model && !model.error && !model.locked ? (index, wasChecked) => service.toggleTask(filePath, index, wasChecked) : null,
  );
</script>

<div class="view">
  <div class="scroller" bind:this={scroller}>
    <div class="workbook">
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
        <div class="markdown">
          <Markdown md={model.markdown} {onLink} tasks={model.tasks} {onTask} inserts={{ nonce: model.nonce, component: Block }} />
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
      <button type="button" class="btn preset-filled-primary-500" disabled={!model || model.error || model.locked} onclick={send}>
        Send
      </button>
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
