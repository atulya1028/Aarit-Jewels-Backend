const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
      console.log('protect: Verifying token:', token); // Debug log
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('protect: Token decoded:', decoded); // Debug log
      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        console.log('protect: User not found for ID:', decoded.id); // Debug log
        return res.status(401).json({ message: "Not authorized, user not found" });
      }
      console.log('protect: User set:', { id: req.user._id, email: req.user.email, role: req.user.role }); // Debug log
      next();
    } else {
      console.log('protect: No token provided'); // Debug log
      return res.status(401).json({ message: "Not authorized, no token" });
    }
  } catch (error) {
    console.error('protect: Token verification failed:', error.message); // Debug log
    return res.status(401).json({ message: "Token invalid or expired" });
  }
};

const admin = (req, res, next) => {
  console.log('admin: Checking role for user ID:', req.user?._id); // Debug log
  if (req.user && req.user.role === "admin") {
    console.log('admin: Admin access granted for user ID:', req.user._id); // Debug log
    next();
  } else {
    console.log('admin: Admin access denied for user ID:', req.user?._id); // Debug log
    return res.status(403).json({ message: "Admin access only" });
  }
};

module.exports = { protect, admin };