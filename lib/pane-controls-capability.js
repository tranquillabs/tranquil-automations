"use babel";

// Host-side tranquil-rpc capabilities for the tab-bar pane controls. Trusted guest pages (our
// business mockups) self-register their own controls + actions over RPC on `tranquilhost:ready`,
// instead of the host hardcoding them per file. See ../mockups/*.html and pane-controls.js.
//
// A guest calls window.tranquilHost.paneControls.register([{ id, glyph, title, action }]) where
// each `action` is a Cap'n Web function stub — calling it here runs the function back in the page.
// window.tranquilHost.notify(msg) surfaces a host toast (a host-effect a page can't do itself).
//
// RpcTarget MUST come from tranquil-rpc (not a separate `require("capnweb")`): capnweb detects
// capabilities with `instanceof RpcTarget`, so the subclass has to extend the exact class bundled
// into the host runtime.
const { Disposable } = require("atom");
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
// trusted root) — these get no RPC runtime and can't self-register, so give them a functional
// reload instead of the static placeholder mimics. Trusted pages never match (they self-register);
// non-browser items (editors) have no webview and fall through to the placeholders. Returns a
// Disposable.
function registerDefaultRemoteControls(rpc) {
  return paneControls.register(
    (item) => hasWebview(item) && !rpc.isTrusted(urlOf(item)),
    [
      {
        id: "reload",
        glyph: "⟳",
        title: "Reload",
        action: (hostCtx) => hostCtx.executeJavaScript("location.reload()"),
      },
    ]
  );
}

module.exports = { registerCapabilities, registerDefaultRemoteControls };
