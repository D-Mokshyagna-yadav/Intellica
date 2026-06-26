const mongoose = require("mongoose");

const uploadSchema = new mongoose.Schema(
  {
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: true,
    },
    facultyName: {
      type: String,
      required: true,
    },
    createdByRole: {
      type: String,
      enum: ["FACULTY", "HOD", "ADMIN"],
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    departmentName: {
      type: String,
      required: true,
    },
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      default: null,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AchievementCategory",
      required: true,
    },
    categoryName: {
      type: String,
      required: true,
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },
    semester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Semester",
      required: true,
    },
    title: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    metadata: {
      type: Object,
      default: {},
    },
    filePath: {
      type: String,
      default: "",
    },
    fileName: {
      type: String,
      default: "",
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    fileType: {
      type: String,
      default: "",
    },
    credits: {
      type: Number,
      default: 0,
    },
    basePoints: {
      type: Number,
      default: 0,
    },
    weightage: {
      type: Number,
      default: 1,
    },
    year: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "FACULTY_SUBMITTED",
        "HOD_COMMENT",
        "HOD_APPROVED",
        "HOD_SUBMITTED",
        "ADMIN_COMMENT",
        "ADMIN_APPROVED",
        "REJECTED",
      ],
      default: "FACULTY_SUBMITTED",
    },
    hodComment: {
      type: String,
      default: "",
    },
    adminComment: {
      type: String,
      default: "",
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    changedFields: {
      type: [String],
      default: [],
    },
    previousMetadata: {
      type: Object,
      default: {},
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "approvedByRole",
      default: null,
    },
    approvedByRole: {
      type: String,
      enum: ["HOD", "ADMIN"],
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
    duplicateOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Upload",
      default: null,
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

uploadSchema.index({ faculty: 1, status: 1 });
uploadSchema.index({ department: 1, status: 1, year: -1 });
uploadSchema.index({ academicYear: 1, semester: 1, status: 1 });
uploadSchema.index({ category: 1, status: 1 });
uploadSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Upload", uploadSchema);
