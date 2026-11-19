import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Product from "../models/Product.js";

const products = [
  { name: "Wireless Noise-Cancelling Headphones", brand: "SoundPeak", category: "Electronics", price: 2499, mrp: 3999, stock: 24, rating: 4.5, numReviews: 128, featured: true, image: "https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=900" },
  { name: "Everyday Running Sneakers", brand: "Stride", category: "Fashion", price: 1799, mrp: 2999, stock: 35, rating: 4.3, numReviews: 86, featured: true, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900" },
  { name: "Minimal Ceramic Table Lamp", brand: "CasaForm", category: "Home & Kitchen", price: 1299, mrp: 1899, stock: 18, rating: 4.6, numReviews: 54, featured: true, image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900" },
  { name: "Daily Hydration Bottle", brand: "Hydra", category: "Sports", price: 599, mrp: 899, stock: 60, rating: 4.2, numReviews: 210, image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=900" },
  { name: "Classic Analog Wrist Watch", brand: "Northline", category: "Accessories", price: 2199, mrp: 3499, stock: 12, rating: 4.4, numReviews: 72, featured: true, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900" },
  { name: "Skincare Essentials Set", brand: "PureKind", category: "Beauty", price: 899, mrp: 1299, stock: 40, rating: 4.1, numReviews: 39, image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=900" },
  { name: "The Art of Everyday Living", brand: "Paper & Co.", category: "Books", price: 499, mrp: 699, stock: 28, rating: 4.7, numReviews: 91, image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=900" },
  { name: "Compact Bluetooth Speaker", brand: "SoundPeak", category: "Electronics", price: 1499, mrp: 2299, stock: 31, rating: 4.3, numReviews: 112, image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=900" },
  { name: "Cotton Everyday Tote", brand: "CarryWell", category: "Fashion", price: 399, mrp: 599, stock: 50, rating: 4.0, numReviews: 23, image: "https://images.unsplash.com/photo-1590870485478-1e5c6a9c3a6d?w=900" },
  { name: "Non-stick Cookware Set", brand: "HomeCraft", category: "Home & Kitchen", price: 2699, mrp: 3999, stock: 14, rating: 4.5, numReviews: 66, image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=900" },
  { name: "Training Yoga Mat", brand: "FlexFit", category: "Sports", price: 799, mrp: 1199, stock: 45, rating: 4.2, numReviews: 48, image: "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=900" },
  { name: "Building Blocks Play Set", brand: "PlayWorks", category: "Toys & Games", price: 999, mrp: 1499, stock: 22, rating: 4.6, numReviews: 37, image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=900" }
];

try {
  await connectDB();
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@markethub.local").toLowerCase();
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: process.env.ADMIN_NAME || "MarketHub Admin",
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD || "ChangeMe123!",
      role: "admin"
    });
  } else if (admin.role !== "admin") {
    admin.role = "admin";
    await admin.save();
  }

  for (const product of products) {
    const completeProduct = {
      description: `${product.name} from ${product.brand}. A useful everyday pick, selected for quality, value and dependable everyday use.`,
      ...product
    };
    await Product.updateOne({ name: product.name }, { $setOnInsert: completeProduct }, { upsert: true });
  }
  console.log(`Seed complete. Admin: ${adminEmail}. Demo products available: ${products.length}.`);
} catch (error) {
  console.error("Seed failed:", error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
