// A Pulsar pane item whose content is a Svelte component, drawn in a shadow root (mount.js). It
// holds everything Pulsar asks of a pane item, so a feature brings only its component, and
// nothing here knows about any one feature. The component gets `setTitle(title)` as a prop and may
// export `serialize()`, whose result is saved with the pane. Elements Pulsar draws, such as a text
// editor, need the app's own stylesheets, so they stay outside the shadow root: pass them as
// `slots` and the component shows each with a `<slot name="…">`.

import { mountInShadow } from "./mount.js";

/** A minimal event emitter: `on` returns what Pulsar expects of a subscription (a disposable). */
function emitter() {
  const handlers = new Map();
  return {
    on(name, fn) {
      if (!handlers.has(name)) handlers.set(name, new Set());
      handlers.get(name).add(fn);
      return { dispose: () => handlers.get(name)?.delete(fn) };
    },
    emit(name, value) {
      for (const fn of handlers.get(name) ?? []) fn(value);
    },
    clear: () => handlers.clear(),
  };
}

export class SveltePane {
  /**
   * `component` and `props` are what to draw; `css` is the built stylesheet; `className` goes on
   * the pane's element. `uri`, `title`, `iconName` and `allowedLocations` answer Pulsar's
   * questions, and `serialize(saved)` builds the saved state (with its `deserializer`) from what
   * the component's own `serialize()` returned. `slots` maps slot names to light-DOM elements, and
   * `onDestroy` runs when the pane closes.
   */
  constructor({
    component,
    props = {},
    css,
    className,
    uri,
    title,
    iconName,
    allowedLocations,
    serialize,
    slots = {},
    onDestroy,
  }) {
    this.events = emitter();
    this.onDestroyed = onDestroy;
    this.uri = uri;
    this.title = title;
    this.iconName = iconName;
    this.allowedLocations = allowedLocations;
    this.serializeWith = serialize;
    this.pending = true; // Pulsar's preview-tab state, ended by the first interaction

    this.element = document.createElement("div");
    if (className) this.element.className = className;
    this.element.tabIndex = -1;
    this.element.addEventListener("mousedown", () => this.terminatePendingState(), { once: true });
    for (const [name, el] of Object.entries(slots)) {
      el.slot = name;
      this.element.append(el);
    }
    this.ui = mountInShadow(this.element, component, { ...props, setTitle: (t) => this.setTitle(t) }, css);
    this.themes = atom.themes.onDidChangeActiveThemes(() => this.ui.syncMode());
  }

  setTitle(title) {
    if (!title || title === this.title) return;
    this.title = title;
    this.events.emit("did-change-title", title);
  }

  getTitle() {
    return this.title;
  }

  onDidChangeTitle(fn) {
    return this.events.on("did-change-title", fn);
  }

  getURI() {
    return this.uri;
  }

  getPath() {
    return this.uri;
  }

  getIconName() {
    return this.iconName;
  }

  getAllowedLocations() {
    return this.allowedLocations;
  }

  terminatePendingState() {
    if (!this.pending) return;
    this.pending = false;
    this.events.emit("did-terminate-pending-state");
  }

  onDidTerminatePendingState(fn) {
    return this.events.on("did-terminate-pending-state", fn);
  }

  serialize() {
    return this.serializeWith ? this.serializeWith(this.ui.component.serialize?.() ?? {}) : undefined;
  }

  onDidDestroy(fn) {
    return this.events.on("did-destroy", fn);
  }

  destroy() {
    this.themes.dispose();
    this.ui.destroy();
    this.onDestroyed?.();
    this.element.remove();
    this.events.emit("did-destroy");
    this.events.clear();
  }
}
