const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ✅ Protect middleware
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      return next();
    } catch (err) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }
};

// ✅ Admin middleware
exports.admin = (req, res, next) => {
  // Option 1: check via user role
  if (req.user && req.user.role === "admin") {
    return next();
  }

  // Option 2: fallback for now → check email from .env
  if (req.user && req.user.email === process.env.ADMIN_EMAIL) {
    return next();
  }

  return res.status(403).json({ message: "Admin access denied" });
};
