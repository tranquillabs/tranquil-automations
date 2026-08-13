// Consent prompt for extra @permissions grants (ADR-0022 specific 2). Approvals are stored in
// config `tranquil-automations.approvedScriptPermissions` as an array of
// { path, permissions, approvedAt } — an array because script paths contain dots and cannot be
// config key segments. Any textual diff between the current declaration and the stored one
// re-prompts. Dismissing the prompt is a cancel.
const { hasGrants, canonicalGrants, renderGrants } = require("./permissions.js");

const CONFIG_KEY = "tranquil-automations.approvedScriptPermissions";

function storedApproval(scriptPath) {
  const all = atom.config.get(CONFIG_KEY) || [];
  return all.find((e) => e && e.path === scriptPath) || null;
}

function storeApproval(scriptPath, permissions) {
  const all = (atom.config.get(CONFIG_KEY) || []).filter((e) => e && e.path !== scriptPath);
  all.push({ path: scriptPath, permissions, approvedAt: new Date().toISOString() });
  atom.config.set(CONFIG_KEY, all);
}

// Resolves true when the run may proceed. No prompt when the script declares no extra grants,
// or when the declaration matches the stored approval for this path.
function ensureConsent(scriptPath, grants) {
  if (!hasGrants(grants)) return Promise.resolve(true);

  const wanted = canonicalGrants(grants);
  const existing = storedApproval(scriptPath);
  if (existing && existing.permissions === wanted) return Promise.resolve(true);

  return new Promise((resolve) => {
    let settled = false;
    const settle = (ok) => {
      if (settled) return;
      settled = true;
      resolve(ok);
    };
    const path = require("path");
    const notification = atom.notifications.addWarning(
      `Automation requests extra permissions`,
      {
        detail:
          `${path.basename(scriptPath)} declares:\n\n` +
          renderGrants(grants)
            .map((l) => `  • ${l}`)
            .join("\n"),
        dismissable: true,
        buttons: [
          {
            text: "Approve and Run",
            onDidClick: () => {
              storeApproval(scriptPath, wanted);
              settle(true);
              notification.dismiss();
            },
          },
          {
            text: "Cancel",
            onDidClick: () => {
              settle(false);
              notification.dismiss();
            },
          },
        ],
      }
    );
    notification.onDidDismiss(() => settle(false));
  });
}

module.exports = { ensureConsent };
