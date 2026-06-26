const User = require("../models/User");
const HOD = require("../models/HOD");
const Department = require("../models/Department");
const bcrypt = require("bcryptjs");
const logger = require("./logger");
const { seedAll } = require("./seedData");

async function bootstrapAdmin() {
  try {
    // First, seed all default data
    await seedAll();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: "ADMIN", isArchived: false });
    
    if (existingAdmin) {
      logger.info("Admin user already exists. Skipping admin creation.");
      return;
    }

    // Check if there's at least one department
    let defaultDepartment = await Department.findOne({ isActive: true, isArchived: false });
    
    if (!defaultDepartment) {
      logger.warn("No departments found. Admin creation requires at least one department.");
      return;
    }

    // Create default admin
    const adminEmail = process.env.ADMIN_EMAIL || "admin@fpmi.edu";
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";
    const adminRegId = process.env.ADMIN_REG_ID || "ADMIN001";

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const admin = await User.create({
      regId: adminRegId,
      name: "System Administrator",
      email: adminEmail,
      password: hashedPassword,
      role: "ADMIN",
      isApproved: true,
      isActive: true,
      isArchived: false,
      permissions: ["*"], // Full access
    });

    logger.info({ adminId: admin._id, email: admin.email }, "Default admin user created successfully");
    logger.warn(`
    ╔══════════════════════════════════════════════════════════╗
    ║           DEFAULT ADMIN CREDENTIALS CREATED              ║
    ╠══════════════════════════════════════════════════════════╣
    ║  Email: ${adminEmail.padEnd(44)}║
    ║  Password: ${adminPassword.padEnd(43)}║
    ║  Reg ID: ${adminRegId.padEnd(45)}║
    ╠══════════════════════════════════════════════════════════╣
    ║  ⚠️  CHANGE THESE CREDENTIALS IMMEDIATELY! ⚠️            ║
    ╚══════════════════════════════════════════════════════════╝
    `);

    return admin;
  } catch (error) {
    logger.error({ err: error }, "Error during admin bootstrap");
    throw error;
  }
}

module.exports = bootstrapAdmin;
