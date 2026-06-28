const mongoose = require("mongoose");

const facultySchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    mobile: {
      type: String,
      default: "",
    },
    employmentType: {
      type: String,
      default: "Full-Time",
    },
    password: {
      type: String,
      required: false,
      default: null,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    departmentName: {
      type: String,
      required: true,
      trim: true,
    },
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      default: null,
    },
    designation: {
      type: String,
      required: true,
    },
    googleScholar: {
      type: String,
      default: "",
    },
    vidwanId: {
      type: String,
      default: "",
    },
    scopusId: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      default: "FACULTY",
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["PENDING", "DISCUSSION", "APPROVED"],
      default: "PENDING",
    },
    profileImage: {
      type: String,
      default: "",
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
    qualifications: {
      type: [String],
      default: [],
    },
    experienceYears: {
      type: Number,
      default: 0,
    },
    researchInterests: {
      type: [String],
      default: [],
    },
    resumeUrl: {
      type: String,
      default: "",
    },
    emergencyContact: {
      type: String,
      default: "",
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpires: {
      type: Date,
      default: null,
    },
    totalCredits: {
      type: Number,
      default: 0,
    },
    currentYearCredits: {
      type: Number,
      default: 0,
    },
    currentSemesterCredits: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "createdByRole",
      default: null,
    },
    createdByRole: {
      type: String,
      enum: ["ADMIN", "HOD"],
      default: "ADMIN",
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

facultySchema.index({ department: 1, status: 1, isApproved: 1 });
facultySchema.index({ email: 1, isArchived: 1 });
facultySchema.index({ employeeId: 1, isArchived: 1 });
facultySchema.index({ college: 1, isActive: 1 });

module.exports = mongoose.model("Faculty", facultySchema);
