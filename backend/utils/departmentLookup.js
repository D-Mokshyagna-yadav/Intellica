const Department = require("../models/Department");

function normalizeDepartmentCode(value) {
  return String(value || "").trim().toUpperCase();
}

function normalizeDepartmentName(value) {
  return String(value || "").trim();
}

async function resolveDepartment(identifier) {
  const rawValue = String(identifier || "").trim();

  if (!rawValue) {
    return null;
  }

  const byCode = await Department.findOne({
    code: normalizeDepartmentCode(rawValue),
    isActive: true,
    isArchived: false,
  }).lean();

  if (byCode) {
    return byCode;
  }

  const byName = await Department.findOne({
    name: normalizeDepartmentName(rawValue),
    isActive: true,
    isArchived: false,
  }).lean();

  return byName || null;
}

async function listActiveDepartments() {
  return Department.find({ isActive: true, isArchived: false })
    .select("name code description facultyCount totalCredits sortOrder")
    .sort({ sortOrder: 1, name: 1 })
    .lean();
}

module.exports = {
  listActiveDepartments,
  normalizeDepartmentCode,
  normalizeDepartmentName,
  resolveDepartment,
};
