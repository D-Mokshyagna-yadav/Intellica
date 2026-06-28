const mongoose = require("mongoose");
const ROLES = require("../constants/roles");

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    targetAudience: {
      type: [String],
      enum: [ROLES.ADMIN, ROLES.HOD, ROLES.FACULTY, "ALL"],
      default: ["ALL"],
    },
    targetDepartments: {
      type: [String],
      default: ["ALL"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdByRole: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Announcement", announcementSchema);
