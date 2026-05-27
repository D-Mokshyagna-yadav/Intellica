const mongoose = require("mongoose");

const uploadSchema = new mongoose.Schema(
{
  /* who created the upload */

 faculty: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Faculty",
  required: true
},

  createdByRole: {
    type: String,
    enum: ["FACULTY", "HOD", "ADMIN"],
    required: true
  },

  department: {
    type: String,
    default: ""
  },

  category: {
    type: String,
    required: true
  },

  title: {
    type: String,
    default: ""
  },

  metadata: {
    type: Object,
    default: {}
  },

  filePath: {
    type: String,
    default: ""
  },

  credits: {
    type: Number,
    default: 0
  },

  year: {
    type: Number,
    required: true
 },
  

  /* workflow status */

  status: {
    type: String,
    enum: [
      "FACULTY_SUBMITTED",
      "HOD_COMMENT",
      "HOD_APPROVED",
      "HOD_SUBMITTED",
      "ADMIN_COMMENT",
      "ADMIN_APPROVED"
    ],
    default: "FACULTY_SUBMITTED"
  },

  /* comments */

  hodComment: {
    type: String,
    default: ""
  },

  adminComment: {
    type: String,
    default: ""
  },

  /* ================= NEW FIELDS ================= */

  changedFields: {
    type: [String],
    default: []
  },

  previousMetadata: {
    type: Object,
    default: {}
  }

},
{ timestamps: true }
);

module.exports = mongoose.model("Upload", uploadSchema);