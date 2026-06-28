const express = require("express");
const announcementController = require("../controllers/announcementController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const asyncHandler = require("../utils/asyncHandler");
const ROLES = require("../constants/roles");

const router = express.Router();

router.use(authMiddleware);

router.get("/", asyncHandler(announcementController.getAnnouncements));

// Admin specific routes
router.use(roleMiddleware(ROLES.ADMIN));
router.get("/all", asyncHandler(announcementController.getAllAnnouncementsForAdmin));
router.post("/", asyncHandler(announcementController.createAnnouncement));
router.delete("/:id", asyncHandler(announcementController.deleteAnnouncement));

module.exports = router;
