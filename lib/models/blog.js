import mongoose from "mongoose";

const SectionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["text", "image", "list", "quote", "code"],
        default: "text",
        required: true
    },
    heading: { type: String, default: "" },
    content: { type: String, default: "" }, // for text, quote, code
    images: [
        {
            url: { type: String },
            alt: { type: String, default: "" }
        }
    ],
    listItems: [{ type: String }] // for list sections
}, { _id: false });

const BlogSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, default: "" },
        author: { type: String, default: "" },
        imageUrl: { type: String, default: "" },
        tags: [{ type: String }],
        sections: [SectionSchema],
        date: { type: Date, default: Date.now },
        visible : {type:Boolean, default:true}
    },
    { timestamps: true }
);

export default mongoose.models.Blog || mongoose.model("Blog", BlogSchema);
