<script>
  // A run's result drawn as data: a list of objects as a table, one object as a key/value list,
  // anything else as JSON. Every value is shown as text.
  let { value } = $props();

  const isRecord = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
  const rows = $derived(Array.isArray(value) && value.length > 0 && value.every(isRecord) ? value : null);
  const columns = $derived(rows ? [...new Set(rows.flatMap((r) => Object.keys(r)))] : []);
  const cell = (v) => (v === null || v === undefined ? "" : typeof v === "object" ? JSON.stringify(v) : String(v));
</script>

<div class="text-sm font-semibold">Result</div>
{#if rows}
  <div class="table-wrap">
    <table class="table">
      <thead>
        <tr>{#each columns as column}<th>{column}</th>{/each}</tr>
      </thead>
      <tbody>
        {#each rows as row}
          <tr>{#each columns as column}<td>{cell(row[column])}</td>{/each}</tr>
        {/each}
      </tbody>
    </table>
  </div>
{:else if isRecord(value)}
  <table class="table">
    <tbody>
      {#each Object.entries(value) as [name, v]}
        <tr><th class="text-left">{name}</th><td>{cell(v)}</td></tr>
      {/each}
    </tbody>
  </table>
{:else}
  <pre><code>{JSON.stringify(value, null, 2)}</code></pre>
{/if}
