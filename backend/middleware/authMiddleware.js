const jwt = require("jsonwebtoken");
const Faculty = require("../models/Faculty");
const HOD = require("../models/HOD");
const User = require("../models/User");
const ROLES = require("../constants/roles");

const roleToModel = {
  [ROLES.FACULTY]: Faculty,
  [ROLES.HOD]: HOD,
  [ROLES.ADMIN]: User,
};

module.exports = async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication token is required" });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const normalizedRole = String(decoded.role || "").toUpperCase();
    const Model = roleToModel[normalizedRole];

    if (!Model) {
      return res.status(401).json({ message: "Invalid token role" });
    }

    const user = await Model.findById(decoded.id).lean();

    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    if (normalizedRole !== String(user.role || "").toUpperCase()) {
      return res.status(403).json({ message: "Role mismatch detected" });
    }

    req.user = {
      id: user._id.toString(),
      employeeId: user.employeeId || user.regId || null,
      role: normalizedRole,
      department: user.department || null,
      name: user.name || user.regId || "User",
      email: user.email || null,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
