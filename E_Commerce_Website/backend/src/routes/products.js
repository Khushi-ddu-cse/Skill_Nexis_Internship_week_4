import { Router } from "express";
import mongoose from "mongoose";
import Product, { PRODUCT_CATEGORIES } from "../models/Product.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(48, Math.max(1, Number.parseInt(req.query.limit, 10) || 12));
    const filter = { active: true };
    if (req.query.category && req.query.category !== "All") filter.category = req.query.category;
    if (req.query.featured === "true") filter.featured = true;
    if (req.query.q?.trim()) {
      const term = req.query.q.trim().slice(0, 80);
      
filter.$or = [
  {
    name: {
      $regex: term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      $options: "i"
    }
  },
  {
    brand: {
      $regex: term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      $options: "i"
    }
  },
  {
    description: {
      $regex: term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      $options: "i"
    }
  }
];

    }
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = Math.max(0, Number(req.query.minPrice));
      if (req.query.maxPrice) filter.price.$lte = Math.max(0, Number(req.query.maxPrice));
    }
    const sortMap = { newest: { createdAt: -1 }, priceLow: { price: 1 }, priceHigh: { price: -1 }, rating: { rating: -1 }, popular: { numReviews: -1 } };
    const sort = sortMap[req.query.sort] || sortMap.newest;
    const [products, total] = await Promise.all([
      Product.find(filter).sort(sort).skip((page - 1) * limit).limit(limit),
      Product.countDocuments(filter)
    ]);
    res.json({ products, total, page, pages: Math.ceil(total / limit), categories: PRODUCT_CATEGORIES });
  } catch (error) { next(error); }
});

router.get("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid product ID." });
    const product = await Product.findOne({ _id: req.params.id, active: true });
    if (!product) return res.status(404).json({ message: "Product not found." });
    res.json({ product });
  } catch (error) { next(error); }
});

router.post("/", protect, adminOnly, async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ product, message: "Product created." });
  } catch (error) { next(error); }
});

router.put("/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: "Product not found." });
    res.json({ product, message: "Product updated." });
  } catch (error) { next(error); }
});

router.delete("/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
    if (!product) return res.status(404).json({ message: "Product not found." });
    res.json({ message: "Product archived." });
  } catch (error) { next(error); }
});

export default router;
