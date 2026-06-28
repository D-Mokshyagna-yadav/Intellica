const Announcement = require("../models/Announcement");
const { AppError } = require("../utils/errors");

exports.createAnnouncement = async (req, res) => {
  const { title, content, type, audience, isPinned, targetAudience, targetDepartments, expiresAt } = req.body;

  if (!title || !content) {
    throw new AppError("Title and content are required", 400);
  }

  const announcement = await Announcement.create({
    title,
    content,
    type: type || "GENERAL",
    audience: audience || "ALL",
    isPinned: isPinned || false,
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
    $or: [
      { targetAudience: { $in: ["ALL", role] } },
      { audience: { $in: ["ALL", role] } }
    ],
    $or: [
      { targetDepartments: { $in: ["ALL", department] } },
      { audience: "ALL" }
    ]
  }).sort({ isPinned: -1, createdAt: -1 });

  res.json(announcements);
};

exports.getAllAnnouncementsForAdmin = async (req, res) => {
  const announcements = await Announcement.find().sort({ isPinned: -1, createdAt: -1 });
  res.json(announcements);
};

exports.updateAnnouncement = async (req, res) => {
  const { id } = req.params;
  const { title, content, type, audience, isPinned, targetAudience, targetDepartments, expiresAt } = req.body;

  const announcement = await Announcement.findByIdAndUpdate(
    id,
    {
      ...(title && { title }),
      ...(content && { content }),
      ...(type && { type }),
      ...(audience && { audience }),
      ...(isPinned !== undefined && { isPinned }),
      ...(targetAudience && { targetAudience }),
      ...(targetDepartments && { targetDepartments }),
      ...(expiresAt && { expiresAt }),
      updatedAt: new Date()
    },
    { new: true }
  );

  if (!announcement) {
    throw new AppError("Announcement not found", 404);
  }

  res.json({
    message: "Announcement updated successfully",
    announcement
  });
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
