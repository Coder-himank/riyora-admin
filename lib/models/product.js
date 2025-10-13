// server/models/Product.js
import mongoose from "mongoose";

const reviewReplySchema = new mongoose.Schema({
imageUrl: { type: String, default: "/images/Riyora-Logo-Favicon.svg" },
    name: {type: String, default:"Riyora Organic"},
    comment: {type: String, required : true},
    images : {type:[String], default:[]},
    createdAt: { type: Date, default: Date.now },
  
})
const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  imageUrl: { type: String, default: "/images/person1.jpg" },
  name: {type: String, required : true},
  rating: { type: Number, required: true, min: 0, max: 5 },
  comment: {type : String, required : true},
  images : {type:[String], default:[]},
  createdAt: { type: Date, default: Date.now },
  replies : [reviewReplySchema],
});

const variantSchema = new mongoose.Schema(
  {
    name: { type: String, required:true }, // e.g. "Single Pack", "Double Pack"
    sku: { type: String, default: null },
    mrp: { type: Number, default: 0, required : true },
    price: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    imageUrl: { type: [String], required : true }, // gallery per variant
    quantity: { type: String, default: "100 ml"},
    weight: { type: String, default: "200g", required : true },
    dimensions: { type: String, required:true },
    visible: { type: Boolean, default: true },

    // added for variants
    discountPercentage: { type: Number, min: 0, max: 100, default: 0 },
    currency: { type: String, default: "INR" },
  },
  { _id: true } // keep _id for each variant
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Please provide a product name"], trim: true },
    slug: { type: String, required: true, unique: true },
    sku: { type: String, unique: true, sparse: true },
    description: { type: String, required: [true, "Please provide a product description"] },
    brand: { type: String, required: true, default: "Riyora Organic" },

    visible: { type: Boolean, default: true },

    mrp: { type: Number, required: [true, "Please set a MRP"] },
    price: { type: Number, required: [true, "Please set a price"] },
    currency: { type: String, default: "INR" },
    discountPercentage: { type: Number, min: 0, max: 100, default: 0 },
    stock: { type: Number, required: true, min: 0 },

    category: [{ type: String, required: true }],
    tags: [{ type: String }],
    keywords: [{ type: String }],

    imageUrl: [{ type: String, required: true }],
    quantity: { type: String, required: true, default: "100 ml" },

    variants: [variantSchema], // modified for variants

    details: {
      keyIngredients: [String],
      ingredients: [String],
      freeFrom: [String],
      benefits: [String],
      hairType: [String],
      itemForm: { type: String, default: "Oil" },
      itemVolume: { type: String, default: "100 ml" },
    },

    banners : [
      {
        position : {type : String, default : "bottom"},
        imageUrl : {type: String, required : true},
      }
    ],

    highlights: [
      {
        title: String,
        content: [String],
      },
    ],

    specifications: {
      brandName: { type: String, default: "Riyora Organic" },
      productName: String,
      countryOfOrigin: { type: String, default: "India" },
      weight: String,
      packOf: { type: String, default: "1" },
      genericName: String,
      productDimensions: String,
      shelfLife: String,
    },

    disclaimers: [String],

    suitableFor: [
      {
        imageUrl: String,
        text: String,
      },
    ],

    howToApply: [
      {
        step: Number,
        imageUrl: String,
        title: String,
        description: String,
      },
    ],

    chooseUs: [
      {
        imageUrl: String,
        text: String,
      },
    ],

    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    reviews: [reviewSchema],

    relatedBlogs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Blog" }],

    lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    lastModifiedAt: { type: Date, default:Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model("Product", productSchema);
