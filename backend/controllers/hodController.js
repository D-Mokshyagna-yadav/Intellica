const bcrypt = require("bcryptjs");
const Faculty = require("../models/Faculty");
const HOD = require("../models/HOD");
const Upload = require("../models/Upload");
const ROLES = require("../constants/roles");
const createUserFolder = require("../utils/createUserFolder");
const moveProfileImage = require("../utils/moveProfileImage");
const { sendApprovalEmailToFaculty } = require("../utils/emailService");
const { createNotification } = require("../utils/notificationService");
const { AppError } = require("../utils/errors");

exports.getPendingFaculty = async (req, res) => {
  const faculty = await Faculty.find({
    status: { $in: ["PENDING", "DISCUSSION"] },
    department: req.user.department,
  }).sort({ createdAt: -1 });

  res.status(200).json(faculty);
};

exports.approveFaculty = async (req, res) => {
  const faculty = await Faculty.findById(req.params.id);

  if (!faculty) {
    throw new AppError("Faculty not found", 404);
  }

  if (faculty.department !== req.user.department) {
    throw new AppError("You cannot approve faculty from another department", 403);
  }

  faculty.status = "APPROVED";
  faculty.isApproved = true;
  await faculty.save();

  createUserFolder(faculty);
  await moveProfileImage(faculty);

  await createNotification({
    message: `${req.user.name} approved faculty ${faculty.name}`,
    audienceRoles: [ROLES.HOD, ROLES.FACULTY],
    audienceDepartment: req.user.department,
    audienceUserId: faculty._id.toString(),
  });

  sendApprovalEmailToFaculty(faculty).catch(() => null);

  res.status(200).json({
    message: "Faculty approved successfully",
    faculty,
  });
};

exports.discussionFaculty = async (req, res) => {
  const faculty = await Faculty.findById(req.params.id);

  if (!faculty) {
    throw new AppError("Faculty not found", 404);
  }

  if (faculty.department !== req.user.department) {
    throw new AppError("You cannot manage faculty from another department", 403);
  }

  faculty.status = "DISCUSSION";
  await faculty.save();

  await createNotification({
    message: `${req.user.name} requested discussion with ${faculty.name}`,
    audienceRoles: [ROLES.HOD, ROLES.FACULTY],
    audienceDepartment: req.user.department,
    audienceUserId: faculty._id.toString(),
  });

  res.status(200).json({
    message: "Faculty called for discussion",
  });
};

exports.getApprovedFaculty = async (req, res) => {
  const faculty = await Faculty.find({
    department: req.user.department,
    status: "APPROVED",
    isApproved: true,
  }).sort({ name: 1 });

  res.json(faculty);
};

exports.getFacultyUploads = async (req, res) => {
  const ownerId = req.params.facultyId;

  let faculty = await Faculty.findById(ownerId);
  if (faculty) {
    if (faculty.department !== req.user.department) {
      throw new AppError("You cannot view another department faculty", 403);
    }

    const uploads = await Upload.find({ faculty: ownerId }).sort({ createdAt: -1 });
    return res.json(uploads);
  }

  const hod = await HOD.findById(ownerId);
  if (!hod) {
    throw new AppError("User not found", 404);
  }

  if (hod.department !== req.user.department || hod._id.toString() !== req.user.id) {
    throw new AppError("Access denied", 403);
  }

  const uploads = await Upload.find({ faculty: hod._id }).sort({ createdAt: -1 });
  return res.json(uploads);
};

exports.getHodProfile = async (req, res) => {
  const hod = await HOD.findById(req.user.id).select("-password");

  if (!hod) {
    throw new AppError("HOD not found", 404);
  }

  res.json(hod);
};

exports.createFaculty = async (req, res) => {
  const employeeId = String(req.body.employeeId || "").trim();
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const mobile = String(req.body.mobile || "").trim();
  const designation = String(req.body.designation || "").trim();
  const employmentType = String(req.body.employmentType || "Full-Time").trim();
  const password = req.body.password;
  const googleScholar = String(req.body.googleScholar || "").trim();
  const vidwanId = String(req.body.vidwanId || "").trim();
  const scopusId = String(req.body.scopusId || "").trim();

  if (!employeeId || !name || !email || !designation) {
    throw new AppError("Employee ID, name, email, and designation are required", 400);
  }

  if (!googleScholar && !vidwanId && !scopusId) {
    throw new AppError("At least one research identifier is required", 400);
  }

  const existingFaculty = await Faculty.findOne({
    $or: [{ employeeId }, { email }],
  });

  if (existingFaculty) {
    throw new AppError("Employee ID or email already exists", 400);
  }

  const createdUser = await Faculty.create({
    employeeId,
    name,
    email,
    mobile,
    department: req.user.department,
    departmentName: req.user.departmentName,
    designation,
    employmentType,
    googleScholar,
    vidwanId,
    scopusId,
    isApproved: true,
    status: "APPROVED",
    profileCompleted: false,
    profileImage: "",
    createdBy: req.user.id,
    createdByRole: ROLES.HOD,
    password: password ? await bcrypt.hash(password, 12) : null,
  });

  sendApprovalEmailToFaculty(createdUser).catch((error) => logger.warn({ err: error }, "Failed to send faculty creation email"));

  res.status(201).json({
    message: "Faculty created successfully",
    user: createdUser,
  });
};

