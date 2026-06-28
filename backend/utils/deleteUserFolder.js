const fs = require("fs");
const path = require("path");
const logger = require("./logger");

function deleteUserFolder(user) {
  if (!user) return;

  const resolveStoragePath = require("./resolveStoragePath");
  const basePath = resolveStoragePath();
  const dept = String(user.department || "COMMON").trim().toUpperCase();
  const role = String(user.role || "FACULTY").trim().toLowerCase();
  const employeeId = String(user.employeeId || user.regId || user._id || "unknown").trim();
  const name = String(user.name || "user").trim().replace(/[^a-zA-Z0-9]/g, "_");
  const empIdName = `${employeeId}_${name}`;

  const userFolderPath = path.join(basePath, "departments", dept, role, empIdName);

  if (fs.existsSync(userFolderPath)) {
    try {
      fs.rmSync(userFolderPath, { recursive: true, force: true });
      logger.info({ userFolderPath }, "User folder deleted recursively");
    } catch (error) {
      logger.error({ err: error, userFolderPath }, "Failed to delete user folder");
    }
  } else {
    logger.warn({ userFolderPath }, "User folder path does not exist, skipped deletion");
  }
}

module.exports = deleteUserFolder;
