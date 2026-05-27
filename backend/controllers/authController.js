
const jwt = require("jsonwebtoken");
const crypto = require('crypto');

const Faculty = require("../models/Faculty");
const HOD = require("../models/HOD");
const User = require("../models/User");
const { sendOTP, sendRegistrationNotification } = require("../utils/emailService");
// Removed duplicate declaration of bcrypt

/* =====================================================
   FACULTY REGISTRATION
===================================================== */
exports.registerFaculty = async (req, res) => {
  try {

    if (req.fileValidationError) {
      return res.status(400).json({
        message: req.fileValidationError
      });
    }

    const {
      employeeId,
      name,
      email,
      department,
      designation,
      googleScholar,
      vidwanId,
      scopusId
    } = req.body;

    if (!employeeId || !name || !email || !department || !designation) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Profile image is required"
      });
    }

    if (!googleScholar && !vidwanId && !scopusId) {
      return res.status(400).json({
        message: "At least one research ID is required"
      });
    }

    const normalizedDept = department.trim().toUpperCase();

    const existing = await Faculty.findOne({
      $or: [
        { employeeId: employeeId.trim() },
        { email: email.trim().toLowerCase() }
      ]
    });

    if (existing) {
      return res.status(400).json({
        message: "Employee ID or Email already exists"
      });
    }

    const hodExists = await HOD.findOne({
      department: normalizedDept,
      isApproved: true
    });

    if (!hodExists) {
      return res.status(400).json({
        message: "No approved HOD found for this department"
      });
    }

    const newFaculty = new Faculty({
      employeeId: employeeId.trim(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      department: normalizedDept,
      designation: designation.trim(),
      googleScholar: googleScholar || "",
      vidwanId: vidwanId || "",
      scopusId: scopusId || "",
      role: "FACULTY",
      isApproved: false,
      status: "PENDING",
      profileImage: req.file.filename
    });

    await newFaculty.save();

    // send registration email to faculty and notify admins
    try {
      await sendRegistrationNotification({
        name: newFaculty.name,
        email: newFaculty.email,
        role: 'FACULTY',
        department: newFaculty.department
      });
    } catch (err) {
      console.error('Failed to send registration notification:', err);
    }

    res.status(201).json({
      message: `Faculty registered under ${normalizedDept}. Waiting for HOD approval.`
    });

  } catch (err) {
    console.error("FACULTY REGISTER ERROR:", err);
    res.status(500).json({ message: "Faculty registration failed" });
  }
};


/* =====================================================
   HOD REGISTRATION
===================================================== */
exports.registerHOD = async (req, res) => {
  try {

    if (req.fileValidationError) {
      return res.status(400).json({
        message: req.fileValidationError
      });
    }

    const {
      employeeId,
      name,
      email,
      department,
      designation,
      googleScholar,
      vidwanId,
      scopusId
    } = req.body;

    if (!employeeId || !name || !email || !department || !designation) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Profile image is required"
      });
    }

    const normalizedDept = department.trim().toUpperCase();

    const existing = await HOD.findOne({
      $or: [
        { employeeId: employeeId.trim() },
        { email: email.trim().toLowerCase() }
      ]
    });

    if (existing) {
      return res.status(400).json({
        message: "Employee ID or Email already exists"
      });
    }

    const departmentHOD = await HOD.findOne({
      department: normalizedDept
    });

    if (departmentHOD) {
      return res.status(400).json({
        message: `HOD already registered for ${normalizedDept}`
      });
    }

    const newHOD = new HOD({
      employeeId: employeeId.trim(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      department: normalizedDept,
      designation: designation.trim(),
      googleScholar: googleScholar || "",
      vidwanId: vidwanId || "",
      scopusId: scopusId || "",
      role: "HOD",
      isApproved: false,
      status: "PENDING",
      profileImage: req.file.filename
    });

    await newHOD.save();

    // send registration email to HOD and notify admins
    try {
      await sendRegistrationNotification({
        name: newHOD.name,
        email: newHOD.email,
        role: 'HOD',
        department: newHOD.department
      });
    } catch (err) {
      console.error('Failed to send HOD registration notification:', err);
    }

    res.status(201).json({
      message: `HOD registered for ${normalizedDept}. Waiting for Admin approval.`
    });

  } catch (err) {
    console.error("HOD REGISTER ERROR:", err);
    res.status(500).json({ message: "HOD registration failed" });
  }
};


/* =====================================================
   LOGIN - SEND OTP
===================================================== */
exports.login = async (req, res) => {
  try {

    const identifier = req.body.identifier?.toString().trim();

    if (!identifier) {
      return res.status(400).json({ message: "Identifier is required" });
    }

    let user;
    let foundRole;

    // Search in Faculty model
    user = await Faculty.findOne({
      $or: [
        { employeeId: identifier },
        { email: identifier.toLowerCase() }
      ]
    });
    if (user) {
      foundRole = "FACULTY";
    } else {
      // Search in HOD model
      user = await HOD.findOne({
        $or: [
          { employeeId: identifier },
          { email: identifier.toLowerCase() }
        ]
      });
      if (user) {
        foundRole = "HOD";
      } else {
        // Search in User model (Admin)
        user = await User.findOne({
          $or: [
            { regId: identifier },
            { email: identifier.toLowerCase() }
          ]
        });
        if (user) {
          foundRole = "ADMIN";
        }
      }
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

/* =====================================================
   HANDLE ACCOUNT STATUS
===================================================== */

if (foundRole === "FACULTY") {

  if (user.status === "DISCUSSION") {
    return res.status(403).json({
      message: "HOD requested discussion before approving your account"
    });
  }

  if (user.status !== "APPROVED") {
    return res.status(403).json({
      message: "Your account is waiting for HOD approval"
    });
  }

}

if (foundRole === "HOD") {

  if (user.status === "DISCUSSION") {
    return res.status(403).json({
      message: "Admin requested discussion before approving your account"
    });
  }

  if (user.status !== "APPROVED") {
    return res.status(403).json({
      message: "Your account is waiting for Admin approval"
    });
  }

}

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Set OTP and expiration (10 minutes)
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    // Send OTP to email
    try {
      await sendOTP(user.email, otp);
    } catch (emailError) {
      console.error('Email send error:', emailError);
      return res.status(500).json({ message: "Failed to send OTP. Please try again." });
    }

    res.status(200).json({
      message: "OTP sent to your email. Please check your inbox."
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   VERIFY OTP
===================================================== */
exports.verifyOTP = async (req, res) => {
  try {
    const { identifier, otp } = req.body;

    if (!identifier || !otp) {
      return res.status(400).json({ message: "Identifier and OTP are required" });
    }

    let user;
    let foundRole;

    // Search in Faculty model
    user = await Faculty.findOne({
      $or: [
        { employeeId: identifier },
        { email: identifier.toLowerCase() }
      ]
    });
    if (user) {
      foundRole = "FACULTY";
    } else {
      // Search in HOD model
      user = await HOD.findOne({
        $or: [
          { employeeId: identifier },
          { email: identifier.toLowerCase() }
        ]
      });
      if (user) {
        foundRole = "HOD";
      } else {
        // Search in User model (Admin)
        user = await User.findOne({
          $or: [
            { regId: identifier },
            { email: identifier.toLowerCase() }
          ]
        });
        if (user) {
          foundRole = "ADMIN";
        }
      }
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    if (user.otpExpires < new Date()) {
      return res.status(401).json({ message: "OTP expired" });
    }

    // Clear OTP
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        department: user.department || null
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(200).json({
      token,
      role: user.role,
      name: user.name,
      department: user.department || null,
      designation: user.designation || null,
      googleScholar: user.googleScholar || "",
      vidwanId: user.vidwanId || "",
      scopusId: user.scopusId || "",
      profileImage: user.profileImage || "",
      message: "Login successful"
    });

  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};


/* =====================================================
   GET CURRENT USER
===================================================== */
exports.getMe = async (req, res) => {
  try {

    let user;

    if (req.user.role === "FACULTY") {
      user = await Faculty.findById(req.user.id).select("-password");
    } else if (req.user.role === "HOD") {
      user = await HOD.findById(req.user.id).select("-password");
    } else {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);

  } catch (err) {
    console.error("GET ME ERROR:", err);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};


/* =====================================================
   UPDATE PROFILE NAME
===================================================== */
exports.updateProfile = async (req, res) => {
  try {

    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Name is required" });
    }

    let user;

    if (req.user.role === "FACULTY") {
      user = await Faculty.findById(req.user.id);
    } else if (req.user.role === "HOD") {
      user = await HOD.findById(req.user.id);
    }

    user.name = name.trim();
    await user.save();

    res.json({
      message: "Profile updated successfully",
      name: user.name
    });

  } catch (err) {
    console.error("PROFILE UPDATE ERROR:", err);
    res.status(500).json({ message: "Profile update failed" });
  }
};

/* =====================================================
   UPDATE PROFILE IMAGE
===================================================== */

exports.updateProfileImage = async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    let user;

    if (req.user.role === "FACULTY") {
      user = await Faculty.findById(req.user.id);
    } else if (req.user.role === "HOD") {
      user = await HOD.findById(req.user.id);
    } else {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.profileImage = req.file.filename;
    await user.save();

    res.json({
      message: "Profile image updated successfully",
      profileImage: user.profileImage
    });

  } catch (err) {

    console.error("UPDATE PROFILE IMAGE ERROR:", err);

    res.status(500).json({
      message: "Failed to update profile image"
    });

  }
};


/* =====================================================
   GET FACULTY PROFILE (FOR HOD DASHBOARD)
===================================================== */

exports.getFacultyProfile = async (req, res) => {
  try {

    const { id } = req.params;

    const faculty = await Faculty.findById(id).select("-password");

    if (!faculty) {
      return res.status(404).json({
        message: "Faculty not found"
      });
    }

    res.json(faculty);

  } catch (error) {

    console.error("GET FACULTY PROFILE ERROR:", error);

    res.status(500).json({
      message: "Server error"
    });

  }
};

