"use babel";

// Host-side tranquil-rpc capabilities for the tab-bar pane controls. This exposes the *capability*
// for any trusted guest page to self-register its own controls + actions over RPC on
// `tranquilhost:ready`. See pane-controls.js.
//
// A guest calls window.tranquilHost.paneControls.register([{ id, icon, glyph, title, action }])
// where each `action` is a Cap'n Web function stub — calling it here runs the function back in the
// page. `icon` is a codicon name (preferred); `glyph` is a literal Unicode fallback.
// window.tranquilHost.notify(msg) surfaces a host toast (a host-effect a page can't do itself).
//
// RpcTarget MUST come from tranquil-rpc (not a separate `require("capnweb")`): capnweb detects
// capabilities with `instanceof RpcTarget`, so the subclass has to extend the exact class bundled
// into the host runtime.
const { Disposable } = require("atom");
const { ipcRenderer } = require("electron");
const { RpcTarget } = require("tranquil-rpc");
const paneControls = require("./pane-controls.js");
const { notify } = require("./notify.js");

function urlOf(item) {
  return (item && (item.getURL?.() || item.getURI?.())) || "";
}

function hasWebview(item) {
  return !!(item && item.view && item.view.htmlv && item.view.htmlv[0]);
}

// paneControls capability — the page registers control items for its own pane. ctx = the
// per-session { item, webview, url, subscriptions } from tranquil-rpc.
class PaneControlsCap extends RpcTarget {
  constructor(ctx) {
    super();
    this.ctx = ctx;
  }

  register(items) {
    // Capnweb disposes stubs passed as call arguments when the call returns, so retain a dup() of
    // each action stub that we own for the pane control's lifetime, and dispose the dups on
    // teardown. Without this, clicking a button hits "RpcImportHook was already disposed".
    const retained = [];
    const defs = items.map((d) => {
      const action = d.action.dup();
      retained.push(action);
      return {
        id: d.id,
        icon: d.icon,
        glyph: d.glyph,
        title: d.title,
        // Invoke the page-side stub; catch so a failed action can't surface as an unhandled
        // promise rejection (the click handler in pane-controls.js is synchronous).
        action: () =>
          Promise.resolve(action()).catch((e) =>
            console.error("[tranquil-automations] pane control stub failed:", d.id, e)
          ),
      };
    });

    // Match only this session's item, so a page can only put controls on its own pane.
    const reg = paneControls.register((it) => it === this.ctx.item, defs);

    // Tear the registration + retained stubs down with the session (page close/reload) — otherwise
    // reloads accumulate duplicate buttons holding dead stubs.
    this.ctx.subscriptions.add(
      new Disposable(() => {
        reg.dispose();
        for (const s of retained) {
          try {
            s[Symbol.dispose]();
          } catch (e) {
            /* ignore */
          }
        }
      })
    );
    return true; // return data, never the raw Disposable
  }
}

// Register the capabilities on the tranquil-rpc registry. Call at activate, before any trusted
// page connects (HostApi is built lazily per session, so registration just needs to precede the
// first connection).
//
// A factory returning a bare function → the guest calls it directly (host.notify(msg)); a factory
// returning an RpcTarget → a namespace (host.paneControls.register(...)). So `notify` is a plain
// function (page-triggered host toast) and `paneControls` is a namespace.
function registerCapabilities(rpc) {
  rpc.registerCapability("paneControls", (ctx) => new PaneControlsCap(ctx));
  rpc.registerCapability("notify", () => (msg) => {
    notify("addInfo", msg);
    return true;
  });
}

// Host-defined default controls for untrusted browser pages (remote http(s):// or file:// outside a
// trusted root) — these get no RPC runtime and can't self-register, so give them a URL-bar toggle.
// Trusted pages never match (they self-register); non-browser items (editors) have no webview and
// match nothing, so they show no cluster. Returns a Disposable.
function registerDefaultRemoteControls(rpc) {
  return paneControls.register(
    (item) => hasWebview(item) && !rpc.isTrusted(urlOf(item)),
    [
      {
        id: "toggle-url-bar",
        icon: "eye",
        title: "Show/Hide URL Bar",
        // Act on this pane's own browser item (works in the center or a dock),
        // rather than dispatching the center-only workspace command.
        action: (hostCtx) => hostCtx.item?.view?.toggleURLBar?.(),
      },
      {
        id: "clear-site-cookies",
        // No cookie glyph in the codicon set — inline line-drawing SVG
        // (currentColor, so it themes like the font glyphs): outline with
        // chocolate-chip dots.
        svg:
          '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">' +
          '<circle cx="8" cy="8" r="6.25" stroke="currentColor" stroke-width="1.2"/>' +
          '<circle cx="5.8" cy="6.1" r="0.9" fill="currentColor"/>' +
          '<circle cx="10" cy="5.6" r="0.9" fill="currentColor"/>' +
          '<circle cx="10.4" cy="9.8" r="0.9" fill="currentColor"/>' +
          '<circle cx="6.3" cy="10.3" r="0.9" fill="currentColor"/>' +
          '<circle cx="8.2" cy="8" r="0.9" fill="currentColor"/>' +
          "</svg>",
        title: "Clear cookies for this site",
        // Cookie jars live in the main process (per-window session partitions),
        // so the actual clearing happens there ('clear-site-cookies' in
        // cz-init.js); reload after so the page re-renders logged-out state.
        action: (hostCtx) => {
          const wv = hostCtx.webview;
          const url = wv?.getURL?.() || urlOf(hostCtx.item);
          if (!/^https?:/.test(url)) {
            notify("addWarning", "No site to clear cookies for");
            return;
          }
          ipcRenderer
            .invoke("clear-site-cookies", { partition: wv.partition, url })
            .then((count) => {
              notify(
                "addInfo",
                `Cleared ${count} cookie${count === 1 ? "" : "s"} for ${new URL(url).host}`
              );
              wv.reload();
            })
            .catch((e) =>
              console.error("[tranquil-automations] clear-site-cookies failed:", e)
            );
        },
      },
    ]
  );
}

module.exports = { registerCapabilities, registerDefaultRemoteControls };
