import mongoose from "mongoose";

const predefinedSchema = new mongoose.Schema({
  chooseUs: [{ text: String, imageUrl: String }],
  suitableFor: [{ text: String, imageUrl: String }],
  howToApply: [{ step: Number, title: String, description: String, imageUrl: String }],
  highlights: [{ title: String, content: [String] }]
});

export default mongoose.models.Predefined || mongoose.model("Predefined", predefinedSchema);
