const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {
  createCoupon,
  getCoupons,
  applyCoupon,
  deleteCoupon,
} = require("../controllers/couponController");
const Coupon = require("../models/Coupon");

// ✅ Admin - Get all coupons
router.get("/", protect, admin, getCoupons);

// ✅ Admin - Create new coupon
router.post("/", protect, admin, createCoupon);

// ✅ User - Apply coupon at checkout
router.post("/apply", protect, applyCoupon);

// ✅ Admin - Delete coupon
router.delete("/:id", protect, admin, deleteCoupon);

// ✅ Public - Get active coupons (no login needed)
router.get("/public", async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      $or: [
        { expiryDate: null }, // never expires
        { expiryDate: { $gte: now } }, // valid expiry
      ],
    }).sort({ createdAt: -1 });

    res.json(coupons);
  } catch (err) {
    console.error("Error fetching public coupons:", err);
    res.status(500).json({ message: "Failed to fetch coupons" });
  }
});

module.exports = router;
