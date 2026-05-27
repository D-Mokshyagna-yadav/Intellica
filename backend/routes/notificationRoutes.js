const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");
const { getNotifications, markAsRead } = require("../controllers/notificationController");

const router = express.Router();

router.use(authMiddleware);
router.get("/", asyncHandler(getNotifications));
router.put("/:id/read", asyncHandler(markAsRead));

module.exports = router;
