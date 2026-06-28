const express = require("express");
const { getRanking, getMyRank } = require("../controllers/rankingcontroller");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { ROLES } = require("../constants/roles");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

// All ranking routes require authentication
router.use(authMiddleware);

// GET /api/ranking - Overall department rankings (ADMIN, HOD)
router.get("/", roleMiddleware(ROLES.ADMIN, ROLES.HOD), asyncHandler(getRanking));

// GET /api/ranking/department - Intra-department leaderboard (HOD for their dept, ADMIN for any)
router.get("/department", roleMiddleware(ROLES.HOD, ROLES.ADMIN), asyncHandler(require("../controllers/rankingcontroller").getDepartmentRanking));

// GET /api/ranking/me - Own rank (FACULTY, HOD, ADMIN)
router.get("/me", roleMiddleware(ROLES.FACULTY, ROLES.HOD, ROLES.ADMIN), asyncHandler(getMyRank));

// GET /api/ranking/:id - Specific user's rank (FACULTY for own, HOD/ADMIN for any)
router.get("/:id", roleMiddleware(ROLES.FACULTY, ROLES.HOD, ROLES.ADMIN), asyncHandler(getMyRank));

module.exports = router;
