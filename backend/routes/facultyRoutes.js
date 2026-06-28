const router = require("express").Router();
const {
  getProfile,
  getFacultyById,
  getAllFaculty,
  updateFacultyProfile,
  getFacultyStats,
  getFacultyAchievements,
  approveAchievements,
  getFacultyRanking
} = require("../controllers/facultyController");
const { updateProfile } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const ROLES = require("../constants/roles");
const asyncHandler = require("../utils/asyncHandler");

// Public routes
router.get("/profile", authMiddleware, roleMiddleware(ROLES.FACULTY), asyncHandler(getProfile));
router.put("/update-profile", authMiddleware, roleMiddleware(ROLES.FACULTY), asyncHandler(updateProfile));
router.get("/:id", authMiddleware, roleMiddleware(ROLES.FACULTY, ROLES.HOD, ROLES.ADMIN), asyncHandler(getFacultyById));

// Faculty stats and achievements
router.get("/:id/stats", authMiddleware, asyncHandler(getFacultyStats));
router.get("/:id/achievements", authMiddleware, asyncHandler(getFacultyAchievements));
router.get("/:id/ranking", authMiddleware, asyncHandler(getFacultyRanking));

// HOD/Admin routes
router.get("/", authMiddleware, roleMiddleware(ROLES.HOD, ROLES.ADMIN), asyncHandler(getAllFaculty));
router.put("/:id", authMiddleware, roleMiddleware(ROLES.HOD, ROLES.ADMIN), asyncHandler(updateFacultyProfile));
router.post("/bulk-approve", authMiddleware, roleMiddleware(ROLES.HOD, ROLES.ADMIN), asyncHandler(approveAchievements));

module.exports = router;
