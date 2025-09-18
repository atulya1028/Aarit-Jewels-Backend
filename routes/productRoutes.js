const express = require("express");
const multer = require("multer"); // ✅ FIXED missing import
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } = require("../controllers/productController");
const upload = require("../middleware/upload");

// Multer error handling middleware
const handleMulterError = (req, res, next) => {
  upload.array('images', 5)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('productRoutes: Multer error:', err.message);
      return res.status(400).json({ message: `Multer error: ${err.message}` });
    } else if (err) {
      console.error('productRoutes: File error:', err.message);
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/", protect, admin, handleMulterError, createProduct);
router.put("/:id", protect, admin, handleMulterError, updateProduct);
router.delete("/:id", protect, admin, deleteProduct);

module.exports = router;
