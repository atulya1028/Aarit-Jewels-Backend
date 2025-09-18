const Coupon = require("../models/Coupon");

// Create coupon (admin only)
exports.createCoupon = async (req, res) => {
  try {
    let { code, discount, expiryDate } = req.body;

    if (!code || !discount) {
      return res.status(400).json({ message: "Code and discount are required" });
    }

    // Always uppercase coupon codes
    code = code.toUpperCase();

    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }

    const coupon = await Coupon.create({
      code,
      discount,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
    });

    res.status(201).json(coupon);
  } catch (err) {
    console.error("Error creating coupon:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get all coupons (admin only)
exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) {
    console.error("Error fetching coupons:", err);
    res.status(500).json({ message: err.message });
  }
};

// Apply coupon (for checkout, user protected)
exports.applyCoupon = async (req, res) => {
  try {
    let { code, total } = req.body;

    if (!code || total == null || total <= 0) {
      return res
        .status(400)
        .json({ message: "Coupon code and a valid total are required" });
    }

    code = code.toUpperCase();

    const coupon = await Coupon.findOne({ code });
    if (!coupon) {
      return res.status(400).json({ message: "Invalid coupon code" });
    }

    // Expiry check
    const now = new Date();
    if (coupon.expiryDate && coupon.expiryDate < now) {
      return res.status(400).json({ message: "Coupon has expired" });
    }

    const discountAmount = (total * coupon.discount) / 100;
    const totalAfterDiscount = Math.max(total - discountAmount, 0); // never go negative

    res.json({
      code: coupon.code,
      discount: coupon.discount,
      discountAmount,
      totalAfterDiscount,
    });
  } catch (err) {
    console.error("Error applying coupon:", err);
    res.status(500).json({ message: err.message });
  }
};

// Delete coupon (admin only)
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.json({ message: "Coupon deleted successfully" });
  } catch (err) {
    console.error("Error deleting coupon:", err);
    res.status(500).json({ message: err.message });
  }
};
