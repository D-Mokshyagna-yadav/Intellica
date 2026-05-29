const fs = require("fs");
const path = require("path");
const Upload = require("../models/Upload");
const logger = require("./logger");

async function moveUserFolder(user, oldDept) {
  if (!user || !oldDept) return;

  const newDept = String(user.department || "").trim().toUpperCase();
  const oldDeptNorm = String(oldDept).trim().toUpperCase();

  if (oldDeptNorm === newDept) return;

  const basePath = fs.existsSync("/documents") ? "/documents" : path.join(__dirname, "../uploads");
  const role = String(user.role || "FACULTY").trim().toLowerCase();
  const employeeId = String(user.employeeId || user.regId || user._id || "unknown").trim();
  const name = String(user.name || "user").trim().replace(/[^a-zA-Z0-9]/g, "_");
  const empIdName = `${employeeId}_${name}`;

  const oldUserFolderPath = path.join(basePath, "departments", oldDeptNorm, role, empIdName);
  const newUserFolderPath = path.join(basePath, "departments", newDept, role, empIdName);

  if (fs.existsSync(oldUserFolderPath)) {
    const newParentDir = path.dirname(newUserFolderPath);
    if (!fs.existsSync(newParentDir)) {
      fs.mkdirSync(newParentDir, { recursive: true });
    }

    try {
      fs.renameSync(oldUserFolderPath, newUserFolderPath);
      logger.info({ oldUserFolderPath, newUserFolderPath }, "User folder moved successfully");

      if (user.profileImage && user.profileImage.includes(oldDeptNorm)) {
        const oldRel = `departments/${oldDeptNorm}/${role}/${empIdName}/profile`;
        const newRel = `departments/${newDept}/${role}/${empIdName}/profile`;
        user.profileImage = user.profileImage.replace(oldRel, newRel);
        await user.save();
      }

      const uploads = await Upload.find({ faculty: user._id });
      for (const upload of uploads) {
        if (upload.filePath && upload.filePath.includes(oldDeptNorm)) {
          const oldRel = `departments/${oldDeptNorm}/${role}/${empIdName}/uploads`;
          const newRel = `departments/${newDept}/${role}/${empIdName}/uploads`;
          upload.filePath = upload.filePath.replace(oldRel, newRel);
          await upload.save();
        }
      }
    } catch (error) {
      logger.error({ err: error, oldUserFolderPath, newUserFolderPath }, "Failed to move user folder");
    }
  } else {
    logger.warn({ oldUserFolderPath }, "Old user folder path does not exist on disk, creating new folder structure");
    const createUserFolder = require("./createUserFolder");
    createUserFolder(user);
  }
}

module.exports = moveUserFolder;
