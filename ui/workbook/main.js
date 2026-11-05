// The workbook view's UI, built into dist/workbook-ui.js and opened by lib/workbook-pane.js.
import { SveltePane } from "../common/index.js";
import Workbook from "./Workbook.svelte";

/**
 * The pane a `*.workbook.md` opens in. `saved` is what the pane last saved (its file and scroll);
 * `service` is lib/workbook-service.js, which does the work that needs Node or Pulsar; `css` is the
 * built stylesheet; `deserializer` is the name Pulsar restores the pane by.
 */
export function workbookPane(saved, { service, css, deserializer }) {
  const { filePath, scrollTop = 0 } = saved;
  return new SveltePane({
    component: Workbook,
    props: { filePath, scrollTop, service },
    css,
    className: "tranquil-workbook",
    uri: filePath,
    title: filePath.split(/[\\/]/).pop(),
    iconName: "checklist",
    allowedLocations: ["center", "right"],
    serialize: (state) => ({ deserializer, filePath, ...state }),
  });
}
