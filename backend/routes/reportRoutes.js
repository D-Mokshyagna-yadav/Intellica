const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const reportController = require("../controllers/reportController");

router.get(
"/faculty-excel",
auth,
reportController.downloadFacultyReport
);
router.get(
  "/department-excel",
  auth,
  reportController.downloadDepartmentReport
);

module.exports = router;