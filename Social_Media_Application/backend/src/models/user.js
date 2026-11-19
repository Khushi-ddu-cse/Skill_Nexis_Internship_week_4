import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true, minlength: 3, maxlength: 24 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8, select: false },
  bio: { type: String, default: "", maxlength: 180 },
  avatar: { type: String, default: "" }
}, { timestamps: true });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function () {
  return {
    _id: this._id,
    name: this.name,
    username: this.username,
    email: this.email,
    bio: this.bio,
    avatar: this.avatar,
    createdAt: this.createdAt
  };
};

export default mongoose.model("User", userSchema);
