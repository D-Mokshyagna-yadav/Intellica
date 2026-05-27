const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
      trim: true,
    },
    audienceRoles: {
      type: [String],
      default: [],
    },
    audienceDepartment: {
      type: String,
      default: null,
      trim: true,
    },
    audienceUserId: {
      type: String,
      default: null,
      trim: true,
    },
    readBy: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ audienceRoles: 1, audienceDepartment: 1, createdAt: -1 });

module.exports = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
