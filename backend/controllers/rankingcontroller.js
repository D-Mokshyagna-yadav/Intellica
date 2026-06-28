const Upload = require("../models/Upload");
const Faculty = require("../models/Faculty");
const HOD = require("../models/HOD");
const { getCategoryConfig } = require("../constants/categories");

const APPROVED_STATUSES = ["HOD_APPROVED", "ADMIN_APPROVED"];
const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_MONTH = new Date().getMonth();

function getCurrentSemester(dateValue) {
  const month = dateValue.getMonth();
  return month < 6 ? 1 : 2;
}

function createDepartmentSummary(department, facultyCount = 0) {
  return {
    department,
    rank: 0,
    facultyCount,
    monthlyScore: 0,
    semesterScore: 0,
    yearlyScore: 0,
    overallScore: 0,
    progress: 0,
    trend: 0,
    medal: null,
    topCategories: [],
  };
}

async function buildLeaderboard() {
  const [uploads, allFaculty, allHods] = await Promise.all([
    Upload.find({ status: { $in: APPROVED_STATUSES } }).lean(),
    Faculty.find({ isApproved: true, status: "APPROVED" }).lean(),
    HOD.find({ isApproved: true, status: "APPROVED" }).lean(),
  ]);

  const departmentMap = new Map();

  [...allFaculty, ...allHods].forEach((participant) => {
    const department = String(participant.department || "").trim().toUpperCase();
    if (!department) {
      return;
    }

    if (!departmentMap.has(department)) {
      departmentMap.set(department, createDepartmentSummary(department));
    }

    const summary = departmentMap.get(department);
    summary.facultyCount += participant.role === "HOD" ? 0 : 1;
  });

  const categoryTotalsByDepartment = new Map();

  uploads.forEach((upload) => {
    const department = String(upload.department || "").trim().toUpperCase();
    if (!department) {
      return;
    }

    if (!departmentMap.has(department)) {
      departmentMap.set(department, createDepartmentSummary(department));
    }

    const summary = departmentMap.get(department);
    const credits = Number(upload.credits) || 0;
    const createdAt = upload.createdAt ? new Date(upload.createdAt) : null;
    summary.overallScore += credits;

    if (createdAt && createdAt.getFullYear() === CURRENT_YEAR) {
      summary.yearlyScore += credits;
    }

    if (createdAt && createdAt.getFullYear() === CURRENT_YEAR && getCurrentSemester(createdAt) === getCurrentSemester(new Date())) {
      summary.semesterScore += credits;
    }

    if (createdAt && createdAt.getFullYear() === CURRENT_YEAR && createdAt.getMonth() === CURRENT_MONTH) {
      summary.monthlyScore += credits;
    }

    const categoryConfig = getCategoryConfig(upload.category);
    const categoryKey = String(categoryConfig?.rankingKey || upload.category || "others").toLowerCase();

    if (!categoryTotalsByDepartment.has(department)) {
      categoryTotalsByDepartment.set(department, new Map());
    }

    const categoryMap = categoryTotalsByDepartment.get(department);
    categoryMap.set(categoryKey, (categoryMap.get(categoryKey) || 0) + credits);
  });

  const ranked = Array.from(departmentMap.values()).sort(
    (a, b) => b.overallScore - a.overallScore || b.yearlyScore - a.yearlyScore || a.department.localeCompare(b.department)
  );

  const topOverall = ranked[0]?.overallScore || 0;
  const medals = ["gold", "silver", "bronze"];

  ranked.forEach((department, index) => {
    department.rank = index + 1;
    department.progress = topOverall > 0 ? Math.round((department.overallScore / topOverall) * 100) : 0;
    department.medal = medals[index] || null;

    const previousMonthScore = uploads.reduce((sum, upload) => {
      const uploadDepartment = String(upload.department || "").trim().toUpperCase();
      const createdAt = upload.createdAt ? new Date(upload.createdAt) : null;
      if (
        uploadDepartment !== department.department ||
        !createdAt ||
        createdAt.getFullYear() !== CURRENT_YEAR ||
        createdAt.getMonth() !== (CURRENT_MONTH + 11) % 12
      ) {
        return sum;
      }

      return sum + (Number(upload.credits) || 0);
    }, 0);

    department.trend = department.monthlyScore - previousMonthScore;

    const categoryMap = categoryTotalsByDepartment.get(department.department) || new Map();
    department.topCategories = Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, score]) => ({ name, score }));
  });

  return ranked;
}

async function buildIntraDepartmentLeaderboard(departmentCode) {
  const [uploads, facultyInDept, hodsInDept] = await Promise.all([
    Upload.find({ department: departmentCode, status: { $in: APPROVED_STATUSES } }).lean(),
    Faculty.find({ department: departmentCode, isApproved: true, status: "APPROVED" }).lean(),
    HOD.find({ department: departmentCode, isApproved: true, status: "APPROVED" }).lean(),
  ]);

  const userMap = new Map();

  [...facultyInDept, ...hodsInDept].forEach((user) => {
    userMap.set(user._id.toString(), {
      userId: user._id.toString(),
      name: user.name,
      role: user.role,
      department: user.department,
      designation: user.designation,
      profileImage: user.profileImage,
      rank: 0,
      monthlyScore: 0,
      semesterScore: 0,
      yearlyScore: 0,
      overallScore: 0,
    });
  });

  uploads.forEach((upload) => {
    const userId = upload.faculty.toString();
    if (!userMap.has(userId)) return;

    const summary = userMap.get(userId);
    const credits = Number(upload.credits) || 0;
    const createdAt = upload.createdAt ? new Date(upload.createdAt) : null;
    
    summary.overallScore += credits;

    if (createdAt && createdAt.getFullYear() === CURRENT_YEAR) {
      summary.yearlyScore += credits;
      
      if (getCurrentSemester(createdAt) === getCurrentSemester(new Date())) {
        summary.semesterScore += credits;
      }
      
      if (createdAt.getMonth() === CURRENT_MONTH) {
        summary.monthlyScore += credits;
      }
    }
  });

  const rankedUsers = Array.from(userMap.values()).sort(
    (a, b) => b.overallScore - a.overallScore || a.name.localeCompare(b.name)
  );

  rankedUsers.forEach((user, index) => {
    user.rank = index + 1;
  });

  return rankedUsers;
}

exports.getRanking = async (req, res) => {
  const rankings = await buildLeaderboard();
  const requestedDepartment = String(req.query.department || "").trim().toUpperCase();

  const filtered = requestedDepartment
    ? rankings.filter((item) => item.department === requestedDepartment)
    : rankings;

  res.json(filtered);
};

exports.getDepartmentRanking = async (req, res) => {
  const requestedDepartment = String(req.query.department || req.user.department).trim().toUpperCase();
  const rankings = await buildIntraDepartmentLeaderboard(requestedDepartment);
  res.json(rankings);
};

exports.getMyRank = async (req, res) => {
  const requestedId = req.params.id || req.user.id;
  const requesterRole = String(req.user.role || "").toUpperCase();
  const requesterId = String(req.user.id || "");

  if (requestedId !== requesterId && !["ADMIN", "HOD"].includes(requesterRole)) {
    return res.status(403).json({ message: "You are not allowed to view another user's rank" });
  }

  const participant = await Faculty.findById(requestedId).lean() || await HOD.findById(requestedId).lean();
  
  if (!participant) {
    throw new AppError("User not found", 404);
  }

  const department = String(participant.department).trim().toUpperCase();
  
  const [deptLeaderboard, intraDeptLeaderboard] = await Promise.all([
    buildLeaderboard(),
    buildIntraDepartmentLeaderboard(department)
  ]);

  const deptSummary = deptLeaderboard.find((item) => item.department === department);
  const mySummary = intraDeptLeaderboard.find((item) => item.userId === requestedId);

  res.json({
    departmentRank: mySummary ? mySummary.rank : null,
    departmentTotal: intraDeptLeaderboard.length,
    collegeRank: deptSummary ? deptSummary.rank : null,
    collegeTotal: deptLeaderboard.length,
    score: mySummary ? mySummary.overallScore : 0,
    totalCredits: mySummary ? mySummary.overallScore : 0,
  });
};
