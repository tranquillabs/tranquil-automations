<script>
  // A step: its script, what the script may do, and its source. Running it comes in step 2.
  let { run, open, onToggle } = $props();
  const sourceKey = $derived(`${run.key}:source`);
</script>

<div class="card my-3 border p-3 {run.refused ? 'preset-tonal-error border-error-500' : 'border-surface-200-800'}">
  <div class="flex flex-wrap items-baseline gap-2">
    <code>{run.path ?? "(no script)"}</code>
    {#if run.grants}
      <span class="badge {run.grants.error ? 'preset-tonal-error' : 'preset-tonal-surface'}" title={run.grants.detail}>
        {run.grants.summary}
      </span>
    {/if}
  </div>
  {#if run.refused}
    <p class="mt-2">{run.refused}</p>
  {:else}
    <details class="mt-2" open={open.has(sourceKey)} ontoggle={(e) => onToggle(sourceKey, e.currentTarget.open)}>
      <summary class="text-surface-700-300 cursor-pointer">source</summary>
      <pre><code>{run.source}</code></pre>
    </details>
  {/if}
</div>
