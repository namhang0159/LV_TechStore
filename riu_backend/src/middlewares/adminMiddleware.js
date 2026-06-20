const adminMiddleware = (req, res, next) => {
  // Ensure the user is already authenticated by authMiddleware
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  // Check if the user has an admin-level role
  const allowedRoles = ["admin", "staff", "manager"];
  if (req.user.role && allowedRoles.includes(req.user.role)) {
    next();
  } else {
    return res.status(403).json({ message: "Access denied. Admin permissions required." });
  }
};

module.exports = adminMiddleware;
