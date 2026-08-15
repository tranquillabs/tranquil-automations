// Runner bootstrap (ADR-0022) — the module `deno run` actually executes. The user's
// automation is loaded through here rather than run directly, for one reason: the runtime
// holds open sockets (the RPC bridge, CDP connections) that keep Deno's event loop alive, so
// a script run directly would never exit on its own — it would sit "running" until the
// timeout. This bootstrap runs the script, then exits explicitly.
//
// Pre-loading ./mod.ts statically (part of THIS entry's module graph, so permission-free)
// means the user script's `import "tranquil/automation"` is a cache hit — the dynamic import
// below therefore needs read access only to the script's own directory, keeping --allow-read
// scoped exactly as the run manager computed it (no read grant for the runtime's own files).
import "./mod.ts";

const entry = Deno.env.get("TRANQUIL_ENTRY");
if (!entry) {
  console.error("Runner error: TRANQUIL_ENTRY is not set");
  Deno.exit(1);
}

// A top-level throw in the user module rejects this await. Left uncaught, Deno prints its
// native error (with the real file:line) and exits non-zero — the honest DX the direct-run
// approach gave. On success we exit 0 promptly, abandoning the open sockets (the host tears
// the session down when the socket closes — ADR-0022's "process death revokes everything").
try {
  await import(entry);
} finally {
  // Completion sentinel for debug runs (ADR-0025). A Deno child cannot exit while a V8 inspector
  // is attached, so `Deno.exit(0)` below does not actually end the process during a debug session
  // — the host has to detach first. But the host has no way to observe "the user's top-level
  // finished": no CDP event marks it, and the child is still alive. Without a signal the run sat
  // at "running" forever and its debug controls never went away.
  //
  // A `debugger` statement is exactly that signal, and it is free: with no inspector attached
  // (every ordinary run) it is a no-op, so this costs normal runs nothing. The debug session
  // recognises a pause in this file as "script done" and detaches, which lets the process exit
  // and the run resolve.
  //
  // In `finally` rather than after the await, so a script that throws still reports completion —
  // otherwise a failing debug run would be the one that hangs.
  debugger;
}
Deno.exit(0);
