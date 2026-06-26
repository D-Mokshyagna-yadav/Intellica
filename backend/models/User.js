const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    regId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      default: "ADMIN",
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpires: {
      type: Date,
      default: null,
    },
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      default: null,
    },
    departments: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Department",
      default: [],
    },
    permissions: {
      type: [String],
      default: [],
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    loginCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

userSchema.index({ email: 1, isArchived: 1 });
userSchema.index({ regId: 1, isArchived: 1 });
userSchema.index({ role: 1, isActive: 1 });

module.exports = mongoose.model("User", userSchema);
