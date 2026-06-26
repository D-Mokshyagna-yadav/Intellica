const express = require("express");
const { getRanking, getMyRank } = require("../controllers/rankingcontroller");
const authMiddleware = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/", authMiddleware, asyncHandler(getRanking));
router.get("/me", authMiddleware, asyncHandler(getMyRank));
router.get("/:id", authMiddleware, asyncHandler(getMyRank));

module.exports = router;
