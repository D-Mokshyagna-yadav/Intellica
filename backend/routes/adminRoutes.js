const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

const {
  getPendingFaculty,
  approveFaculty,
  getAllHods,
  getPendingHods,
  approveHod,
  hodDiscussion,
  getPendingUploadsForAdmin,
  approveUploadByAdmin,
  adminDiscussion
} = require("../controllers/adminController");

const authMiddleware = require("../middleware/authMiddleware");

/* ===============================
   FACULTY APPROVAL ROUTES
=============================== */

router.get("/pending-faculty", authMiddleware, getPendingFaculty);
router.put("/approve/faculty/:id", authMiddleware, approveFaculty);

/* ===============================
   HOD MANAGEMENT ROUTES
=============================== */

router.get("/hods", authMiddleware, getAllHods);
router.get("/pending-hods", authMiddleware, getPendingHods); // ⭐ IMPORTANT
router.put("/approve-hod/:id", authMiddleware, approveHod);
router.post(
"/hod-discussion/:id",
authMiddleware,
hodDiscussion
);
/* ===============================
   HOD UPLOAD APPROVAL
=============================== */
router.get(
"/departments",
authMiddleware,
adminController.getDepartmentStatus
);
router.delete(
"/remove-hod/:id",
authMiddleware,
adminController.removeApprovedHod
);
router.get(
"/top-departments",
authMiddleware,
adminController.getTopDepartments
);

router.get(
"/activity-stats",
authMiddleware,
adminController.getActivityStats
);
router.get("/pending-uploads", authMiddleware, getPendingUploadsForAdmin);

router.post("/approve-upload/:id", authMiddleware, approveUploadByAdmin);

router.post("/discussion/:id", authMiddleware, adminDiscussion);
router.get("/all-users", authMiddleware, adminController.getAllUsers);
router.delete(
"/delete-user/:id",
authMiddleware,
adminController.deleteUser
);
router.put(
"/change-department/:id",
authMiddleware,
adminController.changeDepartment
);
router.get(
"/department-analytics/:department",
authMiddleware,
adminController.getDepartmentAnalytics
);
module.exports = router;
