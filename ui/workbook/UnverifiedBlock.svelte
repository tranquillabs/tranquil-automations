<script>
  // An output, message or reply. Outputs and messages are trusted only when Tranquil's signature
  // checks out, which arrives in step 2; until then each is plain text, labelled as unverified.
  let { block } = $props();
</script>

<div class="card border-surface-300-700 my-3 border border-dashed p-3">
  <div class="text-surface-700-300 text-sm">{block.label}</div>
  <pre class="mt-1"><code>{block.body}</code></pre>
</div>
