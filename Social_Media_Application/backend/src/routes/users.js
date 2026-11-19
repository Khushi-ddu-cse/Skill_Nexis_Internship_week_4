import { Router } from "express";
import User from "../models/User.js";
import Post from "../models/Post.js";

const router = Router();

router.get("/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    const posts = await Post.find({ author: user._id }).sort({ createdAt: -1 })
      .populate("author", "name username avatar")
      .populate("likes", "name username")
      .populate("comments.author", "name username avatar");
    res.json({ user: user.toSafeObject(), posts });
  } catch (error) { next(error); }
});

export default router;
