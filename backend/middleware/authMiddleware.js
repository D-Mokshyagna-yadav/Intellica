const jwt = require("jsonwebtoken");
const HOD = require("../models/HOD");
const Faculty = require("../models/Faculty");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user;

    if (decoded.role === "FACULTY") {
      user = await Faculty.findById(decoded.id);
    }
    else if (decoded.role === "HOD") {
      user = await HOD.findById(decoded.id);
    }
    else if (decoded.role === "ADMIN") {
      user = await User.findById(decoded.id);
    }

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    /* ===== Attach user data to request ===== */

    req.user = {
      id: user._id.toString(),
      employeeId: user.employeeId || null,
      role: user.role,
      department: user.department || null,
      name: user.name
    };

    next();

  } catch (err) {

    console.error("TOKEN ERROR:", err);

    return res.status(401).json({
      message: "Invalid token"
    });

  }
};

module.exports = authMiddleware;