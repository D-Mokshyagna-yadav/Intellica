const express = require("express");
const router = express.Router();

const uploadController = require("../controllers/uploadController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const normalizeCategory = require("../middleware/normalizeCategory");

router.post("/create/:category", authMiddleware, normalizeCategory, upload.any(), uploadController.createUpload);
router.get("/mine", authMiddleware, uploadController.getMyUploads);
router.put("/update/:id/:category", authMiddleware, upload.any(), uploadController.updateUpload);
router.get("/hod/pending", authMiddleware, uploadController.getPendingUploadsForHOD);
router.put("/hod/approve/:id", authMiddleware, uploadController.approveUploadByHOD);
router.get("/admin/pending", authMiddleware, uploadController.getPendingUploadsForAdmin);
router.put("/admin/approve/:id", authMiddleware, uploadController.approveUploadByAdmin);
router.put("/discussion/:id", authMiddleware, uploadController.callForDiscussion);
router.get("/category", authMiddleware, uploadController.getUploadsByCategory);
router.get("/faculty/:facultyId", authMiddleware, uploadController.getFacultyUploads);
router.get("/department", authMiddleware, uploadController.getDepartmentUploads);

// ✅ కొత్తది — Department Rank
router.get("/department/rank", authMiddleware, uploadController.getDepartmentRank);

module.exports = router;