const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Helper: Generate JWT
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

// --------------------
// Auth Controllers
// --------------------

// @desc    Register user
exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
};

// @desc    Login user
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

// @desc    Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --------------------
// Address Controllers
// --------------------

// @desc    Add new address
exports.addAddress = async (req, res) => {
  const { name, street, city, state, zip, phone } = req.body;
  if (!name || !street || !city || !state || !zip || !phone) {
    return res.status(400).json({ message: "All address fields are required" });
  }
  try {
    const user = await User.findById(req.user._id);
    user.addresses.push({ name, street, city, state, zip, phone });
    await user.save();
    res.json({ message: "Address added", addresses: user.addresses });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to add address", error: err.message });
  }
};

// @desc    Delete address
exports.deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter(
      (addr) => addr._id.toString() !== req.params.id
    );
    await user.save();
    res.json({ message: "Address deleted", addresses: user.addresses });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete address", error: err.message });
  }
};

// @desc    Update address
exports.updateAddress = async (req, res) => {
  const { id } = req.params;
  const { name, street, city, state, zip, phone } = req.body;
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(id);
    if (!address) return res.status(404).json({ message: "Address not found" });

    address.name = name || address.name;
    address.street = street || address.street;
    address.city = city || address.city;
    address.state = state || address.state;
    address.zip = zip || address.zip;
    address.phone = phone || address.phone;

    await user.save();
    res.json({ message: "Address updated", addresses: user.addresses });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update address", error: err.message });
  }
};

// --------------------
// Password controllers (forgot/reset/change) go here if you already had them
// --------------------
