import { Router } from "express";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();
const FREE_SHIPPING_THRESHOLD = 999;
const SHIPPING_FEE = 49;

function validateAddress(address = {}) {
  const required = ["fullName", "phone", "addressLine", "city", "state", "postalCode"];
  for (const key of required) if (!String(address[key] || "").trim()) return `${key} is required.`;
  if (!/^[6-9]\d{9}$/.test(String(address.phone).replace(/\s|-/g, ""))) return "Enter a valid 10-digit Indian mobile number.";
  if (!/^[1-9]\d{5}$/.test(String(address.postalCode))) return "Enter a valid 6-digit PIN code.";
  return null;
}

router.post("/", protect, async (req, res, next) => {
  const reserved = [];
  try {
    const { items, shippingAddress } = req.body;
    const addressError = validateAddress(shippingAddress);
    if (addressError) return res.status(400).json({ message: addressError });
    if (!Array.isArray(items) || !items.length || items.length > 30) {
      return res.status(400).json({ message: "Your cart is empty or contains too many items." });
    }
    const quantities = new Map();
    for (const item of items) {
      if (!mongoose.isValidObjectId(item.productId)) return res.status(400).json({ message: "Invalid product in cart." });
      const qty = Number(item.quantity);
      if (!Number.isInteger(qty) || qty < 1 || qty > 20) return res.status(400).json({ message: "Invalid item quantity." });
      quantities.set(String(item.productId), (quantities.get(String(item.productId)) || 0) + qty);
    }

    const orderItems = [];
    let subtotal = 0;
    for (const [productId, quantity] of quantities) {
      const product = await Product.findOneAndUpdate(
        { _id: productId, active: true, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { new: true }
      );
      if (!product) throw Object.assign(new Error("One or more products are unavailable or have insufficient stock. Refresh your cart and try again."), { statusCode: 409 });
      reserved.push({ productId, quantity });
      subtotal += product.price * quantity;
      orderItems.push({ product: product._id, name: product.name, image: product.image, price: product.price, quantity });
    }
    const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const order = await Order.create({
      user: req.user._id, items: orderItems, shippingAddress,
      subtotal, shippingFee, totalAmount: subtotal + shippingFee,
      paymentMethod: "COD"
    });
    res.status(201).json({ order, message: "Order placed successfully." });
  } catch (error) {
    // Restore any stock already reserved if a later item or order save fails.
    await Promise.all(reserved.map(({ productId, quantity }) =>
      Product.updateOne({ _id: productId }, { $inc: { stock: quantity } }).catch(() => null)
    ));
    next(error);
  }
});

router.get("/my", protect, async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) { next(error); }
});

router.get("/", protect, adminOnly, async (req, res, next) => {
  try {
    const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 }).limit(200);
    res.json({ orders });
  } catch (error) { next(error); }
});

router.patch("/:id/status", protect, adminOnly, async (req, res, next) => {
  try {
    const allowed = ["Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"];
    if (!allowed.includes(req.body.status)) return res.status(400).json({ message: "Invalid order status." });
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found." });
    if (order.status === "Cancelled") return res.status(400).json({ message: "Cancelled orders cannot be changed." });
    if (req.body.status === "Cancelled") {
      await Promise.all(order.items.map(item =>
        Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } })
      ));
    }
    order.status = req.body.status;
    await order.save();
    res.json({ order, message: "Order status updated." });
  } catch (error) { next(error); }
});

export default router;
