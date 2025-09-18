const Product = require("../models/Product");

exports.getAllProducts = async (req, res) => {
  try {
    console.log('getAllProducts: Fetching products');
    const products = await Product.find();
    res.json({ products });
  } catch (err) {
    console.error('getAllProducts: Error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    console.log('getProductById: Fetching product ID:', req.params.id);
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ product });
  } catch (err) {
    console.error('getProductById: Error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, price, category } = req.body;
    if (!name || !price || !category) {
      return res.status(400).json({ message: "Name, price, and category are required" });
    }

    // Use Cloudinary URLs
    const images = req.files ? req.files.map(file => file.path) : [];

    const product = await Product.create({
      ...req.body,
      images,
      createdBy: req.user._id,
    });

    res.status(201).json({ product });
  } catch (err) {
    console.error('createProduct: Error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    let images;
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => file.path);
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, ...(images && { images }) },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ product });
  } catch (err) {
    console.error('updateProduct: Error:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error('deleteProduct: Error:', err);
    res.status(500).json({ message: err.message });
  }
};
