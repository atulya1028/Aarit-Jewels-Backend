const express = require("express");
const multer = require("multer");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware"); // ✅ must export admin
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController"); // ✅ all must be exported functions
const upload = require("../middleware/upload");

// ✅ Multer error handler
const handleMulterError = (req, res, next) => {
  upload.array("images", 5)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `Multer error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

// ✅ Routes
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/", protect, admin, handleMulterError, createProduct);
router.put("/:id", protect, admin, handleMulterError, updateProduct);
router.delete("/:id", protect, admin, deleteProduct);

module.exports = router;
