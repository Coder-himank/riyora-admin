import mongoose from "mongoose";
const sectionSchema = new mongoose.Schema({
    heading: String,
    image: String,
    text: String
});

const blogSchema = new mongoose.Schema({
    imgUrl: { type: String, required: true },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },

    sections: [sectionSchema],
    author: {
        type: String,
        required: true,
        trim: true,
    },
    visible : {type:Boolean, default:true},
    tags: {
        type: [String],
        default: [],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});
export default mongoose.models.Blog || mongoose.model("Blog", blogSchema);
