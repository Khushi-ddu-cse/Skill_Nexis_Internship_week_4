import { Router } from "express";
import User from "../models/User.js";
import { createToken } from "../utils/token.js";
import { protect } from "../middleware/auth.js";

const router = Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernamePattern = /^[a-zA-Z0-9_]+$/;

router.post("/register", async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body;
    if (!name?.trim() || !username?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: "Please complete all required fields." });
    }
    if (!emailPattern.test(email)) return res.status(400).json({ message: "Enter a valid email address." });
    if (!usernamePattern.test(username) || username.length < 3 || username.length > 24) {
      return res.status(400).json({ message: "Username must be 3–24 characters and use only letters, numbers or underscores." });
    }
    if (password.length < 8) return res.status(400).json({ message: "Password must contain at least 8 characters." });

    const user = await User.create({ name: name.trim(), username: username.toLowerCase().trim(), email: email.toLowerCase().trim(), password });
    res.status(201).json({ token: createToken(user._id), user: user.toSafeObject() });
  } catch (error) { next(error); }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required." });
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Incorrect email or password." });
    }
    res.json({ token: createToken(user._id), user: user.toSafeObject() });
  } catch (error) { next(error); }
});

router.get("/me", protect, (req, res) => res.json({ user: req.user.toSafeObject() }));

export default router;
