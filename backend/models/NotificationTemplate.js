const mongoose = require("mongoose");

const notificationTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    key: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["email", "in_app", "sms", "push"],
      default: "in_app",
    },
    subject: {
      type: String,
      default: "",
      trim: true,
    },
    body: {
      type: String,
      required: true,
    },
    variables: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      enum: [
        "approval",
        "rejection",
        "notification",
        "system",
        "welcome",
        "password_reset",
        "account_created",
      ],
      default: "system",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

notificationTemplateSchema.index({ type: 1, category: 1, isActive: 1 });

module.exports = mongoose.model("NotificationTemplate", notificationTemplateSchema);
