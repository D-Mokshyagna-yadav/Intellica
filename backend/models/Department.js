const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    hod: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HOD",
      default: null,
    },
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      default: null,
    },
    totalCredits: {
      type: Number,
      default: 0,
    },
    facultyCount: {
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
    mergedInto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

departmentSchema.index({ isActive: 1, isArchived: 1, code: 1 });
departmentSchema.index({ college: 1, isActive: 1 });

module.exports = mongoose.model("Department", departmentSchema);
