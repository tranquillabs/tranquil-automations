<script>
  // A run's output, written and signed by Tranquil: which script ran, who ran it, how it ended,
  // when and how long, then what it printed, its actions, and its result as data.
  import ResultView from "./ResultView.svelte";

  let { output } = $props();
  // Whole class names, so the stylesheet build finds them.
  const TONES = {
    success: "preset-tonal-success",
    error: "preset-tonal-error",
    warning: "preset-tonal-warning",
    surface: "preset-tonal-surface",
  };
</script>

<div class="card border-surface-200-800 my-3 border">
  <div class="border-surface-200-800 flex flex-wrap items-center gap-2 border-b px-3 py-2 text-sm">
    <span class="font-semibold">Code output</span>
    <span>{output.script} · run by you</span>
    <span class="badge {TONES[output.tone] ?? TONES.surface}">{output.state}</span>
    <span class="text-surface-700-300">{[output.time, output.duration].filter(Boolean).join(" · ")}</span>
  </div>
  {#if output.text}
    <pre class="m-0 rounded-none"><code>{output.text}</code></pre>
  {/if}
  {#if output.hasResult}
    <div class="px-3 pb-3">
      <ResultView value={output.result} />
    </div>
  {/if}
</div>
