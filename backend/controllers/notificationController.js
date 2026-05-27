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
    .limit(20)
    .lean();

  res.json(
    notifications.map((notification) => ({
      ...notification,
      isRead: notification.readBy?.includes(userId) || false,
    }))
  );
};

exports.markAsRead = async (req, res) => {
  const notification = await Notification.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { readBy: req.user.id } },
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
