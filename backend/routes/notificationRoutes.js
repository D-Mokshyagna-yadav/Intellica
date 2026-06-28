const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const asyncHandler = require("../utils/asyncHandler");
const {
  getNotifications,
  markAsRead,
  createNotification,
  getAllNotifications,
  deleteNotification,
} = require("../controllers/notificationController");

const router = express.Router();

router.use(authMiddleware);

// All authenticated users — get own notifications
router.get("/", asyncHandler(getNotifications));
router.put("/:id/read", asyncHandler(markAsRead));

// Admin + HOD — create / manage broadcast notifications
router.post(
  "/",
  roleMiddleware(["ADMIN", "HOD"]),
  asyncHandler(createNotification)
);

// Admin only — full list + delete
router.get(
  "/all",
  roleMiddleware(["ADMIN"]),
  asyncHandler(getAllNotifications)
);
router.delete(
  "/:id",
  roleMiddleware(["ADMIN"]),
  asyncHandler(deleteNotification)
);

module.exports = router;
