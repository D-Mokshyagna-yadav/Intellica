const fs = require("fs");
const path = require("path");

function createUserFolder(user) {
  if (!user) return null;

  const basePath = fs.existsSync("/documents") ? "/documents" : path.join(__dirname, "../uploads");
  const dept = String(user.department || "COMMON").trim().toUpperCase();
  const role = String(user.role || "FACULTY").trim().toLowerCase();
  const employeeId = String(user.employeeId || user.regId || user._id || "unknown").trim();
  const name = String(user.name || "user").trim().replace(/[^a-zA-Z0-9]/g, "_");
  
  const empIdName = `${employeeId}_${name}`;
  const userFolderPath = path.join(basePath, "departments", dept, role, empIdName);

  const profilePath = path.join(userFolderPath, "profile");
  const uploadsPath = path.join(userFolderPath, "uploads");

  if (!fs.existsSync(profilePath)) {
    fs.mkdirSync(profilePath, { recursive: true });
  }
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
  }

  return {
    base: userFolderPath,
    profile: profilePath,
    uploads: uploadsPath,
  };
}

module.exports = createUserFolder;