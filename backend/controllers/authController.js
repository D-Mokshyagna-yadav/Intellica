const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Faculty = require("../models/Faculty");
const HOD = require("../models/HOD");
const User = require("../models/User");
const ROLES = require("../constants/roles");
const { normalizeDepartmentCode, resolveDepartment } = require("../utils/departmentLookup");
const { isEmailConfigured, sendOTP, sendRegistrationNotification } = require("../utils/emailService");
const { AppError } = require("../utils/errors");
const logger = require("../utils/logger");
const moveProfileImage = require("../utils/moveProfileImage");

function normalizeIdentifier(identifier) {
  return String(identifier || "").trim();
}

async function findUserByIdentifier(identifier) {
  const normalizedIdentifier = normalizeIdentifier(identifier);
  const lowerIdentifier = normalizedIdentifier.toLowerCase();

  const faculty = await Faculty.findOne({
    $or: [{ employeeId: normalizedIdentifier }, { email: lowerIdentifier }],
  });

  if (faculty) {
    return { user: faculty, role: ROLES.FACULTY };
  }

  const hod = await HOD.findOne({
    $or: [{ employeeId: normalizedIdentifier }, { email: lowerIdentifier }],
  });

  if (hod) {
    return { user: hod, role: ROLES.HOD };
  }

  const admin = await User.findOne({
    $or: [{ regId: normalizedIdentifier }, { email: lowerIdentifier }],
  });

  if (admin) {
    return { user: admin, role: ROLES.ADMIN };
  }

  return { user: null, role: null };
}

function assertAccountIsLoginReady(role, user) {
  if (role === ROLES.FACULTY) {
    if (user.status === "DISCUSSION") {
      throw new AppError("HOD requested discussion before approving your account", 403);
    }

    if (user.status !== "APPROVED") {
      throw new AppError("Your account is waiting for HOD approval", 403);
    }
  }

  if (role === ROLES.HOD) {
    if (user.status === "DISCUSSION") {
      throw new AppError("Admin requested discussion before approving your account", 403);
    }

    if (user.status !== "APPROVED") {
      throw new AppError("Your account is waiting for Admin approval", 403);
    }
  }
}

function buildAuthPayload(user) {
  return {
    id: user._id.toString(),
    role: user.role,
    name: user.name || user.regId || "",
    email: user.email || "",
    department: user.department || "",
    departmentName: user.departmentName || "",
    designation: user.designation || "",
    googleScholar: user.googleScholar || "",
    vidwanId: user.vidwanId || "",
    scopusId: user.scopusId || "",
    profileImage: user.profileImage || "",
  };
}

async function assertDepartmentIsValid(department) {
  const resolvedDepartment = await resolveDepartment(department);

  if (!resolvedDepartment) {
    throw new AppError("Invalid department selected", 400);
  }

  return resolvedDepartment;
}

async function sendOtpForIdentifier(identifier) {
  const { user, role } = await findUserByIdentifier(identifier);

  if (!user || !role) {
    throw new AppError("User not found", 404);
  }

  if (!user.email) {
    throw new AppError("This account cannot receive OTP because no email is configured", 400);
  }

  assertAccountIsLoginReady(role, user);

  const otp = crypto.randomInt(100000, 999999).toString();
  user.otp = otp;
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  if (!isEmailConfigured()) {
    throw new AppError("Email service is not configured. OTP login is temporarily unavailable.", 503);
  }

  await sendOTP(user.email, otp);

  return {
    role,
    expiresAt: user.otpExpires,
  };
}

exports.registerFaculty = async (req, res) => {
  if (req.fileValidationError) {
    throw new AppError(req.fileValidationError, 400);
  }

  const { employeeId, name, email, department, designation, googleScholar, vidwanId, scopusId, password } = req.body;

  if (!employeeId || !name || !email || !department || !designation) {
    throw new AppError("All fields are required", 400);
  }

  if (!req.file) {
    throw new AppError("Profile image is required", 400);
  }

  if (!googleScholar && !vidwanId && !scopusId) {
    throw new AppError("At least one research ID is required", 400);
  }

  const departmentRecord = await assertDepartmentIsValid(department);
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedEmployeeId = employeeId.trim();

  const existingFaculty = await Faculty.findOne({
    $or: [{ employeeId: normalizedEmployeeId }, { email: normalizedEmail }],
  });

  const existingHod = await HOD.findOne({
    department: departmentRecord.code,
    isApproved: true,
    status: "APPROVED",
  });

  if (existingFaculty) {
    throw new AppError("Employee ID or email already exists", 400);
  }

  if (!existingHod) {
    throw new AppError("No approved HOD found for this department", 400);
  }

  const faculty = await Faculty.create({
    employeeId: normalizedEmployeeId,
    name: name.trim(),
    email: normalizedEmail,
    department: departmentRecord.code,
    departmentName: departmentRecord.name,
    designation: designation.trim(),
    googleScholar: googleScholar?.trim() || "",
    vidwanId: vidwanId?.trim() || "",
    scopusId: scopusId?.trim() || "",
    role: ROLES.FACULTY,
    isApproved: false,
    status: "PENDING",
    profileImage: req.file.filename,
    password: password ? await bcrypt.hash(password, 12) : null,
  });

  sendRegistrationNotification({
    name: faculty.name,
    email: faculty.email,
    role: ROLES.FACULTY,
    department: faculty.departmentName,
  }).catch((error) => logger.warn({ err: error }, "Failed to send faculty registration notification"));

  res.status(201).json({
    message: `Faculty registered under ${departmentRecord.name}. Waiting for HOD approval.`,
  });
};

exports.registerHOD = async (req, res) => {
  if (req.fileValidationError) {
    throw new AppError(req.fileValidationError, 400);
  }

  const { employeeId, name, email, department, designation, googleScholar, vidwanId, scopusId, password } = req.body;

  if (!employeeId || !name || !email || !department || !designation) {
    throw new AppError("All fields are required", 400);
  }

  if (!req.file) {
    throw new AppError("Profile image is required", 400);
  }

  const departmentRecord = await assertDepartmentIsValid(department);
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedEmployeeId = employeeId.trim();

  const existingHod = await HOD.findOne({
    $or: [{ employeeId: normalizedEmployeeId }, { email: normalizedEmail }, { department: departmentRecord.code }],
  });

  if (existingHod) {
    throw new AppError("HOD already exists for this employee, email, or department", 400);
  }

  const hod = await HOD.create({
    employeeId: normalizedEmployeeId,
    name: name.trim(),
    email: normalizedEmail,
    department: departmentRecord.code,
    departmentName: departmentRecord.name,
    designation: designation.trim(),
    googleScholar: googleScholar?.trim() || "",
    vidwanId: vidwanId?.trim() || "",
    scopusId: scopusId?.trim() || "",
    role: ROLES.HOD,
    isApproved: false,
    status: "PENDING",
    profileImage: req.file.filename,
    password: password ? await bcrypt.hash(password, 12) : null,
  });

  sendRegistrationNotification({
    name: hod.name,
    email: hod.email,
    role: ROLES.HOD,
    department: hod.departmentName,
  }).catch((error) => logger.warn({ err: error }, "Failed to send HOD registration notification"));

  res.status(201).json({
    message: `HOD registered for ${departmentRecord.name}. Waiting for Admin approval.`,
  });
};

exports.login = async (req, res) => {
  const identifier = normalizeIdentifier(req.body.identifier);

  if (!identifier) {
    throw new AppError("Identifier is required", 400);
  }

  const { expiresAt } = await sendOtpForIdentifier(identifier);

  res.status(200).json({
    message: "OTP sent to your email. Please check your inbox.",
    expiresAt,
  });
};

exports.resendOTP = async (req, res) => {
  const identifier = normalizeIdentifier(req.body.identifier);

  if (!identifier) {
    throw new AppError("Identifier is required", 400);
  }

  const { expiresAt } = await sendOtpForIdentifier(identifier);

  res.status(200).json({
    message: "A fresh OTP has been sent to your email.",
    expiresAt,
  });
};

exports.verifyOTP = async (req, res) => {
  const identifier = normalizeIdentifier(req.body.identifier);
  const otp = normalizeIdentifier(req.body.otp);

  if (!identifier || !otp) {
    throw new AppError("Identifier and OTP are required", 400);
  }

  const { user } = await findUserByIdentifier(identifier);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.otp || user.otp !== otp) {
    throw new AppError("Invalid OTP", 401);
  }

  if (!user.otpExpires || user.otpExpires < new Date()) {
    throw new AppError("OTP expired", 401);
  }

  user.otp = null;
  user.otpExpires = null;
  await user.save();

  const payload = buildAuthPayload(user);
  const token = jwt.sign(
    {
      id: payload.id,
      role: payload.role,
      department: payload.department || null,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  res.status(200).json({
    token,
    ...payload,
    message: "Login successful",
  });
};

exports.loginWithPassword = async (req, res) => {
  const identifier = normalizeIdentifier(req.body.identifier);
  const password = req.body.password;

  if (!identifier || !password) {
    throw new AppError("Identifier and password are required", 400);
  }

  const { user, role } = await findUserByIdentifier(identifier);

  if (!user || !role) {
    throw new AppError("User not found", 404);
  }

  assertAccountIsLoginReady(role, user);

  if (!user.password) {
    throw new AppError("No password is set for this account. Please use OTP login.", 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError("Invalid credentials", 401);
  }

  const payload = buildAuthPayload(user);
  const token = jwt.sign(
    {
      id: payload.id,
      role: payload.role,
      department: payload.department || null,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  res.status(200).json({
    token,
    ...payload,
    message: "Login successful",
  });
};

exports.resetPasswordWithOTP = async (req, res) => {
  const identifier = normalizeIdentifier(req.body.identifier);
  const otp = normalizeIdentifier(req.body.otp);
  const newPassword = req.body.newPassword;

  if (!identifier || !otp || !newPassword) {
    throw new AppError("Identifier, OTP, and new password are required", 400);
  }

  const { user } = await findUserByIdentifier(identifier);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.otp || user.otp !== otp) {
    throw new AppError("Invalid OTP", 401);
  }

  if (!user.otpExpires || user.otpExpires < new Date()) {
    throw new AppError("OTP expired", 401);
  }

  user.otp = null;
  user.otpExpires = null;
  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();

  res.status(200).json({
    message: "Password reset successful. You can now login with your new password.",
  });
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!newPassword) {
    throw new AppError("New password is required", 400);
  }

  const targetModel = req.user.role === ROLES.FACULTY ? Faculty : req.user.role === ROLES.HOD ? HOD : User;
  const user = await targetModel.findById(req.user.id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // If user already has a password, verify current password
  if (user.password) {
    if (!currentPassword) {
      throw new AppError("Current password is required to change it", 400);
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new AppError("Incorrect current password", 401);
    }
  }

  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();

  res.status(200).json({ message: "Password updated successfully" });
};

exports.getMe = async (req, res) => {
  const { user, role } = await findUserByIdentifier(req.user.email || req.user.employeeId || req.user.id);

  if (!user || !role) {
    throw new AppError("User not found", 404);
  }

  res.json(buildAuthPayload(user));
};

exports.updateProfile = async (req, res) => {
  const { name, email, designation, googleScholar, scopusId, vidwanId } = req.body;
  const targetModel = req.user.role === ROLES.FACULTY ? Faculty : req.user.role === ROLES.HOD ? HOD : User;

  const user = await targetModel.findById(req.user.id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (name) user.name = name.trim();
  if (email) user.email = email.trim().toLowerCase();
  if (designation && "designation" in user) user.designation = designation.trim();
  if ("googleScholar" in user) user.googleScholar = googleScholar?.trim() || "";
  if ("scopusId" in user) user.scopusId = scopusId?.trim() || "";
  if ("vidwanId" in user) user.vidwanId = vidwanId?.trim() || "";

  await user.save();

  res.json({
    message: "Profile updated successfully",
    profile: buildAuthPayload(user),
  });
};

exports.updateProfileImage = async (req, res) => {
  if (!req.file) {
    throw new AppError("Image is required", 400);
  }

  const targetModel = req.user.role === ROLES.FACULTY ? Faculty : req.user.role === ROLES.HOD ? HOD : User;
  const user = await targetModel.findById(req.user.id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  user.profileImage = req.file.filename;
  await user.save();
  await moveProfileImage(user);

  res.json({
    message: "Profile image updated successfully",
    profileImage: user.profileImage,
  });
};

exports.getFacultyProfile = async (req, res) => {
  if (req.user.role === ROLES.FACULTY && req.user.id !== req.params.id) {
    throw new AppError("Access denied", 403);
  }

  const faculty = await Faculty.findById(req.params.id).select("-password");

  if (!faculty) {
    throw new AppError("Faculty not found", 404);
  }

  if (req.user.role === ROLES.HOD && faculty.department !== req.user.department) {
    throw new AppError("Access denied", 403);
  }

  res.json(faculty);
};
