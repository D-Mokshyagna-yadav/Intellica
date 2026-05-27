module.exports = (requiredRole) => {
  return (req, res, next) => {

    // ✅ Check if user exists
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "Unauthorized - No user data" });
    }

    // ✅ Normalize both roles to uppercase (avoid HOD vs hod issues)
    const userRole = req.user.role.toUpperCase();
    const expectedRole = requiredRole.toUpperCase();

    if (userRole !== expectedRole) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};