const Faculty = require("../models/Faculty");
const Upload = require("../models/Upload");
const ROLES = require("../constants/roles");
const { AppError } = require("../utils/errors");

exports.getProfile = async (req, res) => {
  const faculty = await Faculty.findById(req.user.id).select("-password");

  if (!faculty) {
    throw new AppError("Faculty not found", 404);
  }

  res.status(200).json(faculty);
};

exports.getFacultyById = async (req, res) => {
  const faculty = await Faculty.findById(req.params.id).select("-password");

  if (!faculty) {
    throw new AppError("Faculty not found", 404);
  }

  if (req.user.role === ROLES.HOD && faculty.department !== req.user.department) {
    throw new AppError("Access denied", 403);
  }

  res.status(200).json(faculty);
};

// Get all faculty (HOD/Admin only)
exports.getAllFaculty = async (req, res) => {
  if (req.user.role === ROLES.HOD) {
    const faculties = await Faculty.find({ department: req.user.department }).select("-password");
    return res.json(faculties);
  }

  if (req.user.role !== ROLES.ADMIN) {
    throw new AppError("Access denied", 403);
  }

  const { department, status, search } = req.query;
  let filter = {};

  if (department) filter.department = department;
  if (status) filter.approvalStatus = status;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { employeeId: { $regex: search, $options: "i" } }
    ];
  }

  const faculties = await Faculty.find(filter).select("-password");
  res.json(faculties);
};

// Update faculty profile
exports.updateFacultyProfile = async (req, res) => {
  const faculty = await Faculty.findByIdAndUpdate(
    req.user.id,
    {
      ...req.body,
      lastModified: new Date()
    },
    { new: true }
  ).select("-password");

  if (!faculty) {
    throw new AppError("Faculty not found", 404);
  }

  res.json({
    message: "Profile updated successfully",
    faculty
  });
};

// Get faculty statistics
exports.getFacultyStats = async (req, res) => {
  const facultyId = req.params.id || req.user.id;

  // Check access permissions
  if (req.user.role === ROLES.FACULTY && req.user.id !== facultyId) {
    throw new AppError("Access denied", 403);
  }

  const uploads = await Upload.find({ faculty: facultyId, status: { $regex: "APPROVED" } });
  const totalCredits = uploads.reduce((sum, u) => sum + (u.credits || 0), 0);
  const achievementCount = uploads.length;

  const categoryBreakdown = {};
  uploads.forEach(upload => {
    const category = upload.category || "Others";
    categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1;
  });

  res.json({
    totalCredits,
    achievementCount,
    categoryBreakdown,
    lastUpdated: new Date()
  });
};

// Get faculty achievements/uploads
exports.getFacultyAchievements = async (req, res) => {
  const facultyId = req.params.id || req.user.id;

  const { status, category, year } = req.query;
  let filter = { faculty: facultyId };

  if (status) filter.status = status;
  if (category) filter.category = category;
  if (year) {
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);
    filter.createdAt = { $gte: startDate, $lte: endDate };
  }

  const achievements = await Upload.find(filter).sort({ createdAt: -1 });
  res.json(achievements);
};

// Bulk approve achievements
exports.approveAchievements = async (req, res) => {
  if (req.user.role !== ROLES.HOD && req.user.role !== ROLES.ADMIN) {
    throw new AppError("Access denied", 403);
  }

  const { achievementIds } = req.body;

  if (!Array.isArray(achievementIds) || achievementIds.length === 0) {
    throw new AppError("No achievements selected", 400);
  }

  const status = req.user.role === ROLES.HOD ? "HOD_APPROVED" : "ADMIN_APPROVED";

  const result = await Upload.updateMany(
    { _id: { $in: achievementIds } },
    { 
      status,
      approvedBy: req.user.id,
      approvedAt: new Date()
    }
  );

  res.json({
    message: `${result.modifiedCount} achievements approved`,
    modifiedCount: result.modifiedCount
  });
};

// Get faculty rankings
exports.getFacultyRanking = async (req, res) => {
  const facultyId = req.params.id || req.user.id;

  // Get faculty's approved uploads
  const uploads = await Upload.find({
    faculty: facultyId,
    status: { $regex: "APPROVED" }
  });

  const totalCredits = uploads.reduce((sum, u) => sum + (u.credits || 0), 0);

  // Get department ranking
  const faculty = await Faculty.findById(facultyId);
  if (!faculty) throw new AppError("Faculty not found", 404);

  const departmentFaculties = await Faculty.find({ department: faculty.department });
  const departmentRankings = await Promise.all(
    departmentFaculties.map(async (f) => {
      const uploads = await Upload.find({
        faculty: f._id,
        status: { $regex: "APPROVED" }
      });
      return {
        id: f._id,
        credits: uploads.reduce((sum, u) => sum + (u.credits || 0), 0)
      };
    })
  );

  departmentRankings.sort((a, b) => b.credits - a.credits);
  const departmentRank = departmentRankings.findIndex(r => r.id.toString() === facultyId) + 1;

  // Get college ranking
  const collegeFaculties = await Faculty.find({});
  const collegeRankings = await Promise.all(
    collegeFaculties.map(async (f) => {
      const uploads = await Upload.find({
        faculty: f._id,
        status: { $regex: "APPROVED" }
      });
      return {
        id: f._id,
        credits: uploads.reduce((sum, u) => sum + (u.credits || 0), 0)
      };
    })
  );

  collegeRankings.sort((a, b) => b.credits - a.credits);
  const collegeRank = collegeRankings.findIndex(r => r.id.toString() === facultyId) + 1;

  res.json({
    totalCredits,
    departmentRank,
    departmentTotal: departmentFaculties.length,
    collegeRank,
    collegeTotal: collegeFaculties.length,
    score: totalCredits
  });
};
