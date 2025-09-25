// models/Product.js
import mongoose from "mongoose";

const IngredientSchema = new mongoose.Schema({
  name: String,
  image: String, // predefined image URL
  notes: [String],
});

const ProductInfoSchema = new mongoose.Schema({
    productId : String,
  title: { type: String, required: true },
  description: String,
  imageUrl: [String], // product gallery
  ingredients: [IngredientSchema],
  benefits: {
    heading: String,
    list: [String],
  },
  suitability: [String], // who it's suitable for
});

export default mongoose.models.ProductInfo ||
  mongoose.model("ProductInfo", ProductInfoSchema);
