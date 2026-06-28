const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { ROLES } = require("../constants/roles");
const asyncHandler = require("../utils/asyncHandler");
const reportController = require("../controllers/reportController");

router.get("/faculty-excel", auth, roleMiddleware(ROLES.ADMIN), asyncHandler(reportController.downloadFacultyReport));
router.get("/department-excel", auth, roleMiddleware(ROLES.HOD, ROLES.ADMIN), asyncHandler(reportController.downloadDepartmentReport));

module.exports = router;
