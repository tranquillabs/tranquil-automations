<script>
  // An image in rendered Markdown shows its alt text and loads nothing: an image from a page or an
  // LLM could report back to whoever serves it.
  let { alt } = $props();
</script>

{#if alt}<span class="image-alt">{alt}</span>{/if}
