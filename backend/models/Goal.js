const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "ownerRole",
    },
    ownerRole: {
      type: String,
      enum: ["FACULTY", "HOD", "ADMIN"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    category: {
      type: String,
      default: "general",
      trim: true,
    },
    targetDate: {
      type: Date,
      required: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: [String],
      default: [],
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

goalSchema.index({ owner: 1, ownerRole: 1, createdAt: -1 });

module.exports = mongoose.model("Goal", goalSchema);