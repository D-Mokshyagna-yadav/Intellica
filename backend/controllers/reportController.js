const ExcelJS = require("exceljs");
const Upload = require("../models/Upload");
const Faculty = require("../models/Faculty");
const HOD = require("../models/HOD");
const ROLES = require("../constants/roles");
const { normalizeCategory } = require("../constants/categories");
const { AppError } = require("../utils/errors");

async function assertFacultyReportAccess(requester, facultyId) {
  if (requester.role === ROLES.ADMIN) {
    return;
  }

  if (requester.role === ROLES.FACULTY && requester.id !== facultyId) {
    throw new AppError("Access denied", 403);
  }

  if (requester.role === ROLES.HOD && requester.id !== facultyId) {
    const faculty = await Faculty.findById(facultyId).select("department");
    const hod = await HOD.findById(facultyId).select("department");
    const owner = faculty || hod;

    if (!owner || owner.department !== requester.department) {
      throw new AppError("Access denied", 403);
    }
  }
}

function writeWorkbookResponse(res, workbook, filename) {
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
  return workbook.xlsx.write(res);
}

exports.downloadFacultyReport = async (req, res) => {
  const facultyId = req.query.facultyId || req.user.id;
  await assertFacultyReportAccess(req.user, facultyId);

  const filter = {
    faculty: facultyId,
    status: { $in: ["HOD_APPROVED", "ADMIN_APPROVED"] },
  };

  if (req.query.category && req.query.category !== "All") {
    const normalizedCategory = normalizeCategory(req.query.category);
    if (normalizedCategory) {
      filter.category = normalizedCategory;
    }
  }

  if (req.query.year && req.query.year !== "All" && !Number.isNaN(Number(req.query.year))) {
    filter.year = Number(req.query.year);
  }

  const uploads = await Upload.find(filter).sort({ createdAt: -1 });
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Faculty Activities");

  sheet.columns = [
    { header: "Category", key: "category", width: 22 },
    { header: "Title", key: "title", width: 40 },
    { header: "Credits", key: "credits", width: 12 },
    { header: "Status", key: "status", width: 18 },
    { header: "Year", key: "year", width: 10 },
    { header: "Submitted On", key: "date", width: 18 },
  ];

  uploads.forEach((upload) => {
    sheet.addRow({
      category: upload.category,
      title: upload.title || upload.metadata?.title || "-",
      credits: upload.credits,
      status: upload.status,
      year: upload.year || new Date(upload.createdAt).getFullYear(),
      date: new Date(upload.createdAt).toLocaleDateString(),
    });
  });

  await writeWorkbookResponse(res, workbook, "faculty_activities.xlsx");
  res.end();
};

exports.downloadDepartmentReport = async (req, res) => {
  const department =
    req.user.role === ROLES.ADMIN && req.query.department
      ? String(req.query.department).trim().toUpperCase()
      : req.user.department;

  const uploads = await Upload.find({
    department,
    status: { $in: ["HOD_APPROVED", "ADMIN_APPROVED"] },
  })
    .populate("faculty", "name employeeId")
    .sort({ createdAt: -1 });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Department Activities");

  sheet.columns = [
    { header: "Faculty Name", key: "faculty", width: 25 },
    { header: "Category", key: "category", width: 22 },
    { header: "Title", key: "title", width: 40 },
    { header: "Credits", key: "credits", width: 12 },
    { header: "Status", key: "status", width: 18 },
    { header: "Year", key: "year", width: 10 },
    { header: "Submitted On", key: "date", width: 18 },
  ];

  uploads.forEach((upload) => {
    sheet.addRow({
      faculty: upload.faculty?.name || "",
      category: upload.category,
      title: upload.title || upload.metadata?.title || "-",
      credits: upload.credits,
      status: upload.status,
      year: upload.year || new Date(upload.createdAt).getFullYear(),
      date: new Date(upload.createdAt).toLocaleDateString(),
    });
  });

  await writeWorkbookResponse(res, workbook, "department_activities.xlsx");
  res.end();
};
