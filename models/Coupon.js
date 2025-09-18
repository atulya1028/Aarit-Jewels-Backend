const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true, // Enforce uppercase for consistency
    trim: true,
  },
  discount: {
    type: Number,
    required: true,
    min: [0, "Discount cannot be negative"],
    max: [100, "Discount cannot exceed 100%"],
  },
  expiryDate: {
    type: Date,
    default: null, // Allow null for non-expiring coupons
  },
}, { timestamps: true });

module.exports = mongoose.model("Coupon", couponSchema);