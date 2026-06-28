const mongoose = require("mongoose");

const publicationSchema = new mongoose.Schema(
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
    authors: {
      type: String,
      default: "",
      trim: true,
    },
    journal: {
      type: String,
      default: "",
      trim: true,
    },
    year: {
      type: Number,
      default: new Date().getFullYear(),
    },
    doi: {
      type: String,
      default: "",
      trim: true,
    },
    url: {
      type: String,
      default: "",
      trim: true,
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

publicationSchema.index({ owner: 1, createdAt: -1 });

module.exports = mongoose.model("Publication", publicationSchema);