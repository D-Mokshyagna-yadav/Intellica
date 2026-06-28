const ExcelJS = require("exceljs");
const Upload = require("../models/Upload");
const Faculty = require("../models/Faculty");
const HOD = require("../models/HOD");
const Department = require("../models/Department");
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

function buildReportFilter(req) {
  const filter = {
    status: { $in: ["HOD_APPROVED", "ADMIN_APPROVED"] },
  };

  if (req.query.department && req.query.department !== "All") {
    filter.department = String(req.query.department).trim().toUpperCase();
  }

  if (req.query.category && req.query.category !== "All") {
    const normalizedCategory = normalizeCategory(req.query.category);
    if (normalizedCategory) {
      filter.category = normalizedCategory;
    }
  }

  if (req.query.startDate || req.query.endDate) {
    filter.createdAt = {};
    if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate);
    if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate);
  }

  return filter;
}

exports.getReportByType = async (req, res) => {
  const type = String(req.params.type || "overview").toLowerCase();
  const filter = buildReportFilter(req);
  const uploads = await Upload.find(filter).populate("faculty", "name employeeId department").sort({ createdAt: -1 }).lean();
  const departments = await Department.find().lean();

  let rows = [];
  if (type.includes("faculty")) {
    rows = uploads.map((upload) => ({
      faculty: upload.faculty?.name || upload.facultyName || "",
      category: upload.categoryName || upload.category,
      title: upload.title || upload.metadata?.title || "",
      credits: upload.credits,
      year: upload.year,
    }));
  } else if (type.includes("department")) {
    const grouped = uploads.reduce((map, upload) => {
      const department = String(upload.department || "Unknown");
      const next = map.get(department) || { department, credits: 0, records: 0 };
      next.credits += Number(upload.credits) || 0;
      next.records += 1;
      map.set(department, next);
      return map;
    }, new Map());
    rows = Array.from(grouped.values());
  } else if (type.includes("category")) {
    const grouped = uploads.reduce((map, upload) => {
      const category = String(upload.categoryName || upload.category || "Other");
      const next = map.get(category) || { category, credits: 0, records: 0 };
      next.credits += Number(upload.credits) || 0;
      next.records += 1;
      map.set(category, next);
      return map;
    }, new Map());
    rows = Array.from(grouped.values());
  } else {
    rows = uploads.map((upload) => ({
      title: upload.title || upload.metadata?.title || "",
      faculty: upload.faculty?.name || upload.facultyName || "",
      category: upload.categoryName || upload.category,
      credits: upload.credits,
      department: upload.department,
      year: upload.year,
    }));
  }

  res.json({
    type,
    summary: {
      totalRecords: uploads.length,
      totalCredits: uploads.reduce((sum, upload) => sum + (Number(upload.credits) || 0), 0),
      departments: departments.length,
    },
    columns: Object.keys(rows[0] || {}),
    rows,
  });
};

exports.exportReportByType = async (req, res) => {
  const type = String(req.query.type || "overview");
  const format = String(req.query.format || "json").toLowerCase();
  const reportReq = { ...req, params: { type } };

  const payload = await new Promise((resolve, reject) => {
    const fakeRes = {
      json: resolve,
      status: () => fakeRes,
      setHeader: () => fakeRes,
      send: resolve,
    };

    exports.getReportByType(reportReq, fakeRes).catch(reject);
  });

  if (format === "csv") {
    const headers = payload.columns || [];
    const csv = [headers.join(","), ...(payload.rows || []).map((row) => headers.map((header) => JSON.stringify(row[header] ?? "")).join(","))].join("\n");
    res.setHeader("Content-Type", "text/csv");
    return res.send(csv);
  }

  res.json({ message: "Report export ready", type, format, payload });
};
