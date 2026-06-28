const mongoose = require("mongoose");

const naacReportSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "createdByRole",
    },
    createdByRole: {
      type: String,
      enum: ["FACULTY", "HOD", "ADMIN"],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    sections: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["draft", "review", "completed"],
      default: "draft",
    },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true }
);

naacReportSchema.index({ createdBy: 1, year: -1, createdAt: -1 });

module.exports = mongoose.model("NAACReport", naacReportSchema);