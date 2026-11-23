// What started a run, as the runner records it (a run's `trigger`) and hands the script
// (`TRANQUIL_TRIGGER`): built and read here, and nowhere else. The SDK can't load this file, so it
// keeps its own typed parser (deno/context.ts parseTrigger), which test/lib/triggers_test.ts
// holds to this one. Plain CommonJS with no Pulsar, so the tests load it directly.

// The module's shape is TriggersModule in types/triggers.ts.
/** @typedef {import("../types/triggers.ts").RunTrigger} RunTrigger */
/** @typedef {import("../types/triggers.ts").TriggerString} TriggerString */
/** @typedef {import("../types/triggers.ts").ValuedTriggerKind} ValuedTriggerKind */

/**
 * A run the person started from a script's editor or the palette.
 * @type {TriggerString}
 */
const MANUAL = "manual";

/**
 * A debug session (ADR-0025).
 * @type {TriggerString}
 */
const DEBUG = "debug";

/**
 * A registered automation's palette command.
 * @param {string} name
 * @returns {TriggerString}
 */
const commandTrigger = (name) => `command:${name}`;

/**
 * A page that loaded and matched a script's URL trigger.
 * @param {string} url
 * @returns {TriggerString}
 */
const urlTrigger = (url) => `url:${url}`;

/**
 * A workbook step's Run.
 * @param {string} path the workbook's path
 * @returns {TriggerString}
 */
const workbookTrigger = (path) => `workbook:${path}`;

/**
 * How each kind reads the value after its colon, as in deno/context.ts.
 * @type {import("../types/triggers.ts").TriggerReaders}
 */
const READERS = {
  command: (name) => ({ kind: "command", name }),
  url: (url) => ({ kind: "url", url }),
  workbook: (path) => ({ kind: "workbook", path, folder: path.replace(/\.workbook\.md$/, "") }),
};

/**
 * @param {string} kind
 * @returns {kind is ValuedTriggerKind}
 */
const isValued = (kind) => Object.hasOwn(READERS, kind);

/**
 * Reads a trigger string, `<kind>:<value>`, or `debug`. Anything else reads as manual, as the SDK
 * reads it (and the SDK reads `debug` as manual too).
 * @param {string | undefined} raw
 * @returns {RunTrigger}
 */
function parseTrigger(raw) {
  if (raw === DEBUG) return { kind: "debug" };
  const [kind, ...rest] = (raw || "").split(":");
  const value = rest.join(":"); // everything after the first colon, a URL's own colons included
  return isValued(kind) ? READERS[kind](value) : { kind: "manual" };
}

/**
 * Whether a person started the run and can be asked (ui.confirm): every kind but a page load.
 * @param {string | undefined} raw
 * @returns {boolean}
 */
const isAttended = (raw) => parseTrigger(raw).kind !== "url";

module.exports = { MANUAL, DEBUG, commandTrigger, urlTrigger, workbookTrigger, parseTrigger, isAttended };
