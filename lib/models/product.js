import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    imageUrl: { type: String, default: "/images/person1.jpg" },
    name: String,
    rating: {
        type: Number,
        required: true,
        min: 0,
        max: 5,
    },
    comment: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a product name'],
            trim: true,
        },

        description: {
            type: String,
            required: [true, 'Please provide a product description'],
        },
        ingredients: {
            type: [String],
            required: [true, 'Please list product ingredients'],
        },
        suitableFor: [{ type: String, required: true }],
        relatedBlogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blog' }],
        mrp: {
            type: Number,
            required: [true, 'Please set a price'],
        },
        sellingPrice: {
            type: Number,
            required: [true, 'Please set a price'],
        },
        stock: {
            type: Number,
            required: true,
            min: 0,
        },

        category: [{ type: String, required: true }],
        imageUrl: [{ type: String }],
        discountPercentage: { type: Number, min: 0, max: 100 },
        promotionCode: [{ type: String }],
        tags: [{ type: String }],
        quantity: { type: String, required: true, default: "100 ml" }, // e.g., "100ml", "200ml"

        variants: [
            {
                product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
                name: String,
                price: Number,
                stock: Number,
                imageUrl: String,
                quantity: String
            },
        ],

        details: {
            brand: {
                type: String,
                required: true,
                trim: true
            },
            type: {
                type: String, // e.g., "Coconut Oil", "Onion Oil"
                required: true
            },

            container_material: String, // e.g., "Plastic", "Glass"
            container_type: String, // e.g., "Bottle", "Jar"
            container_dispenser: String, // e.g., "Pump", "Dropper", "Flip-cap"
            container_size: String, // e.g., "100ml", "250ml"
            ingredients: {
                type: [String], // Array of ingredient names
                required: true
            },
            keyIngredients: {
                type: [String], // Highlighted ingredients
                default: []
            },
            freeFrom: {
                type: [String], // e.g., ["Parabens", "Silicones"]
                default: []
            },
            hairType: {
                type: [String], // e.g., ["Dry", "Oily", "Curly"]
                default: []
            },
            scalpType: {
                type: [String], // e.g., ["Sensitive", "Dandruff-prone"]
                default: []
            },

            usage_frequency: String, // e.g., "Twice a week"
            rinseRequired: Boolean,

            benefits: {
                type: [String], // e.g., ["Hair Growth", "Dandruff Control"]
                default: []
            },
            certifications: {
                type: [String], // e.g., ["Ayurvedic", "Dermatologist Tested"]
                default: []
            },
            shelfLife: String, // e.g., "24 months"
            storageInstructions: String,
            patchTestRecommended: { type: Boolean, default: true },
            availableSizes: {
                type: [String], // e.g., ["100ml", "200ml"]
                default: ["100ml"]
            }
        },

        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        numReviews: {
            type: Number,
            default: 0,
        },
        reviews: [reviewSchema],

        lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        lastModifiedAt: { type: Date },
    },
    {
        timestamps: true,
    }
);
export default mongoose.models.Product || mongoose.model('Product', productSchema);
