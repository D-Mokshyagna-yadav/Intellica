const express = require("express");
const { getRanking, getMyRank } = require("../controllers/rankingcontroller");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const ROLES = require("../constants/roles");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

// All ranking routes require authentication
router.use(authMiddleware);

// GET /api/ranking - Overall department rankings (ADMIN, HOD)
router.get("/", roleMiddleware(ROLES.ADMIN, ROLES.HOD), asyncHandler(getRanking));
router.get("/global", roleMiddleware(ROLES.FACULTY, ROLES.HOD, ROLES.ADMIN), asyncHandler(getRanking));
router.get("/departments", roleMiddleware(ROLES.ADMIN, ROLES.HOD), asyncHandler(require("../controllers/rankingcontroller").getRanking));
router.get("/department-stats", roleMiddleware(ROLES.ADMIN, ROLES.HOD), asyncHandler(require("../controllers/rankingcontroller").getDepartmentStats));
router.get("/faculty", roleMiddleware(ROLES.FACULTY, ROLES.HOD, ROLES.ADMIN), asyncHandler(require("../controllers/rankingcontroller").getFacultyRankings));

// GET /api/ranking/department - Intra-department leaderboard (HOD for their dept, ADMIN for any)
router.get("/department", roleMiddleware(ROLES.HOD, ROLES.ADMIN), asyncHandler(require("../controllers/rankingcontroller").getDepartmentRanking));

// GET /api/ranking/me - Own rank (FACULTY, HOD, ADMIN)
router.get("/me", roleMiddleware(ROLES.FACULTY, ROLES.HOD, ROLES.ADMIN), asyncHandler(getMyRank));
router.get("/my-rank", roleMiddleware(ROLES.FACULTY, ROLES.HOD, ROLES.ADMIN), asyncHandler(getMyRank));

// GET /api/ranking/:id - Specific user's rank (FACULTY for own, HOD/ADMIN for any)
// Use a regex restriction to avoid alias conflicts with static paths like /global and /my-rank.
router.get("/:id([0-9a-fA-F]{24})", roleMiddleware(ROLES.FACULTY, ROLES.HOD, ROLES.ADMIN), asyncHandler(getMyRank));

module.exports = router;
