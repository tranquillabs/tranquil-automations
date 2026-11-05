"use babel";

// Opens a `*.workbook.md` as a workbook pane (ADR-0030, ADR-0032). The pane is Svelte, built from
// ui/workbook into dist/; it's loaded when the first workbook opens, so a problem with the build
// affects workbooks only, not the rest of the package.

const fs = require("fs");
const path = require("path");
const service = require("./workbook-service.js");

const DESERIALIZER = "TranquilWorkbookView";

let built = null;
function workbookUi() {
  built ??= {
    workbookPane: require("../dist/workbook-ui.js").workbookPane,
    css: fs.readFileSync(path.join(__dirname, "..", "dist", "workbook-ui.css"), "utf8"),
  };
  return built;
}

/** A local file path ending in .workbook.md. URLs (with a scheme) never match. */
const isWorkbookPath = (uri) => typeof uri === "string" && path.isAbsolute(uri) && uri.endsWith(".workbook.md");

/** A workbook pane for `saved` (`filePath`, and `scrollTop` when restoring). */
function openWorkbookPane(saved) {
  const { workbookPane, css } = workbookUi();
  return workbookPane(saved, { service, css, deserializer: DESERIALIZER });
}

module.exports = { DESERIALIZER, isWorkbookPath, openWorkbookPane };
