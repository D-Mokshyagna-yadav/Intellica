const User = require("../models/User");
const ROLES = require("../constants/roles");
const logger = require("./logger");

async function bootstrapAdmin() {
  const adminRegId = process.env.ADMIN_REG_ID?.trim();
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (!adminRegId || !adminEmail) {
    logger.info("Admin bootstrap skipped because ADMIN_REG_ID or ADMIN_EMAIL is not configured");
    return;
  }

  const payload = {
    regId: adminRegId,
    email: adminEmail,
    name: process.env.ADMIN_NAME?.trim() || "System Admin",
    role: ROLES.ADMIN,
    isApproved: true,
  };

  await User.findOneAndUpdate({ regId: adminRegId }, payload, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  });

  logger.info({ adminRegId }, "Admin bootstrap completed");
}

module.exports = bootstrapAdmin;
