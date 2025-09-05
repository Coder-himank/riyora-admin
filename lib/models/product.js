import mongoose from "mongoose";

// =================== Review Schema ===================
const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  imageUrl: { type: String, default: "/images/person1.jpg" },
  name: String,
  rating: { type: Number, required: true, min: 0, max: 5 },
  comment: String,
  createdAt: { type: Date, default: Date.now },
});

// =================== Product Schema ===================
const productSchema = new mongoose.Schema(
  {
    // ✅ Core Product Info
    name: { type: String, required: [true, "Please provide a product name"], trim: true },
    slug: { type: String, required: true, unique: true }, // SEO-friendly URL
    sku: { type: String, unique: true }, // Stock Keeping Unit / Product Code
    description: { type: String, required: [true, "Please provide a product description"] },
    brand: { type: String, required: true, default: "Riyora Organic" },

    visible : {type:Boolean, default:true},

    // ✅ Pricing & Stock
    mrp: { type: Number, required: [true, "Please set a MRP"] },
    price: { type: Number, required: [true, "Please set a price"] },
    currency: { type: String, default: "INR" },
    discountPercentage: { type: Number, min: 0, max: 100, default: 0 },
    stock: { type: Number, required: true, min: 0 },

    // ✅ Categorization
    category: [{ type: String, required: true }],
    tags: [{ type: String }],
    keywords: [{ type: String }],

    // ✅ Media
    imageUrl: [{ type: String, required: true }], // product gallery
    quantity: { type: String, required: true, default: "100 ml" },

    // ✅ Variants
    variants: [
      {
        product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String,
        mrp:Number,
        price: Number,
        stock: Number,
        imageUrl: String,
        quantity: String,
      },
    ],

    // ✅ Details Section
    details: {
      keyIngredients: [String],
      ingredients: [String],
      freeFrom: [String], // e.g., ["Paraben Free", "Cruelty Free"]
      benefits: [String],
      hairType: [String],
      itemForm: { type: String, default: "Oil" },
      itemVolume: { type: String, default: "100 ml" },
    },

    // ✅ Highlights Section
    highlights: [
      {
        title: String, // e.g. "Key Ingredients"
        content: [String], // ["Aloe Vera", "Coconut Oil"]
      },
    ],

    // ✅ Specifications Section
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

    // ✅ Disclaimer Section
    disclaimers: [String],

    // ✅ Suitable For Section
    suitableFor: [
      {
        imageUrl: String,
        text: String,
      },
    ],

    // ✅ How to Apply Section
    howToApply: [
      {
        step: Number,
        imageUrl: String,
        title: String,
        description: String,
      },
    ],

    // ✅ Why Choose Us Section
    chooseUs: [
      {
        imageUrl: String,
        text: String,
      },
    ],

    // ✅ Reviews & Ratings
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    reviews: [reviewSchema],

    // ✅ Relations
    relatedBlogs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Blog" }],

    // ✅ Admin Tracking
    lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    lastModifiedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model("Product", productSchema);
