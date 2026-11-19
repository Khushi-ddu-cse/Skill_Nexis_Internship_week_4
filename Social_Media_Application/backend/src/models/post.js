import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true, trim: true, maxlength: 500 }
}, { timestamps: true });

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, trim: true, default: "", maxlength: 2000 },
  imageUrl: { type: String, trim: true, default: "" },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [commentSchema]
}, { timestamps: true });

postSchema.pre("validate", function () {
  if (!this.text?.trim() && !this.imageUrl?.trim()) {
    this.invalidate("text", "A post must contain text or an image URL.");
  }
});

export default mongoose.model("Post", postSchema);
