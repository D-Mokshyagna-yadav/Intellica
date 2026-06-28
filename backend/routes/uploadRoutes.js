const express = require("express");
const uploadController = require("../controllers/uploadController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");
const normalizeCategory = require("../middleware/normalizeCategory");
const asyncHandler = require("../utils/asyncHandler");
const ROLES = require("../constants/roles");

const router = express.Router();

router.post(
  "/create/:category",
  authMiddleware,
  roleMiddleware(ROLES.FACULTY, ROLES.HOD, ROLES.ADMIN),
  normalizeCategory,
  upload.any(),
  asyncHandler(uploadController.createUpload)
);

router.get("/mine", authMiddleware, asyncHandler(uploadController.getMyUploads));
router.get("/pending", authMiddleware, asyncHandler(async (req, res) => {
  if (req.user.role === ROLES.ADMIN) {
    return uploadController.getPendingUploadsForAdmin(req, res);
  }

  if (req.user.role === ROLES.HOD) {
    return uploadController.getPendingUploadsForHOD(req, res);
  }

  return res.status(403).json({ message: "Access denied" });
}));

router.put(
  "/update/:id/:category",
  authMiddleware,
  roleMiddleware(ROLES.FACULTY, ROLES.HOD, ROLES.ADMIN),
  normalizeCategory,
  upload.any(),
  asyncHandler(uploadController.updateUpload)
);

router.get("/hod/pending", authMiddleware, roleMiddleware(ROLES.HOD), asyncHandler(uploadController.getPendingUploadsForHOD));
router.put("/hod/approve/:id", authMiddleware, roleMiddleware(ROLES.HOD), asyncHandler(uploadController.approveUploadByHOD));

router.get("/admin/pending", authMiddleware, roleMiddleware(ROLES.ADMIN), asyncHandler(uploadController.getPendingUploadsForAdmin));
router.put("/admin/approve/:id", authMiddleware, roleMiddleware(ROLES.ADMIN), asyncHandler(uploadController.approveUploadByAdmin));

router.put(
  "/discussion/:id",
  authMiddleware,
  roleMiddleware(ROLES.HOD, ROLES.ADMIN),
  asyncHandler(uploadController.callForDiscussion)
);

router.get("/category", authMiddleware, normalizeCategory, asyncHandler(uploadController.getUploadsByCategory));
router.get("/faculty/:facultyId", authMiddleware, asyncHandler(uploadController.getFacultyUploads));
router.get("/department", authMiddleware, roleMiddleware(ROLES.HOD, ROLES.ADMIN), asyncHandler(uploadController.getDepartmentUploads));
router.get("/department/rank", authMiddleware, roleMiddleware(ROLES.HOD), asyncHandler(uploadController.getDepartmentRank));
router.put("/:id/approve", authMiddleware, roleMiddleware(ROLES.HOD, ROLES.ADMIN), asyncHandler(async (req, res) => {
  if (req.user.role === ROLES.ADMIN) {
    return uploadController.approveUploadByAdmin(req, res);
  }

  return uploadController.approveUploadByHOD(req, res);
}));
router.put("/:id/reject", authMiddleware, roleMiddleware(ROLES.HOD, ROLES.ADMIN), asyncHandler(uploadController.returnForRevision));
router.put("/:id/comment", authMiddleware, roleMiddleware(ROLES.HOD, ROLES.ADMIN), asyncHandler(uploadController.callForDiscussion));

module.exports = router;
