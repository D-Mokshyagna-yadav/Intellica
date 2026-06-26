const Faculty = require("../models/Faculty");
const HOD = require("../models/HOD");
const User = require("../models/User");
const Upload = require("../models/Upload");
const Department = require("../models/Department");
const ROLES = require("../constants/roles");
const { sendApprovalEmailToFaculty, sendApprovalEmailToHod, sendUploadApprovalEmail } = require("../utils/emailService");
const { createNotification } = require("../utils/notificationService");
const createUserFolder = require("../utils/createUserFolder");
const moveProfileImage = require("../utils/moveProfileImage");
const moveUserFolder = require("../utils/moveUserFolder");
const deleteUserFolder = require("../utils/deleteUserFolder");
const moveUploadFile = require("../utils/moveUploadFile");
const { resolveDepartment } = require("../utils/departmentLookup");
const { AppError } = require("../utils/errors");

async function findManagedUser(userId) {
  const faculty = await Faculty.findById(userId);
  if (faculty) return faculty;

  const hod = await HOD.findById(userId);
  if (hod) return hod;

  const admin = await User.findById(userId);
  if (admin) return admin;

  return null;
}

exports.getAllHods = async (req, res) => {
  const hods = await HOD.find().sort({ createdAt: -1 });
  res.status(200).json(hods);
};

exports.getPendingHods = async (req, res) => {
  const hods = await HOD.find({ isApproved: false }).sort({ createdAt: -1 });
  res.status(200).json(hods);
};

exports.approveHod = async (req, res) => {
  const hod = await HOD.findById(req.params.id);

  if (!hod) {
    throw new AppError("HOD not found", 404);
  }

  hod.isApproved = true;
  hod.status = "APPROVED";
  hod.discussionComment = "";
  await hod.save();

  createUserFolder(hod);
  await moveProfileImage(hod);

  await createNotification({
    message: `Admin approved HOD ${hod.name}`,
    audienceRoles: [ROLES.HOD, ROLES.ADMIN],
    audienceDepartment: hod.department,
  });

  sendApprovalEmailToHod(hod).catch(() => null);

  res.status(200).json({
    message: "HOD approved successfully",
    hod,
  });
};

exports.hodDiscussion = async (req, res) => {
  const hod = await HOD.findById(req.params.id);

  if (!hod) {
    throw new AppError("HOD not found", 404);
  }

  const comment = String(req.body.comment || "Admin requested discussion").trim();
  hod.discussionComment = comment;
  hod.status = "DISCUSSION";
  hod.isApproved = false;
  await hod.save();

  await createNotification({
    message: `${hod.name} was marked for discussion by Admin`,
    audienceRoles: [ROLES.ADMIN, ROLES.HOD],
    audienceDepartment: hod.department,
    audienceUserId: hod._id.toString(),
  });

  res.json({ message: "Discussion requested successfully" });
};

exports.removeApprovedHod = async (req, res) => {
  const hod = await HOD.findByIdAndDelete(req.params.id);

  if (!hod) {
    throw new AppError("HOD not found", 404);
  }

  await Upload.deleteMany({ faculty: hod._id });

  res.json({ message: "HOD removed successfully" });
};

exports.getPendingUploadsForAdmin = async (req, res) => {
  const uploads = await Upload.find({
    status: { $in: ["HOD_SUBMITTED", "ADMIN_COMMENT"] },
  })
    .populate("faculty", "name employeeId department role")
    .sort({ createdAt: -1 });

  res.status(200).json(uploads);
};

exports.approveUploadByAdmin = async (req, res) => {
  const upload = await Upload.findById(req.params.id).populate("faculty", "name email");

  if (!upload) {
    throw new AppError("Upload not found", 404);
  }

  upload.status = "ADMIN_APPROVED";
  await upload.save();
  await moveUploadFile(upload);

  const faculty = upload.faculty;
  if (faculty && faculty.email) {
    sendUploadApprovalEmail(faculty, upload.title || upload.category, "ADMIN").catch(() => null);
  }

  res.status(200).json({ message: "Upload approved by Admin" });
};

exports.adminDiscussion = async (req, res) => {
  const upload = await Upload.findById(req.params.id);

  if (!upload) {
    throw new AppError("Upload not found", 404);
  }

  const comment = String(req.body.comment || "").trim();
  if (!comment) {
    throw new AppError("Discussion comment is required", 400);
  }

  upload.status = "ADMIN_COMMENT";
  upload.adminComment = comment;
  await upload.save();

  res.status(200).json({
    message: "Discussion requested",
    upload,
  });
};

exports.getDepartmentStatus = async (req, res) => {
  const departments = await Department.find({ isActive: true, isArchived: false })
    .select("name code")
    .sort({ sortOrder: 1, name: 1 })
    .lean();

  const result = await Promise.all(
    departments.map(async (department) => {
      const hod = await HOD.findOne({
        department: department.code,
        isApproved: true,
        status: "APPROVED",
      }).select("name employeeId");

      const facultyCount = await Faculty.countDocuments({
        department: department.code,
        isApproved: true,
        status: "APPROVED",
      });

      return {
        department: department.code,
        departmentName: department.name,
        hodName: hod?.name || null,
        facultyCount,
      };
    })
  );

  res.status(200).json(result);
};

exports.getTopDepartments = async (req, res) => {
  const departments = await Department.find({ isActive: true, isArchived: false })
    .select("name code")
    .lean();
  const departmentNames = new Map(departments.map((department) => [department.code, department.name]));

  const result = await Upload.aggregate([
    { $match: { status: { $in: ["HOD_APPROVED", "ADMIN_APPROVED"] } } },
    { $group: { _id: "$department", totalCredits: { $sum: "$credits" } } },
    { $sort: { totalCredits: -1 } },
    { $limit: 4 },
  ]);

  res.json(
    result.map((item) => ({
      department: item._id,
      departmentName: departmentNames.get(item._id) || item._id,
      credits: item.totalCredits,
    }))
  );
};

exports.getActivityStats = async (req, res) => {
  const result = await Upload.aggregate([
    { $match: { status: { $in: ["HOD_APPROVED", "ADMIN_APPROVED"] } } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 8 },
  ]);

  res.json(
    result.map((item) => ({
      category: item._id,
      count: item.count,
    }))
  );
};

exports.getAllUsers = async (req, res) => {
  const [faculty, hods, admins] = await Promise.all([
    Faculty.find().select("-password").lean(),
    HOD.find().select("-password").lean(),
    User.find().select("-password").lean(),
  ]);

  const normalizedAdmins = admins.map((admin) => ({
    ...admin,
    employeeId: admin.regId,
    department: admin.department || "",
    name: admin.name || admin.regId,
  }));

  res.json([...faculty, ...hods, ...normalizedAdmins]);
};

exports.deleteUser = async (req, res) => {
  const user = await findManagedUser(req.params.id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.role === ROLES.ADMIN) {
    throw new AppError("Admin accounts cannot be removed from the UI", 403);
  }

  await Upload.deleteMany({ faculty: user._id });
  deleteUserFolder(user);
  await user.deleteOne();

  res.json({ message: "User removed successfully" });
};

exports.changeDepartment = async (req, res) => {
  const resolvedDepartment = await resolveDepartment(req.body.department);

  if (!resolvedDepartment) {
    throw new AppError("Invalid department", 400);
  }

  const user = await findManagedUser(req.params.id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!("department" in user)) {
    throw new AppError("This account does not support department changes", 400);
  }

  const previousDepartment = user.department;
  user.department = resolvedDepartment.code;
  if ("departmentName" in user) {
    user.departmentName = resolvedDepartment.name;
  }
  await user.save();

  await moveUserFolder(user, previousDepartment);
  await Upload.updateMany({ faculty: user._id }, { $set: { department: resolvedDepartment.code } });

  res.json({
    message: "Department updated successfully",
    previousDepartment,
    department: resolvedDepartment.code,
    departmentName: resolvedDepartment.name,
  });
};

exports.getDepartmentAnalytics = async (req, res) => {
  const resolvedDepartment = await resolveDepartment(req.params.department);

  if (!resolvedDepartment) {
    throw new AppError("Invalid department", 400);
  }

  const uploads = await Upload.find({
    department: resolvedDepartment.code,
    status: { $in: ["HOD_APPROVED", "ADMIN_APPROVED"] },
  }).lean();

  res.json({
    department: resolvedDepartment.code,
    departmentName: resolvedDepartment.name,
    totalActivities: uploads.length,
    totalCredits: uploads.reduce((sum, upload) => sum + Number(upload.credits || 0), 0),
  });
};
