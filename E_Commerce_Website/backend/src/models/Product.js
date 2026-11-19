import mongoose from "mongoose";

export const PRODUCT_CATEGORIES = [
  "Electronics", "Fashion", "Home & Kitchen", "Beauty", "Sports",
  "Books", "Toys & Games", "Grocery", "Accessories", "Other"
];

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 160 },
  description: { type: String, required: true, trim: true, maxlength: 3000 },
  brand: { type: String, trim: true, default: "MarketHub" },
  category: { type: String, required: true, enum: PRODUCT_CATEGORIES },
  price: { type: Number, required: true, min: 0 },
  mrp: { type: Number, required: true, min: 0 },
  image: { type: String, required: true, trim: true },
  images: [{ type: String, trim: true }],
  stock: { type: Number, required: true, min: 0, default: 0 },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  numReviews: { type: Number, min: 0, default: 0 },
  featured: { type: Boolean, default: false },
  active: { type: Boolean, default: true }
}, { timestamps: true });

productSchema.index({ name: "text", description: "text", brand: "text" });
productSchema.index({ category: 1, active: 1, price: 1 });

export default mongoose.model("Product", productSchema);
