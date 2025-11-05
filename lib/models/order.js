// models/Order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    products: [
        {
            complaintId: { type: mongoose.Schema.Types.ObjectId, ref: "Complaint", default: null },
            productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
            imageUrl: { type: String },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true }, // snapshot price
            name: { type: String },
            sku: { type: String },

            // Variant details
            variantId: { type: mongoose.Schema.Types.ObjectId },
            variantName: { type: String },
            variantSku: { type: String },
            variantPrice: { type: Number },
        },
    ],

    promoCode: { type: String, default: null },

    amountBreakDown: {
        subtotal: { type: Number },
        shipping: { type: Number },
        tax: { type: Number },
        total: { type: Number },
        discount: { type: Number },
    },

    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },

    // Shipping Address
    address: {
        name: String,
        phone: String,
        email: String,
        label: String,
        address: String,
        city: String,
        state: String,
        country: { type: String, default: "India" },
        pincode: String,
    },

    // Payment
    razorpayOrderId: { type: String, required: true, unique: true },
    paymentId: String,
    signature: String,

    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed", "COD", "refunded"],
        default: "pending",
    },

    paymentDetails: {
        transactionId: String,
        paymentGateway: String,
        paymentDate: Date,
        method: { type: String }, // card / UPI / COD / netbanking
    },

    // ---------------- SHIPROCKET INTEGRATION ----------------
    shipping: {
        shiprocketOrderId: { type: String },   // Shiprocket order ID
        shipmentId: { type: String },         // Shipment ID
        awb: { type: String },                // Tracking / AWB ID
        courierName: { type: String },        // Courier name (Delhivery, Bluedart etc.)
        pickupScheduled: { type: Boolean, default: false },
        pickupDate: { type: Date },
        labelUrl: { type: String },           // Shipping label PDF
        manifestUrl: { type: String },
        invoiceUrl: { type: String },
        trackingUrl: { type: String },
        serviceType: { type: String },        // surface / express
        estimatedDelivery: { type: Date },
        deliveredOn: { type: Date },
        returnAwb: { type: String },
    },

    // Order Status
    status: {
        type: String,
        enum: [
            "pending",
            "confirmed",
            "ready_to_ship",
            "shipped",
            "in_transit",
            "out_for_delivery",
            "delivered",
            "cancelled",
            "returned",
            "refund_processing",
            "payment_failed",
        ],
        default: "pending",
    },

    // Timeline tracking
    placedOn: { type: Date, default: Date.now },
    confirmedOn: Date,
    shippedOn: Date,
    deliveredOn: Date,
    cancelledOn: Date,

    // Logs
    orderHistory: [
        {
            status: String,
            date: { type: Date, default: Date.now },
            note: String,
            updatedBy: String, // admin / user / system
        },
    ],

    notes: { type: String },

    isReturnEligible: { type: Boolean, default: true },

    // Refund Info
    refund: {
        status: { type: String, enum: ["not_initiated", "processing", "completed"], default: "not_initiated" },
        amount: Number,
        initiatedOn: Date,
        completedOn: Date,
    },

    updatedAt: { type: Date, default: Date.now },
},
{ timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
