const mongoose = require("mongoose");

const achievementCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    canonicalName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    aliases: {
      type: [String],
      default: [],
    },
    section: {
      type: String,
      enum: ["professional", "rnd", "teaching", "extension"],
      default: "professional",
    },
    points: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxPointsPerYear: {
      type: Number,
      default: null,
      min: 0,
    },
    requiresEvidence: {
      type: Boolean,
      default: true,
    },
    requiresApproval: {
      type: Boolean,
      default: true,
    },
    weightage: {
      type: Number,
      default: 1,
      min: 0,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

achievementCategorySchema.index({ isActive: 1, section: 1, sortOrder: 1 });

module.exports = mongoose.model("AchievementCategory", achievementCategorySchema);
