const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getCart, addToCart, updateCart, clearCart } = require("../controllers/cartController");

router.get("/", protect, getCart);
router.post("/", protect, addToCart);
router.put("/", protect, updateCart);
router.delete("/", protect, clearCart);

module.exports = router;