const mongoose = require("mongoose");

const semesterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },
    order: {
      type: Number,
      required: true,
      min: 1,
      max: 2,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

semesterSchema.index({ academicYear: 1, order: 1, isActive: 1 });

module.exports = mongoose.model("Semester", semesterSchema);
