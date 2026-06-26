const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { getDepartments } = require("../controllers/departmentController");

const router = express.Router();

router.get("/", asyncHandler(getDepartments));

module.exports = router;
