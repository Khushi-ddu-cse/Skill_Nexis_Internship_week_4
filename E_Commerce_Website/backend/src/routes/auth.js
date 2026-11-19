import { Router } from "express";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import { createToken } from "../utils/token.js";

const router = Router();

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role };
}

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }
    if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters." });
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ message: "Email is already registered." });
    const user = await User.create({ name: name.trim(), email: normalizedEmail, password });
    res.status(201).json({ user: publicUser(user), token: createToken(user._id) });
  } catch (error) { next(error); }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required." });
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Incorrect email or password." });
    }
    res.json({ user: publicUser(user), token: createToken(user._id) });
  } catch (error) { next(error); }
});

router.get("/me", protect, (req, res) => res.json({ user: publicUser(req.user) }));

export default router;
