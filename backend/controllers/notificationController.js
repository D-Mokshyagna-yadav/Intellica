const Notification = require("../models/Notification");

exports.getNotifications = async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;
  const department = req.user.department || null;

  const notifications = await Notification.find({
    $and: [
      {
        $or: [
          { audienceRoles: role },
          { audienceRoles: { $size: 0 } },
        ],
      },
      {
        $or: [
          { audienceDepartment: null },
          { audienceDepartment: department },
        ],
      },
      {
        $or: [
          { audienceUserId: null },
          { audienceUserId: userId },
        ],
      },
    ],
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  res.json(
    notifications.map((notification) => ({
      ...notification,
      isRead: Array.isArray(notification.readBy)
        ? notification.readBy.some(
            (r) => r?.userId?.toString() === userId.toString()
          )
        : false,
    }))
  );
};

exports.markAsRead = async (req, res) => {
  const notification = await Notification.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { readBy: { userId: req.user.id } } },
    { new: true }
  ).lean();

  if (!notification) {
    return res.status(404).json({ message: "Notification not found" });
  }

  res.json({
    message: "Notification marked as read",
    notification: {
      ...notification,
      isRead: true,
    },
  });
};

// Admin / HOD only — create a broadcast notification
exports.createNotification = async (req, res) => {
  const { title, message, type, audienceRoles, audienceDepartment, audienceUserId, actionUrl } = req.body;

  if (!message) {
    return res.status(400).json({ message: "message is required" });
  }

  const notification = await Notification.create({
    title: title || "",
    message,
    type: type || "info",
    audienceRoles: audienceRoles || [],
    audienceDepartment: audienceDepartment || null,
    audienceUserId: audienceUserId || null,
    actionUrl: actionUrl || "",
    createdBy: req.user.id,
  });

  res.status(201).json({ message: "Notification created", notification });
};

// Admin only — list all sent notifications
exports.getAllNotifications = async (req, res) => {
  const { page = 1, limit = 30 } = req.query;
  const notifications = await Notification.find({})
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .lean();

  const total = await Notification.countDocuments({});
  res.json({ notifications, total, page: Number(page), limit: Number(limit) });
};

// Admin only — delete a notification
exports.deleteNotification = async (req, res) => {
  const notification = await Notification.findByIdAndDelete(req.params.id);
  if (!notification) {
    return res.status(404).json({ message: "Notification not found" });
  }
  res.json({ message: "Notification deleted" });
};
