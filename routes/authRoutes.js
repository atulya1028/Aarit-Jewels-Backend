const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  register,
  login,
  getCurrentUser,
  changePassword,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

// ✅ Debug log for every auth request
router.use((req, res, next) => {
  console.log(`📩 Auth Route Hit: ${req.method} ${req.originalUrl}`);
  next();
});

// Auth routes
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getCurrentUser);
router.put("/change-password", protect, changePassword);

// Forgot/Reset Password
router.post("/forgot-password", (req, res, next) => {
  console.log("📩 Forgot Password route triggered with body:", req.body);
  next();
}, forgotPassword);

router.put("/reset-password/:token", (req, res, next) => {
  console.log("📩 Reset Password route triggered with token:", req.params.token);
  console.log("📩 Reset Password body:", req.body);
  next();
}, resetPassword);

module.exports = router;
