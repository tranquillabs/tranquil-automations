// What the workbook service (../service.ts) is given, and the models it hands the view. Types
// only. The service gets Pulsar and the rest of the package passed in (ServiceDeps), so it is
// typed against just the parts it uses and can be tested with stand-ins.
import type { ActivePhase } from "./run-machine.ts";

export interface Disposable {
  dispose(): void;
}

/** The parts of a Pulsar text editor the service reads. */
export interface EditorLike {
  getPath(): string | undefined;
  isModified(): boolean;
  onDidChangeModified(fn: () => void): Disposable;
}

export interface NoticeOptions {
  detail?: string;
  dismissable?: boolean;
}

/** The parts of Pulsar's `atom` the service uses. */
export interface PulsarLike {
  getConfigDirPath(): string;
  project: { relativizePath(p: string): [string | null, string] };
  workspace: {
    getTextEditors(): EditorLike[];
    observeTextEditors(fn: (editor: EditorLike) => void): Disposable;
    open(uri: string): Promise<unknown>;
  };
  notifications: {
    addWarning(message: string, options?: NoticeOptions): unknown;
    addError(message: string, options?: NoticeOptions): unknown;
  };
}

/** One page action a run recorded, without values (ADR-0026). */
export interface ActionEntry {
  verb: string;
  target?: string;
  site?: string;
  outcome: string;
  ms: number;
}

/** A run's record (lib/run-manager.js), as far as the service reads it. */
export interface RunRecord {
  runId: string;
  scriptPath: string;
  trigger: string;
  state: string;
  startedAt: number;
  endedAt?: number | null;
  output?: string;
  actions?: ActionEntry[];
  result?: unknown;
}

/** The run manager (lib/run-manager.js), as far as the service uses it. */
export interface RunManagerLike {
  /** The new run's id, or null when it was refused (its record arrives through onDidStartRun first). */
  run(options: { scriptPath: string; trigger: string }): Promise<string | null>;
  whenDone(runId: string): Promise<RunRecord>;
  onDidStartRun(fn: (record: RunRecord) => void): Disposable;
}

/** A script's grants (lib/permissions.js), as far as the run card's summary reads them. */
export interface Grants {
  browser?: boolean;
  "page-js"?: boolean;
  submit?: boolean;
  forms?: boolean;
  tabs?: boolean;
  clipboard?: boolean;
  sites?: string[];
  read: string[];
  write: string[];
  net: string[];
  run: string[];
}

/** What the loader (lib/workbook-pane.js) passes the service. */
export interface ServiceDeps {
  pulsar: PulsarLike;
  /** The run manager once the package has activated; null before. */
  runManager(): RunManagerLike | null;
  runText(run: RunRecord): string;
  stateLabels: Readonly<Record<string, string>>;
  formatDuration(ms: number): string;
  parseHeader(source: string): { grants: Grants };
  renderGrants(grants: Grants): string[];
}

// --- Models: what the view draws, plain data ---------------------------------------------------

/** A step's script as its run card shows it: what it may do, and its source. */
export interface ScriptModel {
  grants: { summary: string; detail: string; error: boolean };
  source: string;
}

/**
 * Where a step stands, one kind per thing its run card draws. `refused`: it can't run (a missing
 * id, a path outside the project, no script), and the card says why. `new`: it hasn't run yet.
 * `current`: its last output came from the script as it is now. `changed`: the script changed
 * since then. `running`: it's in a run, at `phase`.
 */
export type StepState =
  | { kind: "refused"; reason: string }
  | { kind: "new" | "current" | "changed"; script: ScriptModel }
  | { kind: "running"; phase: ActivePhase; script: ScriptModel };

export interface RunModel {
  kind: "run";
  key: string;
  id: string | undefined;
  path: string | null;
  state: StepState;
}

export interface FileModel {
  kind: "file";
  key: string;
  path: string | null;
  state: string;
  error: boolean;
  text?: string;
}

/** A run's output that Tranquil signed. */
export interface OutputModel {
  kind: "output";
  key: string;
  script: string;
  state: string;
  tone: "success" | "error" | "warning" | "surface";
  time: string;
  duration: string;
  text: string;
  result?: unknown;
  hasResult: boolean;
}

/** One row of the conversation: the person's signed message, or the LLM's reply (Markdown). */
export interface EntryModel {
  kind: "message" | "reply";
  key: string;
  time: string;
  summary: string;
  body: string;
  startOpen: boolean;
}

/** An output or message whose signature doesn't check out. */
export interface UnverifiedModel {
  kind: "unverified";
  label: string;
  body: string;
}

export type BlockModel = RunModel | FileModel | OutputModel | EntryModel | UnverifiedModel;

export type WorkbookModel =
  | { title: string; error: string }
  | {
    title: string;
    error?: undefined;
    warnings: string[];
    /** An editor holds unsaved changes to the workbook, so nothing may write it. */
    locked: boolean;
    /** Each task's checked state, in document order. */
    tasks: boolean[];
    /** The body as Markdown, each block a paragraph holding `WB<nonce>N<index>`. */
    markdown: string;
    nonce: string;
    /** Every block's model, by its index in the document. */
    blocks: BlockModel[];
  };

export interface WorkbookService {
  watchWorkbook(filePath: string, onModel: (model: WorkbookModel) => void): () => void;
  runStep(filePath: string, stepId: string): Promise<void>;
  toggleTask(filePath: string, index: number, wasChecked: boolean): void;
  sendMessage(filePath: string, text: string, stepId?: string | null): boolean;
  openLink(filePath: string, href: string): void;
}
