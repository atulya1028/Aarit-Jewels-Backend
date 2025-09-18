const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {
  createOrder,
  placeOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  verifyPayment,
} = require("../controllers/orderController");

router.post("/razorpay", protect, createOrder);
router.post("/verify", protect, verifyPayment);
router.post("/", protect, placeOrder);
router.get("/myorders", protect, getUserOrders);
router.get("/", protect, admin, getAllOrders);
router.put("/:id", protect, admin, updateOrderStatus);

module.exports = router;