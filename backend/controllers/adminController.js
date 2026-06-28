const bcrypt = require("bcryptjs");
const Faculty = require("../models/Faculty");
const HOD = require("../models/HOD");
const User = require("../models/User");
const Upload = require("../models/Upload");
const Department = require("../models/Department");
const College = require("../models/College");
const Notification = require("../models/Notification");
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
const logger = require("../utils/logger");
const ExcelJS = require("exceljs");

async function findManagedUser(userId) {
  const faculty = await Faculty.findById(userId);
  if (faculty) return faculty;

  const hod = await HOD.findById(userId);
  if (hod) return hod;

  const admin = await User.findById(userId);
  if (admin) return admin;

  return null;
}

async function findDuplicateAccount({ employeeId, email }) {
  const normalizedEmployeeId = String(employeeId || "").trim();
  const normalizedEmail = String(email || "").trim().toLowerCase();

  const [faculty, hod] = await Promise.all([
    Faculty.findOne({
      $or: [{ employeeId: normalizedEmployeeId }, { email: normalizedEmail }],
    }),
    HOD.findOne({
      $or: [{ employeeId: normalizedEmployeeId }, { email: normalizedEmail }],
    }),
  ]);

  return faculty || hod;
}

function normalizeDepartmentCode(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function generateDepartmentCode(name) {
  const normalized = normalizeDepartmentCode(name);
  return normalized || "DEPARTMENT";
}

async function updateDepartmentReferences(previousCode, nextCode, nextName) {
  if (previousCode === nextCode) {
    await Promise.all([
      Faculty.updateMany({ department: previousCode }, { $set: { departmentName: nextName } }),
      HOD.updateMany({ department: previousCode }, { $set: { departmentName: nextName } }),
    ]);
    return;
  }

  await Promise.all([
    Faculty.updateMany(
      { department: previousCode },
      { $set: { department: nextCode, departmentName: nextName } }
    ),
    HOD.updateMany(
      { department: previousCode },
      { $set: { department: nextCode, departmentName: nextName } }
    ),
    Upload.updateMany(
      { department: previousCode },
      { $set: { department: nextCode } }
    ),
    Notification.updateMany(
      { audienceDepartment: previousCode },
      { $set: { audienceDepartment: nextCode } }
    ),
  ]);
}

exports.createManualUser = async (req, res) => {
  const role = String(req.body.role || "").trim().toUpperCase();
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

  if (![ROLES.FACULTY, ROLES.HOD].includes(role)) {
    throw new AppError("Invalid role selected", 400);
  }

  if (!employeeId || !name || !email || !req.body.department || !designation) {
    throw new AppError("Employee ID, name, email, department, and designation are required", 400);
  }

  if (!googleScholar && !vidwanId && !scopusId) {
    throw new AppError("At least one research identifier is required", 400);
  }

  const departmentRecord = await resolveDepartment(req.body.department);
  if (!departmentRecord) {
    throw new AppError("Invalid department", 400);
  }

  const existingAccount = await findDuplicateAccount({ employeeId, email });
  if (existingAccount) {
    throw new AppError("Employee ID or email already exists", 400);
  }

  const basePayload = {
    employeeId,
    name,
    email,
    mobile,
    department: departmentRecord.code,
    departmentName: departmentRecord.name,
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
    createdByRole: ROLES.ADMIN,
    password: password ? await bcrypt.hash(password, 12) : null,
  };

  let createdUser;

  if (role === ROLES.FACULTY) {
    createdUser = await Faculty.create({
      ...basePayload,
      role: ROLES.FACULTY,
    });

    const hod = await HOD.findOne({
      department: departmentRecord.code,
      isApproved: true,
      status: "APPROVED",
    }).select("name email department");

    if (hod) {
      await createNotification({
        message: `Admin created faculty account for ${createdUser.name} in ${departmentRecord.name}.`,
        audienceRoles: [ROLES.HOD],
        audienceDepartment: departmentRecord.code,
        metadata: {
          facultyName: createdUser.name,
          departmentName: departmentRecord.name,
          createdBy: req.user.name,
          createdByRole: ROLES.ADMIN,
        },
      });
    }

    sendApprovalEmailToFaculty(createdUser).catch((error) => logger.warn({ err: error }, "Failed to send faculty creation email"));
  } else {
    const duplicateDepartmentHod = await HOD.findOne({
      department: departmentRecord.code,
    });

    if (duplicateDepartmentHod) {
      throw new AppError("A HOD already exists for this department", 400);
    }

    createdUser = await HOD.create({
      ...basePayload,
      role: ROLES.HOD,
    });

    sendApprovalEmailToHod(createdUser).catch((error) => logger.warn({ err: error }, "Failed to send HOD creation email"));
  }

  res.status(201).json({
    message: `${role === ROLES.FACULTY ? "Faculty" : "HOD"} created successfully`,
    user: createdUser,
  });
};

exports.getManagedDepartments = async (_req, res) => {
  const departments = await Department.find()
    .populate("college", "name code")
    .sort({ isArchived: 1, sortOrder: 1, name: 1 })
    .lean();

  res.json(departments);
};

exports.createDepartment = async (req, res) => {
  const name = String(req.body.name || "").trim();
  const code = normalizeDepartmentCode(req.body.code || name);
  const description = String(req.body.description || "").trim();
  const sortOrder = Number.isFinite(Number(req.body.sortOrder)) ? Number(req.body.sortOrder) : 0;

  if (!name) {
    throw new AppError("Department name is required", 400);
  }

  if (!code) {
    throw new AppError("Department code is required", 400);
  }

  const duplicate = await Department.findOne({
    $or: [{ code }, { name }],
  }).lean();

  if (duplicate) {
    throw new AppError("Department code or name already exists", 400);
  }

  const college = await College.findOne({ isActive: true, isArchived: false }).select("_id").lean();

  const department = await Department.create({
    name,
    code,
    description,
    sortOrder,
    college: college?._id || null,
    isActive: true,
    isArchived: false,
    archivedAt: null,
    metadata: {},
  });

  res.status(201).json({
    message: "Department created successfully",
    department,
  });
};

exports.updateDepartment = async (req, res) => {
  const department = await Department.findById(req.params.id);

  if (!department) {
    throw new AppError("Department not found", 404);
  }

  const nextName = String(req.body.name || department.name).trim();
  const nextCode = normalizeDepartmentCode(req.body.code || department.code);
  const nextDescription = req.body.description === undefined
    ? department.description
    : String(req.body.description || "").trim();
  const nextSortOrder = Number.isFinite(Number(req.body.sortOrder)) ? Number(req.body.sortOrder) : department.sortOrder;
  const nextActive = typeof req.body.isActive === "boolean" ? req.body.isActive : department.isActive;

  if (!nextName) {
    throw new AppError("Department name is required", 400);
  }

  if (!nextCode) {
    throw new AppError("Department code is required", 400);
  }

  const duplicate = await Department.findOne({
    _id: { $ne: department._id },
    $or: [{ code: nextCode }, { name: nextName }],
  }).lean();

  if (duplicate) {
    throw new AppError("Department code or name already exists", 400);
  }

  const previousCode = department.code;
  department.name = nextName;
  department.code = nextCode;
  department.description = nextDescription;
  department.sortOrder = nextSortOrder;
  department.isActive = nextActive;
  department.isArchived = false;
  department.archivedAt = null;
  await department.save();

  await updateDepartmentReferences(previousCode, nextCode, nextName);

  res.json({
    message: "Department updated successfully",
    department: await Department.findById(department._id).populate("college", "name code").lean(),
  });
};



exports.mergeDepartments = async (req, res) => {
  const { sourceDepartmentCode, targetDepartmentCode } = req.body;

  if (!sourceDepartmentCode || !targetDepartmentCode) {
    throw new AppError("Source and target department codes are required", 400);
  }

  if (sourceDepartmentCode === targetDepartmentCode) {
    throw new AppError("Source and target departments cannot be the same", 400);
  }

  const sourceDept = await resolveDepartment(sourceDepartmentCode);
  const targetDept = await resolveDepartment(targetDepartmentCode);

  if (!sourceDept) throw new AppError("Source department not found", 404);
  if (!targetDept) throw new AppError("Target department not found", 404);

  // Move HODs
  await HOD.updateMany(
    { department: sourceDept.code },
    { $set: { department: targetDept.code, departmentName: targetDept.name } }
  );

  // Move Faculty
  await Faculty.updateMany(
    { department: sourceDept.code },
    { $set: { department: targetDept.code, departmentName: targetDept.name } }
  );

  res.json({
    message: `Successfully merged ${sourceDept.name} into ${targetDept.name}`,
  });
};

exports.deleteDepartment = async (req, res) => {
  const department = await Department.findById(req.params.id);

  if (!department) {
    throw new AppError("Department not found", 404);
  }

  department.isArchived = true;
  department.isActive = false;
  department.archivedAt = new Date();
  await department.save();

  res.json({
    message: "Department archived successfully",
    department,
  });
};

exports.restoreDepartment = async (req, res) => {
  const department = await Department.findById(req.params.id);

  if (!department) {
    throw new AppError("Department not found", 404);
  }

  department.isArchived = false;
  department.isActive = true;
  department.archivedAt = null;
  await department.save();

  res.json({
    message: "Department restored successfully",
    department,
  });
};

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

exports.approveManagedUser = async (req, res) => {
  const user = await findManagedUser(req.params.id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if ("status" in user) user.status = "APPROVED";
  if ("isApproved" in user) user.isApproved = true;
  await user.save();

  res.json({ message: "User approved successfully", user });
};

exports.rejectManagedUser = async (req, res) => {
  const user = await findManagedUser(req.params.id);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if ("status" in user) user.status = "REJECTED";
  if ("isApproved" in user) user.isApproved = false;
  await user.save();

  res.json({ message: "User rejected successfully", user });
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

exports.exportUsers = async (req, res) => {
  const [faculty, hods] = await Promise.all([
    Faculty.find().select("-password -__v").lean(),
    HOD.find().select("-password -__v").lean(),
  ]);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Users");

  sheet.columns = [
    { header: "Role", key: "role", width: 15 },
    { header: "Employee ID", key: "employeeId", width: 15 },
    { header: "Name", key: "name", width: 25 },
    { header: "Email", key: "email", width: 30 },
    { header: "Department", key: "department", width: 15 },
    { header: "Designation", key: "designation", width: 20 },
    { header: "Status", key: "status", width: 15 },
  ];

  const allUsers = [...faculty, ...hods];
  allUsers.forEach((user) => {
    sheet.addRow({
      role: user.role,
      employeeId: user.employeeId,
      name: user.name,
      email: user.email,
      department: user.department,
      designation: user.designation,
      status: user.status,
    });
  });

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", "attachment; filename=users_export.xlsx");
  return workbook.xlsx.write(res);
};

exports.importUsers = async (req, res) => {
  if (!req.file) {
    throw new AppError("No file uploaded", 400);
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(req.file.buffer);
  const sheet = workbook.getWorksheet(1);
  
  if (!sheet) {
    throw new AppError("Invalid Excel file", 400);
  }

  const results = { success: 0, failed: 0, errors: [] };
  
  // Skip header row
  for (let i = 2; i <= sheet.rowCount; i++) {
    const row = sheet.getRow(i);
    const role = String(row.getCell(1).value || "").trim().toUpperCase();
    const employeeId = String(row.getCell(2).value || "").trim();
    const name = String(row.getCell(3).value || "").trim();
    const email = String(row.getCell(4).value || "").trim().toLowerCase();
    const department = String(row.getCell(5).value || "").trim();
    const designation = String(row.getCell(6).value || "").trim();

    if (!employeeId || !email) continue;

    try {
      const existing = await findDuplicateAccount({ employeeId, email });
      if (existing) {
        results.failed++;
        results.errors.push(`Row ${i}: User with ID ${employeeId} or Email ${email} already exists.`);
        continue;
      }

      const departmentRecord = await resolveDepartment(department);
      if (!departmentRecord) {
        results.failed++;
        results.errors.push(`Row ${i}: Invalid department ${department}.`);
        continue;
      }

      const payload = {
        employeeId,
        name,
        email,
        department: departmentRecord.code,
        departmentName: departmentRecord.name,
        designation: designation || "Faculty",
        role: role === ROLES.HOD ? ROLES.HOD : ROLES.FACULTY,
        isApproved: true,
        status: "APPROVED",
        createdBy: req.user.id,
        createdByRole: ROLES.ADMIN,
      };

      if (role === ROLES.HOD) {
        await HOD.create(payload);
      } else {
        await Faculty.create(payload);
      }
      
      results.success++;
    } catch (err) {
      results.failed++;
      results.errors.push(`Row ${i}: ${err.message}`);
    }
  }

  res.status(200).json({
    message: "Import completed",
    results,
  });
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

exports.promoteToHod = async (req, res) => {
  const faculty = await Faculty.findById(req.params.id);
  if (!faculty) throw new AppError("Faculty not found", 404);

  const newUserData = faculty.toObject();
  newUserData.role = ROLES.HOD;

  await HOD.create(newUserData);
  await Faculty.deleteOne({ _id: faculty._id });

  res.json({ message: "Promoted to HOD successfully" });
};

exports.demoteToFaculty = async (req, res) => {
  const hod = await HOD.findById(req.params.id);
  if (!hod) throw new AppError("HOD not found", 404);

  const newUserData = hod.toObject();
  newUserData.role = ROLES.FACULTY;

  await Faculty.create(newUserData);
  await HOD.deleteOne({ _id: hod._id });

  res.json({ message: "Demoted to Faculty successfully" });
};
