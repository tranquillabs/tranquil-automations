<script>
  // A step: its script, what the script may do, its source, Run, and Ask about this step. The
  // source starts open when the step hasn't run yet or its script changed since it ran.
  let { run, isOpen, setOpen, onRun, onAsk } = $props();
  const sourceKey = $derived(`${run.key}:source`);
</script>

<div class="card my-3 border p-3 {run.refused ? 'preset-tonal-error border-error-500' : 'border-surface-200-800'}">
  <div class="flex flex-wrap items-center gap-2">
    <code>{run.path ?? "(no script)"}</code>
    {#if run.grants}
      <span class="badge {run.grants.error ? 'preset-tonal-error' : 'preset-tonal-surface'}" title={run.grants.detail}>
        {run.grants.summary}
      </span>
    {/if}
    {#if run.changed}
      <span class="badge preset-tonal-warning">script changed since this run</span>
    {/if}
    {#if !run.refused}
      <span class="ml-auto flex gap-2">
        <button type="button" class="btn btn-sm preset-tonal-surface" onclick={() => onAsk(run.id)}>Ask about this step</button>
        <button type="button" class="btn btn-sm preset-filled-primary-500" disabled={!run.canRun} onclick={() => onRun(run.id)}>
          {run.running ? "Running…" : "Run"}
        </button>
      </span>
    {/if}
  </div>
  {#if run.refused}
    <p class="mt-2">{run.refused}</p>
  {:else}
    <details
      class="mt-2"
      open={isOpen(sourceKey, !run.hasRun || run.changed)}
      ontoggle={(e) => setOpen(sourceKey, e.currentTarget.open)}
    >
      <summary class="text-surface-700-300 cursor-pointer">source</summary>
      <pre><code>{run.source}</code></pre>
    </details>
  {/if}
</div>
