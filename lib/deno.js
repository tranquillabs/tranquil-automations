// Deno binary resolution (Phase 1, dev mode): config override → PATH → common install dirs.
// Packaged builds will insert a bundled binary ahead of PATH (ADR-0023 specific 8).
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFile } = require("child_process");

let cachedPath = null;

function isExecutable(p) {
  try {
    fs.accessSync(p, fs.constants.X_OK);
    return fs.statSync(p).isFile();
  } catch (e) {
    return false;
  }
}

function whichDeno() {
  return new Promise((resolve) => {
    execFile("/usr/bin/which", ["deno"], (err, stdout) => {
      const p = !err && stdout.trim();
      resolve(p && isExecutable(p) ? p : null);
    });
  });
}

// Resolve the deno binary to spawn. Resolves to an absolute path or null.
async function resolveDeno() {
  const configured = atom.config.get("tranquil-automations.denoPath");
  if (configured) {
    if (isExecutable(configured)) return configured;
    return null; // an explicit override that doesn't work should fail loudly, not fall through
  }
  if (cachedPath && isExecutable(cachedPath)) return cachedPath;

  const found =
    (await whichDeno()) ||
    [
      path.join(os.homedir(), ".deno", "bin", "deno"),
      "/opt/homebrew/bin/deno",
      "/usr/local/bin/deno",
    ].find(isExecutable) ||
    null;

  cachedPath = found;
  return found;
}

function denoCacheDir() {
  return path.join(os.homedir(), ".tranquil", "deno-cache");
}

module.exports = { resolveDeno, denoCacheDir };
