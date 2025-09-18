const Cart = require("../models/Cart");
const Product = require("../models/Product");

exports.getCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  res.json(cart || { items: [] });
};

exports.addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [{ product: productId, quantity }] });
  } else {
    const index = cart.items.findIndex(item => item.product.toString() === productId);
    if (index > -1) {
      cart.items[index].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }
    await cart.save();
  }

  cart = await cart.populate("items.product");
  res.json(cart);
};

exports.updateCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) return res.status(404).json({ message: "Cart not found" });

  const index = cart.items.findIndex(item => item.product.toString() === productId);
  if (index > -1) {
    if (quantity <= 0) {
      cart.items.splice(index, 1);
    } else {
      cart.items[index].quantity = quantity;
    }
    await cart.save();
  }

  const updatedCart = await cart.populate("items.product");
  res.json(updatedCart);
};

exports.clearCart = async (req, res) => {
  await Cart.findOneAndDelete({ user: req.user._id });
  res.json({ message: "Cart cleared" });
};