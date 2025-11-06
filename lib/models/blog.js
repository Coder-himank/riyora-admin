import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    author: { type: String },
    description: String,
    seoTitle: String,
    seoDescription: String,
    tags: [String],
    imageUrl: String,
    content: { type: String, required: true },
    published: { type: Boolean, default: false },
    // visible : {type:Boolean, default:false}
  },
  { timestamps: true }
);

export default mongoose.models.Blog || mongoose.model("Blog", BlogSchema);
