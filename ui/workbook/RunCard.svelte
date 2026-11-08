<script>
  // A step: its script, what the script may do, its source, Run, and Ask about this step. What it
  // draws follows the step's state (StepState in types/service.ts): a refused step says why and
  // nothing else, and the source starts open when the step is new or its script changed since it
  // ran. Run is offered when the run machine allows it from the step's phase (run-machine.ts) and
  // no editor holds unsaved changes to the workbook.
  import { can } from "./run-machine.ts";

  let { run, locked, isOpen, setOpen, onRun, onAsk } = $props();
  const state = $derived(run.state);
  const phase = $derived(state.kind === "running" ? state.phase : "idle");
  const sourceKey = $derived(`${run.key}:source`);
  const RUN_LABELS = { idle: "Run", starting: "Starting…", running: "Running…", writing: "Running…" };
</script>

<div class="card my-3 border p-3 {state.kind === 'refused' ? 'preset-tonal-error border-error-500' : 'border-surface-200-800'}">
  <div class="flex flex-wrap items-center gap-2">
    <span class="font-mono text-sm">{run.path ?? "(no script)"}</span>
    {#if state.kind !== "refused"}
      <span class="badge {state.script.grants.error ? 'preset-tonal-error' : 'preset-filled-surface-200-800'}" title={state.script.grants.detail}>
        {state.script.grants.summary}
      </span>
      {#if state.kind === "changed"}
        <span class="badge preset-tonal-warning">script changed since this run</span>
      {/if}
      <span class="ml-auto flex gap-2">
        <button type="button" class="btn btn-sm preset-tonal-surface" onclick={() => onAsk(run.id)}>Ask about this step</button>
        <button type="button" class="btn btn-sm preset-filled-primary-500" disabled={locked || !can(phase, "run")} onclick={() => onRun(run.id)}>
          {RUN_LABELS[phase]}
        </button>
      </span>
    {/if}
  </div>
  {#if state.kind === "refused"}
    <p class="mt-2">{state.reason}</p>
  {:else}
    <details
      class="mt-2"
      open={isOpen(sourceKey, state.kind === "new" || state.kind === "changed")}
      ontoggle={(e) => setOpen(sourceKey, e.currentTarget.open)}
    >
      <summary class="text-surface-700-300 cursor-pointer">source</summary>
      <pre><code>{state.script.source}</code></pre>
    </details>
  {/if}
</div>
