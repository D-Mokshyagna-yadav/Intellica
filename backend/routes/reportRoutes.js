const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");
const reportController = require("../controllers/reportController");

router.get("/faculty-excel", auth, asyncHandler(reportController.downloadFacultyReport));
router.get("/department-excel", auth, asyncHandler(reportController.downloadDepartmentReport));

module.exports = router;
