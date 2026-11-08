<script>
  // A task-list checkbox. It's live only when the caller takes clicks and its own state for this
  // task matches what the box shows; otherwise it's read-only. A click asks the caller to change
  // the task, and the box shows the new state when the caller's next draw does.
  import { getMarkdownContext } from "./context.ts";

  let { type, checked = false, taskIndex } = $props();
  const ctx = getMarkdownContext();

  const live = $derived(
    type === "checkbox" && ctx.onTask !== null && typeof taskIndex === "number" && ctx.tasks[taskIndex] === Boolean(checked),
  );

  function onclick(e) {
    e.preventDefault();
    if (live) ctx.onTask(taskIndex, Boolean(checked));
  }
</script>

{#if type === "checkbox"}
  <input type="checkbox" checked={Boolean(checked)} disabled={!live} {onclick} />
{/if}
