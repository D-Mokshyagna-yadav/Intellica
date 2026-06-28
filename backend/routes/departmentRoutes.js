const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { getDepartments } = require("../controllers/departmentController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { ROLES } = require("../constants/roles");

const router = express.Router();

// All department routes require authentication
router.use(authMiddleware);

// GET /api/departments - List active departments (accessible to all authenticated roles)
router.get("/", roleMiddleware(ROLES.FACULTY, ROLES.HOD, ROLES.ADMIN), asyncHandler(getDepartments));

module.exports = router;
