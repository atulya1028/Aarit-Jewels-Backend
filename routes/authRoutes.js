const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getCurrentUser,
  addAddress,
  deleteAddress,
  updateAddress,
  // include changePassword, forgotPassword, resetPassword if you already implemented them
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Auth
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getCurrentUser);

// Address Book
router.post("/address", protect, addAddress);
router.delete("/address/:id", protect, deleteAddress);
router.put("/address/:id", protect, updateAddress);

module.exports = router;
