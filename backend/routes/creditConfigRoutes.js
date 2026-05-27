const express = require("express");
const CreditConfig = require("../models/CreditConfig");
const Upload = require("../models/Upload");
const calculateCredits = require("../services/creditCalculator");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const asyncHandler = require("../utils/asyncHandler");
const { AppError } = require("../utils/errors");
const ROLES = require("../constants/roles");

const router = express.Router();

router.get(
  "/all",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const configs = await CreditConfig.find().lean();
    const result = {};
    configs.forEach((config) => {
      result[config.type] = config.config;
    });
    res.json(result);
  })
);

router.get(
  "/:type",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const config = await CreditConfig.findOne({ type: req.params.type }).lean();
    res.json(config || { config: {} });
  })
);

router.post(
  "/:type",
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  asyncHandler(async (req, res) => {
    const configData = req.body.config;

    if (!configData || Object.keys(configData).length === 0) {
      throw new AppError("Config is empty", 400);
    }

    await CreditConfig.findOneAndUpdate(
      { type: req.params.type },
      { type: req.params.type, config: configData },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const uploads = await Upload.find({
      status: { $in: ["HOD_APPROVED", "ADMIN_APPROVED"] },
    });

    let updatedCount = 0;
    for (const upload of uploads) {
      const newCredits = await calculateCredits(upload);
      if (upload.credits !== newCredits) {
        upload.credits = newCredits;
        await upload.save();
        updatedCount += 1;
      }
    }

    res.json({
      message: "Config saved and credits updated",
      updated: updatedCount,
    });
  })
);

module.exports = router;
