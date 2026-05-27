const express = require("express");
const router = express.Router();
const CreditConfig = require("../models/CreditConfig");
const Upload = require("../models/Upload");
const calculateCredits = require("../services/creditCalculator");
router.get("/all", async (req, res) => {
  try {
    const configs = await CreditConfig.find();

    const result = {};

    configs.forEach(c => {
      result[c.type] = c.config;
    });

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch config" });
  }
});
/* GET */
router.get("/:type", async (req, res) => {

  const { type } = req.params;

  const config = await CreditConfig.findOne({ type });

  res.json(config || { config: {} });

});


/* POST */
router.post("/:type", async (req, res) => {
  try {

    const { type } = req.params;
    const configData = req.body.config;

    if (!configData || Object.keys(configData).length === 0) {
      return res.status(400).json({ message: "Config is empty" });
    }

    /* ================= SAVE CONFIG ================= */

    let existing = await CreditConfig.findOne({ type });

    if (existing) {
      existing.config = configData;
      await existing.save();
    } else {
      await CreditConfig.create({
        type,
        config: configData
      });
    }

    console.log("✅ Config saved");

    /* ================= AUTO RECALCULATE ================= */

    const uploads = await Upload.find({
      status: { $in: ["HOD_APPROVED", "ADMIN_APPROVED"] }
    });

    console.log("🔄 Recalculating:", uploads.length);

    let updatedCount = 0;

    for (let upload of uploads) {

      const newCredits = await calculateCredits(upload);

      if (upload.credits !== newCredits) {
        upload.credits = newCredits;
        await upload.save();
        updatedCount++;
      }

    }

    console.log("✅ Updated:", updatedCount);

    /* ================= RESPONSE ================= */

    res.json({
      message: "Config saved & credits updated",
      updated: updatedCount
    });

  } catch (err) {

    console.error("SAVE ERROR:", err);

    res.status(500).json({
      message: "Error saving config"
    });

  }
});
module.exports = router;   // ✅ THIS LINE FIXES YOUR ERROR