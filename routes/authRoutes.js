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

// 🔑 Auth routes
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getCurrentUser);
router.put("/change-password", protect, changePassword);

// 🔑 Forgot/Reset Password
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

module.exports = router;
