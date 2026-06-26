const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        "login",
        "logout",
        "create",
        "update",
        "delete",
        "approve",
        "reject",
        "password_reset",
        "department_change",
        "role_change",
        "permission_change",
        "setting_change",
        "bulk_operation",
        "import",
        "export",
        "backup",
        "restore",
      ],
    },
    resourceType: {
      type: String,
      required: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    userName: {
      type: String,
      default: "",
    },
    userRole: {
      type: String,
      default: "",
    },
    oldValue: {
      type: Object,
      default: null,
    },
    newValue: {
      type: Object,
      default: null,
    },
    changes: {
      type: [String],
      default: [],
    },
    ipAddress: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },
    browser: {
      type: String,
      default: "",
    },
    device: {
      type: String,
      default: "",
    },
    os: {
      type: String,
      default: "",
    },
    metadata: {
      type: Object,
      default: {},
    },
    isImmutable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

auditLogSchema.index({ action: 1, resourceType: 1, userId: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

// Make logs immutable after creation
auditLogSchema.pre("save", function (next) {
  if (!this.isNew && this.isImmutable) {
    // Only allow adding metadata, not modifying existing fields
    if (this.modifiedPaths().some((path) => path !== "metadata" && path !== "updatedAt")) {
      const error = new Error("Audit logs are immutable and cannot be modified");
      error.isImmutableError = true;
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model("AuditLog", auditLogSchema);
