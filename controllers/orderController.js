const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Razorpay = require("razorpay");
const crypto = require("crypto");

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error("❌ Razorpay keys are missing in .env");
  process.exit(1);
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ----------------------
// Create Razorpay Order
// ----------------------
exports.createOrder = async (req, res) => {
  const { amount, currency } = req.body;

  if (!amount || amount <= 0) {
    return res
      .status(400)
      .json({ message: "Amount must be provided and greater than 0" });
  }

  try {
    const options = {
      amount: amount * 100, // amount in paisa
      currency: currency || "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error("Razorpay order creation error:", err);
    res.status(500).json({
      message: "Failed to create Razorpay order",
      error: err.message,
    });
  }
};

// ----------------------
// Place COD Order (optional, not used for Razorpay)
// ----------------------
exports.placeOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product"
    );
    if (!cart || cart.items.length === 0)
      return res.status(400).json({ message: "Cart is empty" });

    const total = cart.items.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );

    const { address } = req.body;
    if (
      !address ||
      !address.name ||
      !address.street ||
      !address.city ||
      !address.state ||
      !address.zip ||
      !address.phone
    ) {
      return res.status(400).json({ message: "Address is required" });
    }

    const order = await Order.create({
      user: req.user._id,
      items: cart.items.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
      })),
      total,
      paymentId: req.body.paymentId || "",
      status: "Pending",
      address,
    });

    await cart.remove();
    res.json(order);
  } catch (err) {
    console.error("Place order error:", err);
    res.status(500).json({
      message: "Failed to place order",
      error: err.message,
    });
  }
};

// ----------------------
// Verify Razorpay Payment & Save Order
// ----------------------
exports.verifyPayment = async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    couponCode,
    address,
  } = req.body;

  // ✅ Require address
  if (
    !address ||
    !address.name ||
    !address.street ||
    !address.city ||
    !address.state ||
    !address.zip ||
    !address.phone
  ) {
    return res.status(400).json({ message: "Address is required" });
  }

  try {
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product"
    );
    if (!cart || cart.items.length === 0)
      return res.status(400).json({ message: "Cart is empty" });

    const total = cart.items.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );

    let discount = 0;
    if (couponCode) {
      const Coupon = require("../models/Coupon");
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (coupon) discount = coupon.discount;
    }

    const finalAmount = total - (total * discount) / 100;

    const order = await Order.create({
      user: req.user._id,
      items: cart.items.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
      })),
      total: finalAmount,
      paymentId: razorpay_payment_id,
      status: "Completed",
      couponCode: couponCode || null,
      address, // ✅ Save address in order
    });

    await cart.remove();

    res.json({
      message: "Payment verified & order placed successfully",
      order,
    });
  } catch (err) {
    console.error("Payment verification error:", err);
    res.status(500).json({
      message: "Payment verification failed",
      error: err.message,
    });
  }
};

// ----------------------
// Get user orders
// ----------------------
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate(
      "items.product"
    );
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// ----------------------
// Get all orders (admin)
// ----------------------
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("items.product")
      .populate("user", "name email");
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch all orders" });
  }
};

// ----------------------
// Update order status (admin)
// ----------------------
exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update order status" });
  }
};
