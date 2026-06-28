const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User");

const ADMIN_EMAIL = "d.mokshyagnayadav@gmail.com";
const ADMIN_PASSWORD = "123456789";
const ADMIN_REG_ID = "ADMIN0001";
const ADMIN_NAME = "Admin";
const ADMIN_ROLE = "ADMIN";

async function clearDatabaseExceptAdminAndUploads() {
  const db = mongoose.connection.db;
  const existingCollections = await db.listCollections().toArray();
  const keepCollections = new Set(["users", "uploads"]);

  for (const { name } of existingCollections) {
    if (name.startsWith("system.")) {
      continue;
    }

    if (!keepCollections.has(name)) {
      try {
        await db.dropCollection(name);
        console.log(`Dropped collection: ${name}`);
      } catch (error) {
        if (error.codeName === "NamespaceNotFound" || /ns not found/i.test(error.message)) {
          continue;
        }
        throw error;
      }
    }
  }
}

async function ensureAdminUser() {
  const normalizedEmail = ADMIN_EMAIL.toLowerCase();
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const existingAdmin = await User.findOne({ email: normalizedEmail });

  if (existingAdmin) {
    await User.deleteMany({ email: { $ne: normalizedEmail } });

    existingAdmin.regId = ADMIN_REG_ID;
    existingAdmin.name = ADMIN_NAME;
    existingAdmin.password = passwordHash;
    existingAdmin.role = ADMIN_ROLE;
    existingAdmin.isApproved = true;
    existingAdmin.isActive = true;
    existingAdmin.isArchived = false;
    existingAdmin.otp = null;
    existingAdmin.otpExpires = null;
    existingAdmin.departments = [];
    existingAdmin.permissions = [];
    await existingAdmin.save();

    console.log(`Preserved admin user: ${normalizedEmail}`);
    return;
  }

  await User.deleteMany({});
  await User.create({
    regId: ADMIN_REG_ID,
    name: ADMIN_NAME,
    email: normalizedEmail,
    password: passwordHash,
    role: ADMIN_ROLE,
    isApproved: true,
    isActive: true,
    isArchived: false,
    departments: [],
    permissions: [],
  });

  console.log(`Created admin user: ${normalizedEmail}`);
}

async function seedAll() {
  await clearDatabaseExceptAdminAndUploads();
  await ensureAdminUser();
}

module.exports = { seedAll };
