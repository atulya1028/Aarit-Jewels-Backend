const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// Helper to generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// 📌 Register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// 📌 Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user._id);
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// 📌 Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// 📌 Change password
exports.changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(req.body.oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Old password is incorrect" });

    user.password = req.body.newPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// 📌 Forgot Password
exports.forgotPassword = async (req, res) => {
  console.log("🔑 forgotPassword called with email:", req.body.email);

  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      console.log("❌ forgotPassword: No user found with email:", req.body.email);
      return res.status(404).json({ message: "User not found with this email" });
    }

    // 🔑 Generate reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    console.log("✅ forgotPassword: Generated reset token:", resetToken);

    // 🔗 Reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    console.log("🔗 forgotPassword: Reset URL:", resetUrl);

    const message = `
      <h2>Password Reset Request</h2>
      <p>Click below to reset your password:</p>
      <a href="${resetUrl}" target="_blank">${resetUrl}</a>
    `;

    try {
      console.log("📧 forgotPassword: Sending email to:", user.email);
      await sendEmail({
        to: user.email,
        subject: "Password Reset",
        html: message,
      });
      console.log("✅ forgotPassword: Email sent successfully to:", user.email);

      res.json({ message: "Reset link sent to email" });
    } catch (error) {
      console.error("❌ forgotPassword: Email sending failed:", error.message);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ message: "Email could not be sent" });
    }
  } catch (err) {
    console.error("❌ forgotPassword: Server error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 📌 Reset Password
exports.resetPassword = async (req, res) => {
  console.log("🔑 resetPassword called with token:", req.params.token);

  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    console.log("🔑 resetPassword: Hashed token:", resetPasswordToken);

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      console.log("❌ resetPassword: Invalid or expired token");
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    console.log("✅ resetPassword: User found:", user.email);

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    console.log("✅ resetPassword: Password reset successful for:", user.email);

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("❌ resetPassword: Server error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
