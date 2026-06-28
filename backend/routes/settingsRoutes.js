const express = require("express");
const settingsController = require("../controllers/settingsController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const asyncHandler = require("../utils/asyncHandler");
const ROLES = require("../constants/roles");

const router = express.Router();

router.use(authMiddleware);

// Anyone logged in can read settings
router.get("/", asyncHandler(settingsController.getAllSettings));
router.get("/:key", asyncHandler(settingsController.getSettingByKey));

// Only admins can modify settings
router.use(roleMiddleware(ROLES.ADMIN));
router.post("/", asyncHandler(settingsController.createSetting));
router.put("/:key", asyncHandler(settingsController.updateSetting));
router.delete("/:key", asyncHandler(settingsController.deleteSetting));

module.exports = router;
