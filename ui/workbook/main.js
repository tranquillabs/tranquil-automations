// The workbook's UI and service, built into dist/workbook-ui.js and loaded by lib/workbook-pane.js.
import { SveltePane } from "../common/index.js";
import Workbook from "./Workbook.svelte";

export { createWorkbookService } from "./service.ts";

/**
 * The pane a `*.workbook.md` opens in. `saved` is what the pane last saved (its file and scroll);
 * `service` is the workbook service (service.ts); `composer` is the message box the loader made (a
 * Pulsar text editor, slotted in); `css` is the built stylesheet; `deserializer` is the name
 * Pulsar restores the pane by.
 */
export function workbookPane(saved, { service, composer, css, deserializer }) {
  const { filePath, scrollTop = 0 } = saved;
  return new SveltePane({
    component: Workbook,
    props: { filePath, scrollTop, service, composer },
    css,
    className: "tranquil-workbook",
    uri: filePath,
    title: filePath.split(/[\\/]/).pop(),
    iconName: "checklist",
    allowedLocations: ["center", "right"],
    serialize: (state) => ({ deserializer, filePath, ...state }),
    slots: { composer: composer.element },
    onDestroy: composer.destroy,
  });
}
