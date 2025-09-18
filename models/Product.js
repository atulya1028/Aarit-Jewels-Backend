const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: {
    type: String,
    enum: ["Earrings", "Bracelets", "Pendants", "Necklaces"],
    default: "Earrings",
  },
  images: [String], // Cloudinary URLs
  discount: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

productSchema.virtual("imageUrl").get(function () {
  return this.images?.length > 0 ? this.images[0] : "";
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Product", productSchema);
