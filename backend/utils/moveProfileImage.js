const fs = require("fs");
const path = require("path");
const createUserFolder = require("./createUserFolder");
const logger = require("./logger");

async function moveProfileImage(user) {
  if (!user || !user.profileImage || user.profileImage.includes("departments/")) {
    return;
  }

  const filename = path.basename(user.profileImage);
  const folders = createUserFolder(user);
  if (!folders) return;

  const basePath = fs.existsSync("/documents") ? "/documents" : path.join(__dirname, "..", "uploads");
  let oldPath = path.join(basePath, "temp", filename);
  if (!fs.existsSync(oldPath)) {
    oldPath = path.join(basePath, filename);
  }
  
  const newPath = path.join(folders.profile, filename);

  if (fs.existsSync(oldPath)) {
    try {
      fs.renameSync(oldPath, newPath);
      
      const role = String(user.role || "FACULTY").trim().toLowerCase();
      const employeeId = String(user.employeeId || user.regId || user._id || "unknown").trim();
      const name = String(user.name || "user").trim().replace(/[^a-zA-Z0-9]/g, "_");
      const empIdName = `${employeeId}_${name}`;
      const dept = String(user.department || "COMMON").trim().toUpperCase();

      user.profileImage = `departments/${dept}/${role}/${empIdName}/profile/${filename}`;
      await user.save();
      logger.info({ userId: user._id, profileImage: user.profileImage }, "Profile image moved to permanent folder");
    } catch (error) {
      logger.error({ err: error, oldPath, newPath }, "Failed to move profile image");
    }
  } else {
    logger.warn({ oldPath }, "Profile image not found, skipping move");
  }
}

module.exports = moveProfileImage;
