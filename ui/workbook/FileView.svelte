<script>
  // A live view of a data file the workbook names, collapsed to one line.
  let { file, open, onToggle } = $props();
</script>

<details
  class="card border-surface-200-800 my-3 border p-3"
  open={open.has(file.key)}
  ontoggle={(e) => onToggle(file.key, e.currentTarget.open)}
>
  <summary class="cursor-pointer">
    <code>{file.path ?? "(no path)"}</code>
    <span class="ml-2 text-sm {file.error ? 'text-error-500' : 'text-surface-700-300'}">{file.state}</span>
  </summary>
  {#if file.text !== undefined}
    <pre class="mt-2"><code>{file.text}</code></pre>
  {/if}
</details>
