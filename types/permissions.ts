// What lib/permissions.js exports, as far as the workbook service and the tests use it. The module
// is plain JavaScript, so its shapes are declared here for the TypeScript that loads it. Types only.
import type { Grants } from "../ui/workbook/types/service.ts";

export interface PermissionsModule {
  parseHeader(source: string): { grants: Grants; timeoutMs: number | null };
  renderGrants(grants: Grants): string[];
  /** The names the runner sets in every run's environment (deno/run-env.ts has the typed list). */
  ENV_NAMES: readonly string[];
}
