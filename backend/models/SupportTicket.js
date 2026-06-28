const mongoose = require("mongoose");

const replySchema = new mongoose.Schema(
  {
    author: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const supportTicketSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "requesterRole",
    },
    requesterRole: {
      type: String,
      enum: ["FACULTY", "HOD", "ADMIN"],
      required: true,
    },
    subject: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["open", "in-progress", "resolved", "closed"],
      default: "open",
    },
    replies: { type: [replySchema], default: [] },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true }
);

supportTicketSchema.index({ requester: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("SupportTicket", supportTicketSchema);