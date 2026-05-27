const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  totalCredits: { type: Number, default: 0 }
});

module.exports = mongoose.model("Department", departmentSchema);
