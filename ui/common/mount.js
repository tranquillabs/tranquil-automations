// Mounts a Svelte component in a shadow root on `host`, with the built stylesheet adopted there.
// The app's styles don't reach in and these don't reach out: with `@scope` instead, the app's own
// `.btn` beat Skeleton's, since Tailwind's rules are in cascade layers and unlayered CSS always
// wins (ADR-0032). The host takes the `tranquil-ui` class, which styles/tranquil-ui-theme.less
// gives Skeleton's colors; they inherit into the shadow tree.
import { mount, unmount } from "svelte";

export function mountInShadow(host, Component, props, cssText) {
  host.classList.add("tranquil-ui");
  const shadow = host.attachShadow({ mode: "open" });
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(cssText);
  shadow.adoptedStyleSheets = [sheet];
  const root = document.createElement("div");
  root.className = "tranquil-ui-root";
  shadow.append(root);
  const ui = {
    component: mount(Component, { target: root, props }),
    /**
     * Sets dark or light: the root's `data-mode` for Tailwind's `dark:` variant, and the host's
     * `color-scheme`, which the shadow tree inherits for native controls and scrollbars.
     * @param {"light" | "dark"} mode
     */
    setMode(mode) {
      root.dataset.mode = mode;
      host.style.colorScheme = mode;
    },
    destroy: () => unmount(ui.component),
  };
  return ui;
}
