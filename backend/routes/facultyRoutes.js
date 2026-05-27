const router = require("express").Router();
const { getProfile, getFacultyById } = require("../controllers/facultyController");
const { updateProfile } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const ROLES = require("../constants/roles");
const asyncHandler = require("../utils/asyncHandler");

router.get("/profile", authMiddleware, roleMiddleware(ROLES.FACULTY), asyncHandler(getProfile));
router.put("/update-profile", authMiddleware, roleMiddleware(ROLES.FACULTY), asyncHandler(updateProfile));
router.get("/:id", authMiddleware, roleMiddleware(ROLES.FACULTY, ROLES.HOD, ROLES.ADMIN), asyncHandler(getFacultyById));

module.exports = router;
