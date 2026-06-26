const path = require("path");
const fs = require("fs");
const Upload = require("../models/Upload");
const Faculty = require("../models/Faculty");
const HOD = require("../models/HOD");
const User = require("../models/User");
const calculateCredits = require("../services/creditCalculator");
const ROLES = require("../constants/roles");
const { AppError } = require("../utils/errors");
const moveUploadFile = require("../utils/moveUploadFile");

const APPROVED_STATUSES = ["HOD_APPROVED", "ADMIN_APPROVED"];
const DEPARTMENT_VISIBLE_STATUSES = ["FACULTY_SUBMITTED", "HOD_SUBMITTED", "HOD_APPROVED", "ADMIN_APPROVED", "HOD_COMMENT", "ADMIN_COMMENT"];

function getRelativeFilePath(filePath) {
  const basePath = fs.existsSync("/documents") ? "/documents" : path.join(__dirname, "..", "uploads");
  return path.relative(basePath, filePath).replace(/\\/g, "/");
}

function unwrapBody(body = {}) {
  return Object.entries(body).reduce((accumulator, [key, value]) => {
    accumulator[key] = Array.isArray(value) ? value[0] : value;
    return accumulator;
  }, {});
}

function inferYear(body) {
  const candidateValues = [
    body.year,
    body.monthYear?.split("-")[0],
    body.fromDate,
    body.date,
    body.toDate,
    body.startDate,
    body.publishedDate,
    body.completionDate,
  ].filter(Boolean);

  for (const candidateValue of candidateValues) {
    const parsedYear =
      typeof candidateValue === "string" && candidateValue.includes("-")
        ? new Date(candidateValue).getFullYear()
        : Number.parseInt(candidateValue, 10);

    if (!Number.isNaN(parsedYear) && parsedYear >= 2000 && parsedYear <= new Date().getFullYear() + 1) {
      return parsedYear;
    }
  }

  throw new AppError("A valid year is required", 400);
}

function resolveStatusForRole(role) {
  if (role === ROLES.ADMIN) return "ADMIN_APPROVED";
  if (role === ROLES.HOD) return "HOD_SUBMITTED";
  return "FACULTY_SUBMITTED";
}

async function resolveOwnerRecord(ownerId) {
  const faculty = await Faculty.findById(ownerId).select("name employeeId department role");
  if (faculty) return faculty.toObject();

  const hod = await HOD.findById(ownerId).select("name employeeId department role");
  if (hod) return hod.toObject();

  const admin = await User.findById(ownerId).select("name regId email role");
  if (admin) {
    return {
      _id: admin._id,
      name: admin.name || admin.regId,
      employeeId: admin.regId,
      department: "",
      role: admin.role,
    };
  }

  return null;
}

async function assertCanViewOwner(requester, ownerId) {
  const owner = await resolveOwnerRecord(ownerId);

  if (!owner) {
    throw new AppError("User not found", 404);
  }

  if (requester.role === ROLES.ADMIN) {
    return owner;
  }

  if (requester.role === ROLES.HOD) {
    if (owner.role === ROLES.HOD && owner._id.toString() === requester.id) {
      return owner;
    }

    if (owner.department !== requester.department) {
      throw new AppError("Access denied", 403);
    }

    return owner;
  }

  if (requester.id !== owner._id.toString()) {
    throw new AppError("Access denied", 403);
  }

  return owner;
}

exports.createUpload = async (req, res) => {
  if (![ROLES.FACULTY, ROLES.HOD, ROLES.ADMIN].includes(req.user.role)) {
    throw new AppError("Not allowed to upload", 403);
  }

  const category = req.normalizedCategory || req.body.category;
  const body = unwrapBody(req.body);
  const metadata = { ...body };
  const title =
    body.title ||
    body.paperTitle ||
    body.conferenceTitle ||
    body.conferenceName ||
    body.workshopTitle ||
    body.fdpTitle ||
    body.bookTitle ||
    body.courseName ||
    body.awardName ||
    body.policyName ||
    body.projectTitle ||
    body.startupName ||
    body.organization ||
    body.topic ||
    "";

  delete metadata.title;
  delete metadata.category;
  delete metadata.faculty;
  delete metadata.credits;

  const mainFile = req.files?.find((file) => file.fieldname === "file") || req.files?.[0];
  const filePath = mainFile ? getRelativeFilePath(mainFile.path) : "";

  const upload = await Upload.create({
    faculty: req.user.id,
    createdByRole: req.user.role,
    department: req.user.department || "",
    category,
    title,
    metadata,
    credits: await calculateCredits({ category, metadata }),
    year: inferYear(body),
    filePath,
    status: resolveStatusForRole(req.user.role),
  });

  res.status(201).json({
    message: "Upload submitted successfully",
    upload,
  });
};

exports.getMyUploads = async (req, res) => {
  const uploads = await Upload.find({ faculty: req.user.id }).sort({ createdAt: -1 });
  res.json(uploads);
};

exports.updateUpload = async (req, res) => {
  const upload = await Upload.findById(req.params.id);

  if (!upload) {
    throw new AppError("Upload not found", 404);
  }

  if (upload.faculty.toString() !== req.user.id) {
    throw new AppError("Not allowed", 403);
  }

  const body = unwrapBody(req.body);
  const category = req.normalizedCategory || upload.category;
  const metadata = { ...(upload.metadata || {}) };

  Object.entries(body).forEach(([key, value]) => {
    if (["title", "category", "credits"].includes(key)) {
      return;
    }

    if (value !== "" && value !== null && value !== undefined) {
      metadata[key] = value;
    }
  });

  const title =
    body.title ||
    metadata.title ||
    metadata.paperTitle ||
    metadata.conferenceTitle ||
    metadata.conferenceName ||
    metadata.workshopTitle ||
    metadata.fdpTitle ||
    metadata.bookTitle ||
    metadata.courseName ||
    metadata.awardName ||
    metadata.policyName ||
    metadata.projectTitle ||
    metadata.startupName ||
    metadata.organization ||
    metadata.topic ||
    upload.title ||
    "";

  const changedFields = [];
  const previousMetadata = upload.metadata || {};
  const allKeys = new Set([...Object.keys(previousMetadata), ...Object.keys(metadata)]);

  allKeys.forEach((key) => {
    const previousValue = String(previousMetadata[key] ?? "").trim();
    const nextValue = String(metadata[key] ?? "").trim();
    if (previousValue !== nextValue) {
      changedFields.push(key);
    }
  });

  if (String(upload.title || "").trim() !== String(title).trim()) {
    changedFields.push("title");
  }

  upload.previousMetadata = previousMetadata;
  upload.changedFields = changedFields;
  upload.metadata = metadata;
  upload.category = category;
  upload.title = title;
  upload.year = inferYear(body);
  upload.credits = await calculateCredits({ category, metadata });
  upload.status = resolveStatusForRole(req.user.role);

  const mainFile = req.files?.find((file) => file.fieldname === "file") || req.files?.[0];
  if (mainFile) {
    upload.filePath = getRelativeFilePath(mainFile.path);
  }

  await upload.save();

  res.json({ message: "Upload updated successfully", upload });
};

exports.getPendingUploadsForHOD = async (req, res) => {
  const uploads = await Upload.find({
    department: req.user.department,
    status: "FACULTY_SUBMITTED",
  })
    .populate("faculty", "name employeeId department role")
    .sort({ createdAt: -1 });

  res.json(uploads);
};

exports.approveUploadByHOD = async (req, res) => {
  const upload = await Upload.findById(req.params.id).populate("faculty", "name email");

  if (!upload) {
    throw new AppError("Upload not found", 404);
  }

  if (upload.department !== req.user.department) {
    throw new AppError("Access denied", 403);
  }

  upload.status = "HOD_APPROVED";
  await upload.save();
  await moveUploadFile(upload);

  const faculty = upload.faculty;
  if (faculty && faculty.email) {
    sendUploadApprovalEmail(faculty, upload.title || upload.category, "HOD").catch(() => null);
  }

  res.json({ message: "Approved by HOD" });
};

exports.getPendingUploadsForAdmin = async (req, res) => {
  const uploads = await Upload.find({
    status: { $in: ["HOD_SUBMITTED", "ADMIN_COMMENT"] },
  })
    .sort({ createdAt: -1 })
    .lean();

  const withOwners = await Promise.all(
    uploads.map(async (upload) => ({
      ...upload,
      faculty: await resolveOwnerRecord(upload.faculty),
    }))
  );

  res.json(withOwners);
};

exports.approveUploadByAdmin = async (req, res) => {
  const upload = await Upload.findById(req.params.id);

  if (!upload) {
    throw new AppError("Upload not found", 404);
  }

  upload.status = "ADMIN_APPROVED";
  await upload.save();
  await moveUploadFile(upload);

  res.json({ message: "Upload approved by admin" });
};

exports.callForDiscussion = async (req, res) => {
  const upload = await Upload.findById(req.params.id);

  if (!upload) {
    throw new AppError("Upload not found", 404);
  }

  if (req.user.role === ROLES.HOD && upload.department !== req.user.department) {
    throw new AppError("Access denied", 403);
  }

  const comment = String(req.body.comment || "").trim();

  if (!comment) {
    throw new AppError("Discussion comment is required", 400);
  }

  if (req.user.role === ROLES.HOD) {
    upload.hodComment = comment;
    upload.status = "HOD_COMMENT";
  } else {
    upload.adminComment = comment;
    upload.status = "ADMIN_COMMENT";
  }

  await upload.save();

  res.json({
    message: "Comment added",
    upload,
  });
};

exports.getUploadsByCategory = async (req, res) => {
  const category = req.normalizedCategory || req.query.category;
  const targetOwnerId = req.query.facultyId || req.user.id;

  await assertCanViewOwner(req.user, targetOwnerId);

  const uploads = await Upload.find({
    category,
    faculty: targetOwnerId,
  }).sort({ createdAt: -1 });

  res.json(uploads);
};

exports.getFacultyUploads = async (req, res) => {
  const facultyId = req.params.facultyId;
  await assertCanViewOwner(req.user, facultyId);

  const uploads = await Upload.find({
    faculty: facultyId,
    createdByRole: { $in: [ROLES.FACULTY, ROLES.HOD, ROLES.ADMIN] },
  }).sort({ createdAt: -1 });

  res.json(uploads);
};

exports.getDepartmentUploads = async (req, res) => {
  const query = {
    status: { $in: APPROVED_STATUSES },
  };

  if (req.user.role === ROLES.HOD) {
    query.department = req.user.department;
  } else if (req.query.department) {
    query.department = String(req.query.department).trim().toUpperCase();
  }

  const uploads = await Upload.find(query).sort({ createdAt: -1 }).lean();
  const withOwners = await Promise.all(
    uploads.map(async (upload) => ({
      ...upload,
      faculty: await resolveOwnerRecord(upload.faculty),
    }))
  );

  res.json(withOwners);
};

exports.getDepartmentRank = async (req, res) => {
  const departmentTotals = await Upload.aggregate([
    { $match: { status: { $in: APPROVED_STATUSES } } },
    { $group: { _id: "$department", totalCredits: { $sum: "$credits" } } },
    { $sort: { totalCredits: -1 } },
  ]);

  const rank = departmentTotals.findIndex((item) => item._id === req.user.department) + 1;

  res.json({
    rank: rank > 0 ? rank : null,
    totalDepts: departmentTotals.length,
    myDept: req.user.department,
  });
};
