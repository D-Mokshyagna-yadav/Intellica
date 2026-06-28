/**
 * resolveStoragePath.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for where Intellica stores all files.
 *
 * Priority order:
 *  1. INTELLICA_STORAGE_PATH env var  (for Docker / custom deployments)
 *  2. OS Documents folder → ~/Documents/Intellica  (default for dev/prod on any OS)
 *
 * Result on Windows : C:\Users\<username>\Documents\Intellica
 * Result on macOS   : /Users/<username>/Documents/Intellica
 * Result on Linux   : /home/<username>/Documents/Intellica
 */

const fs   = require("fs");
const path = require("path");
const os   = require("os");

let _resolvedPath = null;

function resolveStoragePath() {
  if (_resolvedPath) return _resolvedPath;

  // 1. Explicit override (Docker volume, custom deployment)
  if (process.env.INTELLICA_STORAGE_PATH) {
    _resolvedPath = process.env.INTELLICA_STORAGE_PATH;
  } else {
    // 2. OS Documents/Intellica folder
    _resolvedPath = path.join(os.homedir(), "Documents", "Intellica");
  }

  // Ensure the root folder exists
  if (!fs.existsSync(_resolvedPath)) {
    fs.mkdirSync(_resolvedPath, { recursive: true });
  }

  return _resolvedPath;
}

module.exports = resolveStoragePath;
