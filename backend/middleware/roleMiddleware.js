module.exports = function roleMiddleware(...allowedRoles) {
  const normalizedRoles = allowedRoles.flat().map((role) => String(role).toUpperCase());

  return (req, res, next) => {
    const userRole = String(req.user?.role || "").toUpperCase();

    if (!userRole) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!normalizedRoles.includes(userRole)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};
