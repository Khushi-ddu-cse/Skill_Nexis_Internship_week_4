import { Router } from "express";
import mongoose from "mongoose";
import Post from "../models/Post.js";
import { protect } from "../middleware/auth.js";

const router = Router();
const authorFields = "name username avatar";

router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(20, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));
    const [posts, total] = await Promise.all([
      Post.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)
        .populate("author", authorFields)
        .populate("likes", "name username")
        .populate("comments.author", authorFields),
      Post.countDocuments()
    ]);
    res.json({ posts, page, pages: Math.ceil(total / limit), total });
  } catch (error) { next(error); }
});

router.post("/", protect, async (req, res, next) => {
  try {
    const text = typeof req.body.text === "string" ? req.body.text.trim() : "";
    const imageUrl = typeof req.body.imageUrl === "string" ? req.body.imageUrl.trim() : "";
    if (!text && !imageUrl) return res.status(400).json({ message: "Write something or add an image URL." });
    if (text.length > 2000) return res.status(400).json({ message: "Post text cannot exceed 2,000 characters." });
    if (imageUrl && !/^https?:\/\/.+/i.test(imageUrl)) return res.status(400).json({ message: "Image URL must start with http:// or https://." });

    const post = await Post.create({ author: req.user._id, text, imageUrl });
    await post.populate("author", authorFields);
    res.status(201).json({ post });
  } catch (error) { next(error); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", authorFields)
      .populate("likes", "name username")
      .populate("comments.author", authorFields);
    if (!post) return res.status(404).json({ message: "Post not found." });
    res.json({ post });
  } catch (error) { next(error); }
});

router.put("/:id", protect, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });
    if (String(post.author) !== String(req.user._id)) return res.status(403).json({ message: "You can only edit your own posts." });

    const text = typeof req.body.text === "string" ? req.body.text.trim() : "";
    const imageUrl = typeof req.body.imageUrl === "string" ? req.body.imageUrl.trim() : "";
    if (!text && !imageUrl) return res.status(400).json({ message: "A post must contain text or an image URL." });
    if (text.length > 2000) return res.status(400).json({ message: "Post text cannot exceed 2,000 characters." });
    if (imageUrl && !/^https?:\/\/.+/i.test(imageUrl)) return res.status(400).json({ message: "Image URL must start with http:// or https://." });

    post.text = text;
    post.imageUrl = imageUrl;
    await post.save();
    await post.populate("author", authorFields);
    res.json({ post });
  } catch (error) { next(error); }
});

router.delete("/:id", protect, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });
    if (String(post.author) !== String(req.user._id)) return res.status(403).json({ message: "You can only delete your own posts." });
    await post.deleteOne();
    res.json({ message: "Post deleted." });
  } catch (error) { next(error); }
});

router.post("/:id/like", protect, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });
    const userId = String(req.user._id);
    const liked = post.likes.some(id => String(id) === userId);
    if (liked) post.likes.pull(req.user._id);
    else post.likes.addToSet(req.user._id);
    await post.save();
    res.json({ liked: !liked, likes: post.likes });
  } catch (error) { next(error); }
});

router.post("/:id/comments", protect, async (req, res, next) => {
  try {
    const text = typeof req.body.text === "string" ? req.body.text.trim() : "";
    if (!text) return res.status(400).json({ message: "Comment cannot be empty." });
    if (text.length > 500) return res.status(400).json({ message: "Comment cannot exceed 500 characters." });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });
    post.comments.push({ author: req.user._id, text });
    await post.save();
    await post.populate("comments.author", authorFields);
    res.status(201).json({ comments: post.comments });
  } catch (error) { next(error); }
});

router.delete("/:id/comments/:commentId", protect, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });
    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found." });
    if (String(comment.author) !== String(req.user._id) && String(post.author) !== String(req.user._id)) {
      return res.status(403).json({ message: "You cannot delete this comment." });
    }
    comment.deleteOne();
    await post.save();
    res.json({ comments: post.comments });
  } catch (error) { next(error); }
});

export default router;
