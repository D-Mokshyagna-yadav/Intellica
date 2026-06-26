const express = require("express");
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const asyncHandler = require("../utils/asyncHandler");
const ROLES = require("../constants/roles");

const router = express.Router();

router.use(authMiddleware, roleMiddleware(ROLES.ADMIN));

router.get("/hods", asyncHandler(adminController.getAllHods));
router.get("/pending-hods", asyncHandler(adminController.getPendingHods));
router.put("/approve-hod/:id", asyncHandler(adminController.approveHod));
router.post("/hod-discussion/:id", asyncHandler(adminController.hodDiscussion));
router.delete("/remove-hod/:id", asyncHandler(adminController.removeApprovedHod));

router.get("/departments", asyncHandler(adminController.getDepartmentStatus));
router.get("/departments/manage", asyncHandler(adminController.getManagedDepartments));
router.post("/departments", asyncHandler(adminController.createDepartment));
router.put("/departments/:id", asyncHandler(adminController.updateDepartment));
router.delete("/departments/:id", asyncHandler(adminController.deleteDepartment));
router.post("/departments/:id/restore", asyncHandler(adminController.restoreDepartment));
router.get("/top-departments", asyncHandler(adminController.getTopDepartments));
router.get("/activity-stats", asyncHandler(adminController.getActivityStats));

router.get("/pending-uploads", asyncHandler(adminController.getPendingUploadsForAdmin));
router.post("/approve-upload/:id", asyncHandler(adminController.approveUploadByAdmin));
router.post("/discussion/:id", asyncHandler(adminController.adminDiscussion));

router.get("/all-users", asyncHandler(adminController.getAllUsers));
router.post("/users", asyncHandler(adminController.createManualUser));
router.delete("/delete-user/:id", asyncHandler(adminController.deleteUser));
router.put("/change-department/:id", asyncHandler(adminController.changeDepartment));
router.get("/department-analytics/:department", asyncHandler(adminController.getDepartmentAnalytics));

module.exports = router;
