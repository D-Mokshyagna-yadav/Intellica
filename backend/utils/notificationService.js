const Notification = require("../models/Notification");

async function createNotification({ message, audienceRoles = [], audienceDepartment = null, audienceUserId = null }) {
  if (!message) {
    return null;
  }

  return Notification.create({
    message,
    audienceRoles,
    audienceDepartment,
    audienceUserId,
  });
}

module.exports = {
  createNotification,
};
