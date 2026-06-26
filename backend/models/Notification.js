const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      default: "",
      trim: true,
    },
    type: {
      type: String,
      enum: ["info", "success", "warning", "error"],
      default: "info",
    },
    audienceRoles: {
      type: [String],
      default: [],
    },
    audienceDepartment: {
      type: String,
      default: null,
    },
    audienceUserId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    readBy: {
      type: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
          },
          readAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    archivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
    actionUrl: {
      type: String,
      default: "",
    },
    metadata: {
      type: Object,
      default: {},
    },
    relatedResourceType: {
      type: String,
      default: "",
    },
    relatedResourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ audienceUserId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ audienceRoles: 1, audienceDepartment: 1, createdAt: -1 });
notificationSchema.index({ isArchived: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
