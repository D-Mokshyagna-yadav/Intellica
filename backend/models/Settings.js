const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    category: {
      type: String,
      enum: [
        "general",
        "scoring",
        "approval",
        "notification",
        "security",
        "feature_flags",
        "theme",
        "email",
      ],
      default: "general",
    },
    description: {
      type: String,
      default: "",
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
    isEditable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

settingsSchema.index({ category: 1, key: 1 });

module.exports = mongoose.model("Settings", settingsSchema);
