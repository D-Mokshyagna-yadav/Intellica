const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    resource: {
      type: String,
      required: true,
      enum: [
        "department",
        "faculty",
        "hod",
        "achievement",
        "category",
        "academic_year",
        "semester",
        "notification",
        "setting",
        "report",
        "audit_log",
        "role",
        "permission",
        "user",
      ],
    },
    action: {
      type: String,
      required: true,
      enum: ["create", "read", "update", "delete", "approve", "reject", "manage", "view_all"],
    },
    scope: {
      type: String,
      enum: ["system", "department", "personal"],
      default: "system",
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

permissionSchema.index({ resource: 1, action: 1, isActive: 1 });

module.exports = mongoose.model("Permission", permissionSchema);
