const mongoose = require("mongoose");
const logger = require("./logger");

// Models
const Department = require("../models/Department");
const AchievementCategory = require("../models/AchievementCategory");
const Role = require("../models/Role");
const Permission = require("../models/Permission");
const Settings = require("../models/Settings");
const ApprovalWorkflow = require("../models/ApprovalWorkflow");
const AcademicYear = require("../models/AcademicYear");
const Semester = require("../models/Semester");
const College = require("../models/College");
const NotificationTemplate = require("../models/NotificationTemplate");
const CreditConfig = require("../models/CreditConfig");

const defaultDepartments = [
  "Computer Science",
  "Information Technology",
  "Electronics",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electrical Engineering",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Business Administration",
];

const defaultCategories = [
  {
    name: "Research Publications",
    subcategories: ["Journal Paper", "Conference Paper", "Book Chapter", "Patent"],
    basePoints: 10,
    maxPoints: 100,
    requiresEvidence: true,
    requiresApproval: true,
    weightage: 1.0,
  },
  {
    name: "Conferences & Workshops",
    subcategories: ["International Conference", "National Conference", "Workshop Organized", "Workshop Attended"],
    basePoints: 5,
    maxPoints: 50,
    requiresEvidence: true,
    requiresApproval: true,
    weightage: 0.8,
  },
  {
    name: "Certifications",
    subcategories: ["Online Course", "Professional Certification", "Industry Certification"],
    basePoints: 3,
    maxPoints: 30,
    requiresEvidence: true,
    requiresApproval: false,
    weightage: 0.6,
  },
  {
    name: "Teaching & Learning",
    subcategories: ["Guest Lecture", "Course Development", "Curriculum Design", "Mentorship"],
    basePoints: 4,
    maxPoints: 40,
    requiresEvidence: true,
    requiresApproval: true,
    weightage: 0.7,
  },
  {
    name: "Industry Collaboration",
    subcategories: ["Consultancy Project", "MoU", "Internship Coordination", "Industry Visit"],
    basePoints: 8,
    maxPoints: 80,
    requiresEvidence: true,
    requiresApproval: true,
    weightage: 0.9,
  },
  {
    name: "Student Activities",
    subcategories: ["Club Mentor", "Event Organization", "Competition Judge", "Project Guide"],
    basePoints: 3,
    maxPoints: 25,
    requiresEvidence: false,
    requiresApproval: true,
    weightage: 0.5,
  },
  {
    name: "Institutional Service",
    subcategories: ["Committee Member", "Event Coordinator", "Admission In-charge", "Exam Invigilation"],
    basePoints: 2,
    maxPoints: 20,
    requiresEvidence: false,
    requiresApproval: true,
    weightage: 0.4,
  },
  {
    name: "Awards & Recognition",
    subcategories: ["Best Teacher Award", "Research Award", "State Level Award", "National Level Award"],
    basePoints: 15,
    maxPoints: 150,
    requiresEvidence: true,
    requiresApproval: true,
    weightage: 1.2,
  },
];

async function seedDepartments() {
  const existingCount = await Department.countDocuments();
  if (existingCount > 0) {
    logger.info(`Skipping departments seeding. ${existingCount} departments already exist.`);
    return;
  }

  const departments = defaultDepartments.map((name) => ({
    name,
    code: name.toUpperCase().replace(/\s+/g, "_").substring(0, 10),
    description: `Department of ${name}`,
    isActive: true,
  }));

  await Department.insertMany(departments);
  logger.info(`Seeded ${departments.length} departments`);
}

async function seedAchievementCategories() {
  const existingCount = await AchievementCategory.countDocuments();
  if (existingCount > 0) {
    logger.info(`Skipping categories seeding. ${existingCount} categories already exist.`);
    return;
  }

  const toCanonicalName = (name) =>
    name
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");

  const categories = defaultCategories.map((cat) => ({
    name: cat.name,
    canonicalName: toCanonicalName(cat.name),
    aliases: cat.subcategories,
    section: "professional",
    points: cat.basePoints,
    maxPointsPerYear: cat.maxPoints,
    requiresEvidence: cat.requiresEvidence,
    requiresApproval: cat.requiresApproval,
    weightage: cat.weightage,
    description: cat.subcategories.join(", "),
    isActive: true,
  }));

  await AchievementCategory.insertMany(categories);
  logger.info(`Seeded ${categories.length} achievement categories`);
}

async function seedRoles() {
  const existingCount = await Role.countDocuments();
  if (existingCount > 0) {
    logger.info(`Skipping roles seeding. ${existingCount} roles already exist.`);
    return;
  }

  const roles = [
    { name: "Admin", code: "ADMIN", description: "System Administrator", isSystem: true },
    { name: "HOD", code: "HOD", description: "Head of Department", isSystem: true },
    { name: "Faculty", code: "FACULTY", description: "Faculty Member", isSystem: true },
  ];

  await Role.insertMany(roles);
  logger.info(`Seeded ${roles.length} roles`);
}

async function seedPermissions() {
  const existingCount = await Permission.countDocuments();
  if (existingCount > 0) {
    logger.info(`Skipping permissions seeding. ${existingCount} permissions already exist.`);
    return;
  }

  const permissionDefinitions = [
    { role: "ADMIN", resource: "department", action: "create", scope: "system" },
    { role: "ADMIN", resource: "department", action: "update", scope: "system" },
    { role: "ADMIN", resource: "department", action: "delete", scope: "system" },
    { role: "ADMIN", resource: "faculty", action: "create", scope: "system" },
    { role: "ADMIN", resource: "faculty", action: "update", scope: "system" },
    { role: "ADMIN", resource: "faculty", action: "delete", scope: "system" },
    { role: "ADMIN", resource: "hod", action: "create", scope: "system" },
    { role: "ADMIN", resource: "hod", action: "update", scope: "system" },
    { role: "ADMIN", resource: "hod", action: "delete", scope: "system" },
    { role: "ADMIN", resource: "role", action: "manage", scope: "system" },
    { role: "ADMIN", resource: "permission", action: "manage", scope: "system" },
    { role: "ADMIN", resource: "setting", action: "manage", scope: "system" },
    { role: "ADMIN", resource: "category", action: "manage", scope: "system" },
    { role: "ADMIN", resource: "academic_year", action: "manage", scope: "system" },
    { role: "ADMIN", resource: "semester", action: "manage", scope: "system" },
    { role: "ADMIN", resource: "notification", action: "manage", scope: "system" },
    { role: "ADMIN", resource: "report", action: "view_all", scope: "system" },
    { role: "ADMIN", resource: "audit_log", action: "read", scope: "system" },
    { role: "ADMIN", resource: "user", action: "manage", scope: "system" },

    { role: "HOD", resource: "faculty", action: "create", scope: "department" },
    { role: "HOD", resource: "faculty", action: "update", scope: "department" },
    { role: "HOD", resource: "faculty", action: "read", scope: "department" },
    { role: "HOD", resource: "achievement", action: "approve", scope: "department" },
    { role: "HOD", resource: "achievement", action: "reject", scope: "department" },
    { role: "HOD", resource: "achievement", action: "read", scope: "department" },
    { role: "HOD", resource: "report", action: "view_all", scope: "department" },
    { role: "HOD", resource: "notification", action: "read", scope: "department" },

    { role: "FACULTY", resource: "achievement", action: "create", scope: "personal" },
    { role: "FACULTY", resource: "achievement", action: "read", scope: "personal" },
    { role: "FACULTY", resource: "achievement", action: "create", scope: "personal", nameSuffix: "upload" },
    { role: "FACULTY", resource: "achievement", action: "read", scope: "personal", nameSuffix: "upload" },
    { role: "FACULTY", resource: "report", action: "read", scope: "personal" },
    { role: "FACULTY", resource: "notification", action: "read", scope: "personal" },
  ];

  const permissions = permissionDefinitions.map(({ role, resource, action, scope, nameSuffix }) => ({
    name: `${role}_${nameSuffix || resource}_${action}`,
    description: `${role} permission to ${action} ${resource}`,
    resource,
    action,
    scope,
    isSystem: true,
  }));

  await Permission.insertMany(permissions);
  logger.info(`Seeded ${permissions.length} permissions`);
}

async function seedSettings() {
  const existing = await Settings.findOne();
  if (existing) {
    logger.info("Skipping settings seeding. Settings already exist.");
    return;
  }

  const settings = new Settings({
    key: "app_config",
    value: {
      collegeName: "Sample College of Engineering",
      collegeCode: "SCE",
      logoUrl: "",
      theme: {
        primaryColor: "#4F46E5",
        secondaryColor: "#7C3AED",
        darkMode: false,
      },
      email: {
        enabled: false,
        smtpHost: "",
        smtpPort: 587,
        smtpUser: "",
        smtpPass: "",
        fromEmail: "noreply@example.com",
        fromName: "FPMS System",
      },
      scoring: {
        enableWeightage: true,
        enableMaxPoints: true,
        autoApprove: false,
      },
      approvalWorkflow: {
        requireHODApproval: true,
        requireAdminApproval: false,
        autoApproveThreshold: 0,
      },
      registration: {
        allowSelfRegistration: false,
        requireEmailVerification: true,
        requireOTPVerification: true,
      },
      notifications: {
        enableEmail: false,
        enableInApp: true,
        enablePush: false,
      },
      featureFlags: {
        enableLeaderboard: true,
        enableAnalytics: true,
        enableReports: true,
        enableBulkOperations: true,
        enableImportExport: true,
      },
    },
    category: "general",
    description: "Default application configuration",
    isSystem: true,
    isEditable: false,
  });

  await settings.save();
  logger.info("Seeded system settings");
}

async function seedApprovalWorkflows() {
  const existingCount = await ApprovalWorkflow.countDocuments();
  if (existingCount > 0) {
    logger.info(`Skipping workflows seeding. ${existingCount} workflows already exist.`);
    return;
  }

  const workflows = [
    {
      name: "Standard Achievement Approval",
      description: "Default workflow for achievement approvals",
      resourceType: "achievement",
      steps: [
        { order: 1, approverRole: "HOD", approverField: "department", requiresComment: true },
        { order: 2, approverRole: "ADMIN", approverField: "college", requiresComment: false },
      ],
      isActive: true,
      isSystem: true,
    },
    {
      name: "Quick Approval",
      description: "Fast-track approval for low-point achievements",
      resourceType: "achievement",
      steps: [{ order: 1, approverRole: "HOD", approverField: "department", requiresComment: false }],
      isActive: true,
      isSystem: true,
    },
  ];

  await ApprovalWorkflow.insertMany(workflows);
  logger.info(`Seeded ${workflows.length} approval workflows`);
}

async function seedAcademicYears() {
  const existingCount = await AcademicYear.countDocuments();
  if (existingCount > 0) {
    logger.info(`Skipping academic years seeding. ${existingCount} years already exist.`);
    return;
  }

  const currentYear = new Date().getFullYear();
  const academicYears = [];

  for (let i = -1; i <= 2; i++) {
    const startYear = currentYear + i;
    const endYear = startYear + 1;
    academicYears.push({
      name: `${startYear}-${endYear}`,
      startDate: new Date(`${startYear}-07-01`),
      endDate: new Date(`${endYear}-06-30`),
      isActive: i === 0,
      description: i === 0 ? "Current academic year" : "",
    });
  }

  await AcademicYear.insertMany(academicYears);
  logger.info(`Seeded ${academicYears.length} academic years`);
}

async function seedSemesters() {
  const existingCount = await Semester.countDocuments();
  if (existingCount > 0) {
    logger.info(`Skipping semesters seeding. ${existingCount} semesters already exist.`);
    return;
  }

  const academicYear = await AcademicYear.findOne({ isActive: true }) || (await AcademicYear.findOne());
  if (!academicYear) {
    throw new Error("Cannot seed semesters without an academic year");
  }

  const semesters = [
    {
      name: "Odd Semester",
      academicYear: academicYear._id,
      order: 1,
      startDate: new Date(new Date().getFullYear(), 6, 1),
      endDate: new Date(new Date().getFullYear() + 1, 0, 31),
      isActive: true,
    },
    {
      name: "Even Semester",
      academicYear: academicYear._id,
      order: 2,
      startDate: new Date(new Date().getFullYear(), 0, 1),
      endDate: new Date(new Date().getFullYear(), 5, 30),
      isActive: false,
    },
  ];

  await Semester.insertMany(semesters);
  logger.info(`Seeded ${semesters.length} semesters`);
}

async function seedCollege() {
  const existing = await College.findOne();
  if (existing) {
    logger.info("Skipping college seeding. College already exists.");
    return;
  }

  const college = new College({
    name: "Sample College of Engineering",
    code: "SCE",
    address: "123 Education Street",
    city: "Sample City",
    state: "Sample State",
    country: "India",
    pincode: "123456",
    phone: "+91-1234567890",
    email: "info@samplecollege.edu",
    website: "https://www.samplecollege.edu",
    isActive: true,
  });

  await college.save();
  logger.info("Seeded college information");
}

async function seedNotificationTemplates() {
  const existingCount = await NotificationTemplate.countDocuments();
  if (existingCount > 0) {
    logger.info(`Skipping notification templates seeding. ${existingCount} templates already exist.`);
    return;
  }

  const templates = [
    {
      name: "faculty_created_by_admin",
      key: "faculty_created_by_admin",
      subject: "New Faculty Account Created",
      body: "Admin has created a faculty account for {{facultyName}} in department {{departmentName}}.",
      type: "in_app",
      category: "account_created",
      isActive: true,
    },
    {
      name: "achievement_submitted",
      key: "achievement_submitted",
      subject: "Achievement Submitted for Approval",
      body: "{{facultyName}} has submitted an achievement: {{achievementTitle}}",
      type: "in_app",
      category: "notification",
      isActive: true,
    },
    {
      name: "achievement_approved",
      key: "achievement_approved",
      subject: "Achievement Approved",
      body: "Your achievement '{{achievementTitle}}' has been approved by {{approverName}}.",
      type: "in_app",
      category: "approval",
      isActive: true,
    },
    {
      name: "achievement_rejected",
      key: "achievement_rejected",
      subject: "Achievement Rejected",
      body: "Your achievement '{{achievementTitle}}' has been rejected. Reason: {{rejectionReason}}",
      type: "in_app",
      category: "rejection",
      isActive: true,
    },
    {
      name: "welcome_faculty",
      key: "welcome_faculty",
      subject: "Welcome to FPMS",
      body: "Welcome {{facultyName}}! Your account has been created. Please login to get started.",
      type: "in_app",
      category: "welcome",
      isActive: true,
    },
  ];

  await NotificationTemplate.insertMany(templates);
  logger.info(`Seeded ${templates.length} notification templates`);
}

async function seedCreditConfig() {
  const existingCount = await CreditConfig.countDocuments();
  if (existingCount > 0) {
    logger.info(`Skipping credit config seeding. ${existingCount} configs already exist.`);
    return;
  }

  const categories = await AchievementCategory.find({ isActive: true });
  if (categories.length === 0) {
    throw new Error("Cannot seed credit configuration without achievement categories");
  }

  const configDocuments = categories.map((category) => ({
    category: category._id,
    categoryName: category.name,
    type: category.section || "professional",
    basePoints: category.points || 0,
    maxPointsPerYear: category.maxPointsPerYear ?? null,
    maxPointsPerSemester: null,
    weightage: category.weightage ?? 1,
    requiresEvidence: category.requiresEvidence,
    requiresApproval: category.requiresApproval,
    description: category.description || "",
    isActive: true,
  }));

  await CreditConfig.insertMany(configDocuments);
  logger.info(`Seeded ${configDocuments.length} credit configurations`);
}

async function seedAll() {
  logger.info("Starting database seeding...");

  await seedCollege();
  await seedDepartments();
  await seedAchievementCategories();
  await seedRoles();
  await seedPermissions();
  await seedSettings();
  await seedApprovalWorkflows();
  await seedAcademicYears();
  await seedSemesters();
  await seedNotificationTemplates();
  await seedCreditConfig();

  logger.info("Database seeding completed successfully!");
}

module.exports = { seedAll };
