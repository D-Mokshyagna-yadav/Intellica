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

module.exports = router;
