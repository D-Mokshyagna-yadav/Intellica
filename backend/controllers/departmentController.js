const { listActiveDepartments } = require("../utils/departmentLookup");

exports.getDepartments = async (_req, res) => {
  const departments = await listActiveDepartments();

  res.json(
    departments.map((department) => ({
      code: department.code,
      name: department.name,
      description: department.description || "",
      facultyCount: department.facultyCount || 0,
      totalCredits: department.totalCredits || 0,
    }))
  );
};
