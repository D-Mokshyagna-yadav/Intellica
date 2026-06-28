const Announcement = require("../models/Announcement");
const { AppError } = require("../utils/errors");

exports.createAnnouncement = async (req, res) => {
  const { title, content, targetAudience, targetDepartments, expiresAt } = req.body;

  if (!title || !content) {
    throw new AppError("Title and content are required", 400);
  }

  const announcement = await Announcement.create({
    title,
    content,
    targetAudience: targetAudience || ["ALL"],
    targetDepartments: targetDepartments || ["ALL"],
    createdBy: req.user.id,
    createdByRole: req.user.role,
    expiresAt,
  });

  res.status(201).json({
    message: "Announcement created successfully",
    announcement,
  });
};

exports.getAnnouncements = async (req, res) => {
  const role = req.user.role;
  const department = req.user.department;

  const announcements = await Announcement.find({
    isActive: true,
    $or: [{ expiresAt: { $gt: new Date() } }, { expiresAt: null }],
    targetAudience: { $in: ["ALL", role] },
    targetDepartments: { $in: ["ALL", department] },
  }).sort({ createdAt: -1 });

  res.json(announcements);
};

exports.getAllAnnouncementsForAdmin = async (req, res) => {
  const announcements = await Announcement.find().sort({ createdAt: -1 });
  res.json(announcements);
};

exports.deleteAnnouncement = async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    throw new AppError("Announcement not found", 404);
  }

  announcement.isActive = false;
  await announcement.save();

  res.json({ message: "Announcement deleted successfully" });
};
