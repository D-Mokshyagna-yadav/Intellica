const mongoose = require("mongoose");

const creditConfigSchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AchievementCategory",
      required: true,
      unique: true,
    },
    categoryName: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["professional", "rnd", "teaching", "extension"],
    },
    basePoints: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    maxPointsPerYear: {
      type: Number,
      default: null,
      min: 0,
    },
    maxPointsPerSemester: {
      type: Number,
      default: null,
      min: 0,
    },
    weightage: {
      type: Number,
      default: 1,
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
    allowedFileTypes: {
      type: [String],
      default: ["pdf", "jpg", "jpeg", "png", "doc", "docx"],
    },
    maxFileSizeMB: {
      type: Number,
      default: 10,
      min: 1,
    },
    description: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

creditConfigSchema.index({ category: 1, isActive: 1 });
creditConfigSchema.index({ type: 1, isActive: 1 });

module.exports = mongoose.model("CreditConfig", creditConfigSchema);
