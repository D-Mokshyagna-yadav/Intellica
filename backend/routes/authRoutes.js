const express = require("express");
const {
  registerFaculty,
  registerHOD,
  login,
  resendOTP,
  verifyOTP,
  getMe,
  updateProfile,
  updateProfileImage,
  getFacultyProfile,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const profileUpload = require("../middleware/profileUpload");
const asyncHandler = require("../utils/asyncHandler");
const { loginRateLimiter, verifyOtpRateLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

router.post("/faculty/register", profileUpload.single("profileImage"), asyncHandler(registerFaculty));
router.post("/hod/register", profileUpload.single("profileImage"), asyncHandler(registerHOD));

router.post("/login", loginRateLimiter, asyncHandler(login));
router.post("/resend-otp", loginRateLimiter, asyncHandler(resendOTP));
router.post("/verify-otp", verifyOtpRateLimiter, asyncHandler(verifyOTP));

router.get("/me", authMiddleware, asyncHandler(getMe));
router.get("/faculty/:id", authMiddleware, asyncHandler(getFacultyProfile));
router.put("/update-profile", authMiddleware, asyncHandler(updateProfile));
router.put(
  "/update-profile-image",
  authMiddleware,
  profileUpload.single("profileImage"),
  asyncHandler(updateProfileImage)
);

module.exports = router;
