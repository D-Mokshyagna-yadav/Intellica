const express = require("express");
const { createAnnouncement, getAnnouncements, getAllAnnouncementsForAdmin, updateAnnouncement, deleteAnnouncement } = require("../controllers/announcementController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const asyncHandler = require("../utils/asyncHandler");
const ROLES = require("../constants/roles");

const router = express.Router();

router.use(authMiddleware);

router.get("/", asyncHandler(getAnnouncements));

// Admin specific routes
router.use(roleMiddleware(ROLES.ADMIN));
router.get("/all", asyncHandler(getAllAnnouncementsForAdmin));
router.post("/", asyncHandler(createAnnouncement));
router.put("/:id", asyncHandler(updateAnnouncement));
router.delete("/:id", asyncHandler(deleteAnnouncement));

module.exports = router;
