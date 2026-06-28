const fs = require("fs");
const path = require("path");
const Faculty = require("../models/Faculty");
const HOD = require("../models/HOD");
const User = require("../models/User");
const createUserFolder = require("./createUserFolder");
const logger = require("./logger");

async function moveUploadFile(upload) {
  if (!upload || !upload.filePath || upload.filePath.includes("departments/")) {
    return;
  }

  const filename = path.basename(upload.filePath);
  
  let user = await Faculty.findById(upload.faculty);
  if (!user) {
    user = await HOD.findById(upload.faculty);
  }
  if (!user) {
    user = await User.findById(upload.faculty);
  }

  if (!user) {
    logger.warn({ uploadId: upload._id }, "Owner user not found for upload, skipping file move");
    return;
  }

  const folders = createUserFolder(user);
  if (!folders) return;

  const resolveStoragePath = require("./resolveStoragePath");
  const basePath = resolveStoragePath();
  // Check if file is in temp/ or directly in root (during registration/migration)
  let oldPath = path.join(basePath, "temp", filename);
  if (!fs.existsSync(oldPath)) {
    oldPath = path.join(basePath, filename);
  }
  
  const newPath = path.join(folders.uploads, filename);

  if (fs.existsSync(oldPath)) {
    try {
      fs.renameSync(oldPath, newPath);
      
      const role = String(user.role || "FACULTY").trim().toLowerCase();
      const employeeId = String(user.employeeId || user.regId || user._id || "unknown").trim();
      const name = String(user.name || "user").trim().replace(/[^a-zA-Z0-9]/g, "_");
      const empIdName = `${employeeId}_${name}`;
      const dept = String(user.department || "COMMON").trim().toUpperCase();

      upload.filePath = `departments/${dept}/${role}/${empIdName}/uploads/${filename}`;
      await upload.save();
      logger.info({ uploadId: upload._id, filePath: upload.filePath }, "Upload file moved to permanent folder");
    } catch (error) {
      logger.error({ err: error, oldPath, newPath }, "Failed to move upload file");
    }
  } else {
    logger.warn({ oldPath }, "Upload source file not found, skipping move");
  }
}

module.exports = moveUploadFile;
