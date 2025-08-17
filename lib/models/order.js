// models/Order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

        products: [
            {
                productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
                imageUrl: { type: String },
                quantity: { type: Number, required: true },
                price: { type: Number, required: true },
                name: { type: String }, // keep snapshot of product name
                sku: { type: String },  // stock keeping unit
            },
        ],

        promoCode: { type: String, default: null },
        amountBreakDown: {
            subtotal: Number,
            shipping: Number,
            tax: Number,
            total: Number,
            discount: Number,
        },
        amount: { type: Number, required: true },
        currency: { type: String, default: "INR" },

        address: {
            name: String,
            phone: String,
            email: String,
            label: String,
            city: String,
            state: String,
            country: String,
            pincode: String,
            address: String,
        },

        // Payment details
        paymentId: String,
        signature: String,
        razorpayOrderId: { type: String, required: true, unique: true },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed", "COD", "refunded"],
            default: "pending",
        },
        paymentDetails: {
            transactionId: String,
            paymentGateway: String,
            paymentDate: Date,
            method: String, // card, UPI, COD, netbanking
        },

        // Shipment / Courier Info
        courier: {
            courier_name: { type: String, default: null },         // e.g. Delhivery, Bluedart
            courierId: { type: String },    // AWB/tracking ID
            serviceType: { type: String },  // express / standard / surface
            pickupScheduled: { type: Boolean, default: false },
            pickupDate: { type: Date },
            labelUrl: { type: String },     // PDF link from courier API
            trackingUrl: { type: String },  // direct tracking link
            estimatedDelivery: { type: Date },
            deliveredOn: { type: Date, default: null },
            returnTrackingId: { type: String }, // for returns
        },

        // Order status workflow
        status: {
            type: String,
            enum: [
                "pending",     // placed, awaiting confirmation
                "confirmed",   // confirmed by seller
                "ready to ship",
                "shipped",
                "out_for_delivery",
                "delivered",
                "cancelled",
                "returned",
                "payment_failed",
            ],
            default: "pending",
        },

        // Timeline tracking
        placedOn: { type: Date, default: Date.now },
        confirmedOn: { type: Date },
        shippedOn: { type: Date },
        deliveredOn: { type: Date },
        cancelledOn: { type: Date },

        // History log for audit trail
        orderHistory: [
            {
                status: String,
                date: { type: Date, default: Date.now },
                note: String,
                updatedBy: { type: String }, // admin/user/system
            },
        ],

        // Optional features
        notes: { type: String },
        isReturnEligible: { type: Boolean, default: true },
        refund: {
            status: { type: String, enum: ["not_initiated", "processing", "completed"], default: "not_initiated" },
            amount: { type: Number },
            initiatedOn: { type: Date },
            completedOn: { type: Date },
        },

        updatedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
