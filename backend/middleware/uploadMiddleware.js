const multer = require("multer");
const path = require("path");
const fs = require("fs");

/* ================= BASE UPLOAD FOLDER ================= */

const baseUploadDir = path.join(__dirname, "..", "uploads");
const tempDir = path.join(baseUploadDir, "temp");

/* ================= CREATE FOLDERS IF NOT EXIST ================= */

if (!fs.existsSync(baseUploadDir)) {
fs.mkdirSync(baseUploadDir, { recursive: true });
}

if (!fs.existsSync(tempDir)) {
fs.mkdirSync(tempDir, { recursive: true });
}

/* ================= STORAGE CONFIG ================= */

const storage = multer.diskStorage({

destination: (req, file, cb) => {
cb(null, tempDir);
},

filename: (req, file, cb) => {


const uniqueName =
  Date.now() + "-" + Math.round(Math.random() * 1e9);

cb(null, uniqueName + path.extname(file.originalname));


}

});

/* ================= FILE FILTER ================= */

const fileFilter = (req, file, cb) => {

if (file.mimetype === "application/pdf") {
cb(null, true);
} else {
cb(new Error("Only PDF files allowed"), false);
}

};

/* ================= MULTER INSTANCE ================= */

const upload = multer({
storage,
fileFilter,
limits: {
fileSize: 20 * 1024 * 1024   // 20MB
}
});

/*
IMPORTANT:

Use upload.any() in routes to allow multiple files like:
guidedProof_0
guidedProof_1
guidingProof_0
file

Example:

router.post(
"/",
authMiddleware,
upload.any(),
uploadController.createUpload
);
*/

module.exports = upload;
