const mongoose = require("mongoose");

const approvalWorkflowSchema = new mongoose.Schema(
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
    resourceType: {
      type: String,
      required: true,
      enum: ["achievement", "faculty", "hod", "department_change", "category"],
    },
    steps: {
      type: [
        {
          order: {
            type: Number,
            required: true,
          },
          approverRole: {
            type: String,
            required: true,
          },
          approverField: {
            type: String,
            default: "department",
          },
          autoApprove: {
            type: Boolean,
            default: false,
          },
          requiresComment: {
            type: Boolean,
            default: false,
          },
          notifyOnApprove: {
            type: Boolean,
            default: true,
          },
          notifyOnReject: {
            type: Boolean,
            default: true,
          },
        },
      ],
      default: [],
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

approvalWorkflowSchema.index({ resourceType: 1, isActive: 1 });

module.exports = mongoose.model("ApprovalWorkflow", approvalWorkflowSchema);
