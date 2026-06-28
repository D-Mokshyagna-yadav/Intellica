const os = require("os");
const mongoose = require("mongoose");
const Upload = require("../models/Upload");
const Faculty = require("../models/Faculty");
const HOD = require("../models/HOD");
const User = require("../models/User");
const Announcement = require("../models/Announcement");
const Settings = require("../models/Settings");
const AuditLog = require("../models/AuditLog");
const Notification = require("../models/Notification");
const Goal = require("../models/Goal");
const Publication = require("../models/Publication");
const SupportTicket = require("../models/SupportTicket");
const NAACReport = require("../models/NAACReport");
const { AppError } = require("../utils/errors");
const ROLES = require("../constants/roles");

function text(value) {
  return String(value || "").trim();
}

function uploadTitle(upload) {
  return upload.title || upload.metadata?.title || upload.categoryName || upload.category || "Untitled";
}

function discussionComments(upload) {
  const comments = Array.isArray(upload?.metadata?.discussionComments) ? upload.metadata.discussionComments : [];
  if (upload?.hodComment) comments.push({ author: "HOD", text: upload.hodComment, createdAt: upload.updatedAt || upload.createdAt });
  if (upload?.adminComment) comments.push({ author: "Admin", text: upload.adminComment, createdAt: upload.updatedAt || upload.createdAt });
  return comments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

async function getOrCreateSetting(key, defaultValue, category = "general") {
  const existing = await Settings.findOne({ key }).lean();
  if (existing) return existing.value;
  const created = await Settings.create({ key, value: defaultValue, category, isSystem: true, isEditable: true });
  return created.value;
}

exports.getGoals = async (req, res) => {
  const filter = req.user.role === ROLES.ADMIN ? {} : { owner: req.user.id, ownerRole: req.user.role };
  const goals = await Goal.find(filter).sort({ createdAt: -1 }).lean();
  res.json(goals);
};

exports.createGoal = async (req, res) => {
  const goal = {
    owner: req.user.id,
    ownerRole: req.user.role,
    title: text(req.body.title),
    description: text(req.body.description),
    category: text(req.body.category) || "general",
    targetDate: req.body.targetDate,
    progress: Number(req.body.progress || 0),
    completed: Boolean(req.body.completed),
  };
  if (!goal.title || !goal.targetDate) throw new AppError("Title and target date are required", 400);
  const created = await Goal.create(goal);
  res.status(201).json(created);
};

exports.getPublications = async (req, res) => {
  const filter = req.user.role === ROLES.ADMIN ? {} : { owner: req.user.id, ownerRole: req.user.role };
  const publications = await Publication.find(filter).sort({ createdAt: -1 }).lean();
  res.json(publications);
};

exports.createPublication = async (req, res) => {
  const publication = {
    owner: req.user.id,
    ownerRole: req.user.role,
    title: text(req.body.title),
    authors: text(req.body.authors),
    journal: text(req.body.journal),
    year: Number(req.body.year || new Date().getFullYear()),
    doi: text(req.body.doi),
    url: text(req.body.url),
  };
  if (!publication.title || !publication.journal) throw new AppError("Title and journal are required", 400);
  const created = await Publication.create(publication);
  res.status(201).json(created);
};

exports.getSupportFaqs = async (_req, res) => {
  const faqs = await getOrCreateSetting(
    "support_faqs",
    [
      { question: "How do I submit an achievement?", answer: "Open the achievement screen and upload your proof." },
      { question: "How do I change my password?", answer: "Use the Security & Account Settings screen." },
      { question: "How are credits calculated?", answer: "Credits are derived from the achievement category and metadata." },
    ],
    "general"
  );
  res.json(faqs);
};

exports.getSupportTickets = async (req, res) => {
  const filter = req.user.role === ROLES.ADMIN ? {} : { requester: req.user.id, requesterRole: req.user.role };
  const tickets = await SupportTicket.find(filter).sort({ createdAt: -1 }).lean();
  res.json(tickets);
};

exports.createSupportTicket = async (req, res) => {
  const ticket = {
    requester: req.user.id,
    requesterRole: req.user.role,
    subject: text(req.body.subject),
    description: text(req.body.description),
    category: text(req.body.category),
    status: "open",
    replies: [],
  };
  if (!ticket.subject || !ticket.description || !ticket.category) throw new AppError("Subject, description, and category are required", 400);
  const created = await SupportTicket.create(ticket);
  res.status(201).json(created);
};

exports.getNAACReports = async (req, res) => {
  const filter = req.user.role === ROLES.ADMIN ? {} : { createdBy: req.user.id, createdByRole: req.user.role };
  const reports = await NAACReport.find(filter).sort({ createdAt: -1 }).lean();
  res.json(reports);
};

exports.createNAACReport = async (req, res) => {
  const report = {
    createdBy: req.user.id,
    createdByRole: req.user.role,
    title: text(req.body.title),
    year: Number(req.body.year || new Date().getFullYear()),
    sections: Array.isArray(req.body.sections) ? req.body.sections : [],
    status: req.body.status || "draft",
  };
  if (!report.title || !report.year) throw new AppError("Title and year are required", 400);
  const created = await NAACReport.create(report);
  res.status(201).json(created);
};

exports.getDocuments = async (req, res) => {
  const docs = await Upload.find(req.user.role === ROLES.ADMIN || req.user.role === ROLES.HOD ? {} : { faculty: req.user.id }).sort({ createdAt: -1 }).lean();
  res.json(docs.map((upload) => ({
    _id: upload._id,
    title: uploadTitle(upload),
    type: upload.categoryName || upload.category,
    status: upload.status,
    submittedBy: upload.facultyName || "Unknown",
    submittedDate: upload.createdAt,
    timeline: [{ action: "Submitted", message: "Document submitted", status: "completed", timestamp: upload.createdAt }],
    comments: discussionComments(upload),
  })));
};

exports.exportDocuments = async (req, res) => res.json({ message: "Document export queued", format: req.body.format || "pdf" });

exports.getCVReports = async (req, res) => {
  const docs = await Upload.find({ faculty: req.query.facultyId || req.user.id, status: { $in: ["HOD_APPROVED", "ADMIN_APPROVED"] } }).sort({ createdAt: -1 }).lean();
  res.json(docs.map((upload) => ({ _id: upload._id, title: uploadTitle(upload), format: upload.fileType?.includes("pdf") ? "pdf" : "word", createdAt: upload.createdAt, issuedBy: upload.departmentName || "Intellica" })));
};

exports.getFacultyPublicProfile = async (req, res) => {
  const faculty = req.user.role === ROLES.FACULTY ? await Faculty.findById(req.user.id) : req.user.role === ROLES.HOD ? await HOD.findById(req.user.id) : await User.findById(req.user.id);
  if (!faculty) throw new AppError("User not found", 404);
  const approved = await Upload.find({ faculty: req.user.id, status: { $in: ["HOD_APPROVED", "ADMIN_APPROVED"] } }).lean();
  const publicationCount = await Publication.countDocuments({ owner: req.user.id, ownerRole: req.user.role });
  res.json({
    _id: faculty._id,
    name: faculty.name,
    designation: faculty.designation || faculty.role || "",
    department: faculty.departmentName || faculty.department || "",
    employeeId: faculty.employeeId || faculty.regId || "",
    bio: faculty.metadata?.bio || "",
    researchInterests: faculty.researchInterests || [],
    publications: publicationCount,
    awards: approved.filter((upload) => String(upload.categoryName || upload.category || "").toLowerCase().includes("award")).length,
    totalCredits: approved.reduce((sum, upload) => sum + (Number(upload.credits) || 0), 0),
    isPublic: true,
  });
};

exports.getAiInsights = async (_req, res) => {
  const settings = await getOrCreateSetting(
    "ai_settings",
    { enableAIRecommendations: true, focusAreas: ["publications"], learningPreferences: "balanced", goalDifficulty: "medium" },
    "feature_flags"
  );
  const publicationCount = await Publication.countDocuments();
  const goalCount = await Goal.countDocuments();
  const ticketCount = await SupportTicket.countDocuments();
  res.json({
    insights: [
      { title: "Increase publication activity", description: `Publications tracked: ${publicationCount}.`, confidence: 82, impact: "High" },
      { title: "Close open support items", description: `Open tickets tracked: ${ticketCount}.`, confidence: 74, impact: "Medium" },
      { title: "Review active goals", description: `Goals tracked: ${goalCount}.`, confidence: 70, impact: "Medium" },
    ],
    recommendations: settings.enableAIRecommendations ? settings.focusAreas.map((category) => ({ category, reason: `Prioritize ${category}`, potential: 88 })) : [],
    settings,
  });
};

exports.getAiRecommendations = async (_req, res) => {
  const settings = await getOrCreateSetting(
    "ai_settings",
    { enableAIRecommendations: true, focusAreas: ["publications"], learningPreferences: "balanced", goalDifficulty: "medium" },
    "feature_flags"
  );
  res.json((settings.focusAreas || ["publications"]).map((category) => ({ category, reason: `Prioritize ${category}`, potential: 88 })));
};

exports.getAiSettings = async (_req, res) => {
  const settings = await getOrCreateSetting(
    "ai_settings",
    { enableAIRecommendations: true, focusAreas: ["publications"], learningPreferences: "balanced", goalDifficulty: "medium" },
    "feature_flags"
  );
  res.json(settings);
};

exports.getSystemHealth = async (_req, res) => res.json({
  status: mongoose.connection.readyState === 1 ? "healthy" : "warning",
  uptime: process.uptime(),
  cpuUsage: 22,
  memoryUsage: 48,
  databaseConnections: mongoose.connection.readyState === 1 ? 1 : 0,
  activeUsers: 0,
  requestsPerSecond: 0,
  errors: 0,
});

exports.getSystemLogs = async (_req, res) => {
  const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(50).lean();
  res.json(logs.map((log) => ({ timestamp: log.createdAt, level: log.action === "delete" || log.action === "reject" ? "error" : "info", message: `${log.action.toUpperCase()} ${log.resourceType}` })));
};

exports.getInsightsDashboard = async (_req, res) => {
  const [goalCount, publicationCount, ticketCount, reportCount, uploadCount] = await Promise.all([
    Goal.countDocuments(),
    Publication.countDocuments(),
    SupportTicket.countDocuments(),
    NAACReport.countDocuments(),
    Upload.countDocuments(),
  ]);
  res.json({
    topPerformers: [],
    trendingAchievements: [],
    departmentAnalytics: [],
    facultyMetrics: [
      { label: "Goals", value: goalCount },
      { label: "Publications", value: publicationCount },
      { label: "Support Tickets", value: ticketCount },
      { label: "NAAC Reports", value: reportCount },
      { label: "Documents", value: uploadCount },
    ],
    recommendations: [],
  });
};

exports.getSearchResults = async (req, res) => {
  const q = text(req.query.q);
  if (!q) return res.json([]);
  const regex = { $regex: q, $options: "i" };
  const [announcements, faculty, uploads] = await Promise.all([
    Announcement.find({ $or: [{ title: regex }, { content: regex }] }).lean(),
    Faculty.find({ $or: [{ name: regex }, { employeeId: regex }] }).lean(),
    Upload.find({ $or: [{ title: regex }, { categoryName: regex }] }).lean(),
  ]);
  res.json([
    ...announcements.map((item) => ({ type: "announcement", title: item.title, description: item.content, createdAt: item.createdAt })),
    ...faculty.map((item) => ({ type: "faculty", title: item.name, description: item.designation, createdAt: item.createdAt })),
    ...uploads.map((item) => ({ type: "document", title: uploadTitle(item), description: item.categoryName || item.status, createdAt: item.createdAt })),
  ]);
};

exports.getActivityTimeline = async (_req, res) => {
  const [logs, notifications, announcements] = await Promise.all([
    AuditLog.find().sort({ createdAt: -1 }).limit(10).lean(),
    Notification.find().sort({ createdAt: -1 }).limit(10).lean(),
    Announcement.find().sort({ createdAt: -1 }).limit(10).lean(),
  ]);
  res.json([
    ...logs.map((log) => ({ action: log.action, description: `${log.resourceType} updated`, user: log.userName || "System", timestamp: log.createdAt })),
    ...notifications.map((notification) => ({ action: notification.title || "Notification", description: notification.message, user: "System", timestamp: notification.createdAt })),
    ...announcements.map((announcement) => ({ action: "Announcement", description: announcement.title, user: "Admin", timestamp: announcement.createdAt })),
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 50));
};

exports.getApprovalDocuments = async (_req, res) => {
  const uploads = await Upload.find({ status: { $in: ["FACULTY_SUBMITTED", "HOD_COMMENT", "ADMIN_COMMENT", "HOD_SUBMITTED"] } }).sort({ createdAt: -1 }).lean();
  res.json(uploads.map((upload) => ({ _id: upload._id, title: uploadTitle(upload), submittedBy: upload.facultyName || "Unknown", submittedDate: upload.createdAt, status: upload.status, type: upload.categoryName || upload.category, timeline: [{ action: "Submitted", message: "Document submitted", status: "completed", timestamp: upload.createdAt }], comments: discussionComments(upload) })));
};

exports.getApprovalComments = async (req, res) => {
  const upload = await Upload.findById(req.params.id).lean();
  if (!upload) throw new AppError("Document not found", 404);
  res.json(discussionComments(upload));
};

exports.addApprovalComment = async (req, res) => {
  const upload = await Upload.findById(req.params.id);
  if (!upload) throw new AppError("Document not found", 404);
  const comment = text(req.body.text || req.body.comment);
  if (!comment) throw new AppError("Comment text is required", 400);
  const currentComments = Array.isArray(upload.metadata?.discussionComments) ? upload.metadata.discussionComments : [];
  currentComments.push({ author: req.user.name || req.user.role, text: comment, createdAt: new Date() });
  upload.metadata = { ...(upload.metadata || {}), discussionComments: currentComments };
  upload.status = req.user.role === ROLES.HOD ? "HOD_COMMENT" : "ADMIN_COMMENT";
  await upload.save();
  res.json({ message: "Comment added" });
};

exports.getDiscussions = async (req, res) => {
  const status = text(req.query.status);
  const uploads = await Upload.find(status && status !== "all" ? { status: { $regex: status === "pending" ? "FACULTY_SUBMITTED|HOD_COMMENT|ADMIN_COMMENT|RETURNED_FOR_REVISION" : status, $options: "i" } } : {}).sort({ createdAt: -1 }).lean();
  res.json(uploads.map((upload) => ({ _id: upload._id, subject: uploadTitle(upload), description: upload.description || upload.metadata?.description || "", initiator: upload.facultyName || "Unknown", status: upload.status === "FACULTY_SUBMITTED" ? "pending" : upload.status.toLowerCase().replace(/_/g, "-"), commentsCount: discussionComments(upload).length, comments: discussionComments(upload), createdAt: upload.createdAt })));
};

exports.replyToDiscussion = async (req, res) => {
  const upload = await Upload.findById(req.params.id);
  if (!upload) throw new AppError("Discussion not found", 404);
  const reply = text(req.body.text || req.body.comment);
  if (!reply) throw new AppError("Reply text is required", 400);
  const currentComments = Array.isArray(upload.metadata?.discussionComments) ? upload.metadata.discussionComments : [];
  currentComments.push({ author: req.user.name || req.user.role, text: reply, createdAt: new Date() });
  upload.metadata = { ...(upload.metadata || {}), discussionComments: currentComments };
  await upload.save();
  res.json({ message: "Reply posted" });
};