// The submit guard's decision (ADR-0026): a submission needs the `submit` grant and a yes to the
// run's most recent ui.confirm, so a script that never asks, or asks and submits after a no, is
// refused like one without `submit`.
import { assertEquals } from "jsr:@std/assert@^1";
import { canSubmit, recordConfirm, submitNeeds } from "tranquil-automations/deno/guard.ts";

Deno.test("a submission needs the submit grant and a yes to the most recent ui.confirm", () => {
  try {
    Deno.env.set("TRANQUIL_GRANTS", "submit,forms,tabs");
    assertEquals(submitNeeds(), "a yes from ui.confirm", "never asked");
    assertEquals(canSubmit(), false);

    recordConfirm(false);
    assertEquals(submitNeeds(), "a yes from ui.confirm", "asked, and the person said no");

    recordConfirm(true);
    assertEquals(submitNeeds(), null);
    assertEquals(canSubmit(), true);

    recordConfirm(false);
    assertEquals(canSubmit(), false, "a later no takes the yes back");

    Deno.env.set("TRANQUIL_GRANTS", "forms,tabs");
    recordConfirm(true);
    assertEquals(submitNeeds(), "the submit permission", "a yes is not enough without the grant");
  } finally {
    Deno.env.delete("TRANQUIL_GRANTS");
    recordConfirm(false);
  }
});
