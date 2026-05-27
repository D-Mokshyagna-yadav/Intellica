const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const {
  registerFaculty,
  registerHOD,
  login,
  verifyOTP,
  getMe,
  updateProfile,
  updateProfileImage,
  getFacultyProfile
} = require("../controllers/authController");

const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const profileUpload = require("../middleware/profileUpload");

/* REGISTER */

router.post(
  "/faculty/register",
  profileUpload.single("profileImage"),
  registerFaculty
);

router.post(
  "/hod/register",
  profileUpload.single("profileImage"),
  registerHOD
);

/* LOGIN */

router.post("/login", login);
router.post("/verify-otp", verifyOTP);

/* CURRENT USER */

router.get("/me", authMiddleware, getMe);
router.get("/faculty/:id", authMiddleware, getFacultyProfile);
/* UPDATE PROFILE */

router.put("/update-profile", authMiddleware, updateProfile);

/* UPDATE PROFILE IMAGE */

router.put(
  "/update-profile-image",
  authMiddleware,
  profileUpload.single("profileImage"),
  updateProfileImage
);

/* CREATE ADMIN */

router.post("/create-admin", async (req, res) => {
  try {

    await User.deleteMany({ regId: "admin" });

    const hashedPassword = await bcrypt.hash("admin123", 10);

    await User.create({
      regId: "admin",
      password: hashedPassword,
      role: "ADMIN",
      isApproved: true
    });

    res.json({ message: "Admin created successfully" });

  } catch (err) {

    console.error("CREATE ADMIN ERROR:", err);

    res.status(500).json({
      message: "Admin creation failed"
    });

  }
});

module.exports = router;