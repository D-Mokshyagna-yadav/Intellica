const express = require("express");
const {
  registerFaculty,
  registerHOD,
  login,
  loginWithPassword,
  changePassword,
  resendOTP,
  verifyOTP,
  getMe,
  updateProfile,
  updateProfileImage,
  getFacultyProfile,
  resetPasswordWithOTP,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const ROLES = require("../constants/roles");
const profileUpload = require("../middleware/profileUpload");
const asyncHandler = require("../utils/asyncHandler");
const { loginRateLimiter, verifyOtpRateLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

router.post("/faculty/register", profileUpload.single("profileImage"), asyncHandler(registerFaculty));
router.post("/hod/register", profileUpload.single("profileImage"), asyncHandler(registerHOD));

router.post("/login", loginRateLimiter, asyncHandler(login));
router.post("/login-password", loginRateLimiter, asyncHandler(loginWithPassword));
router.post("/resend-otp", loginRateLimiter, asyncHandler(resendOTP));
router.post("/verify-otp", verifyOtpRateLimiter, asyncHandler(verifyOTP));
router.post("/forgot-password", loginRateLimiter, asyncHandler(login));
router.post("/reset-password", verifyOtpRateLimiter, asyncHandler(resetPasswordWithOTP));
router.post("/change-password", authMiddleware, asyncHandler(changePassword));

router.get("/me", authMiddleware, roleMiddleware(ROLES.FACULTY, ROLES.HOD, ROLES.ADMIN), asyncHandler(getMe));
router.get("/faculty/:id", authMiddleware, roleMiddleware(ROLES.FACULTY, ROLES.HOD, ROLES.ADMIN), asyncHandler(getFacultyProfile));
router.put("/update-profile", authMiddleware, roleMiddleware(ROLES.FACULTY, ROLES.HOD, ROLES.ADMIN), asyncHandler(updateProfile));
router.put(
  "/update-profile-image",
  authMiddleware,
  roleMiddleware(ROLES.FACULTY, ROLES.HOD, ROLES.ADMIN),
  profileUpload.single("profileImage"),
  asyncHandler(updateProfileImage)
);

module.exports = router;
