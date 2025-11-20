import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    complaintId: { type: mongoose.Schema.Types.ObjectId, ref: "Complaint", default: null },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    
    imageUrl: String,
    name: String,
    sku: String,

    // Quantity & Pricing
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }, // snapshot price

    // Variant
    variantId: { type: mongoose.Schema.Types.ObjectId, default: null },
    variantName: String,
    variantSku: String,
    variantPrice: Number,
});

const orderSchema = new mongoose.Schema(
{
    // USER
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    // PRODUCTS
    products: [productSchema],

    // AMOUNT BREAKDOWN
    promoCode: { type: String, default: null },

    amountBreakDown: {
        subtotal: Number,
        shipping: Number,
        tax: Number,
        discount: Number,
        total: Number,
    },

    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },

    // SHIPPING ADDRESS
    address: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        email: String,

        label: String,
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, default: "India" },
        pincode: { type: String, required: true },
    },

    // PAYMENT INFO
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
        method: String, // card / upi / netbanking / cod
    },

    // SHIPROCKET
    shipping: {
        shiprocketOrderId: String,
        shipmentId: String,
        awb: String,                      // main tracking ID
        courierName: String,
        
        pickupScheduled: { type: Boolean, default: false },
        pickupDate: Date,

        labelUrl: String,
        manifestUrl: String,
        invoiceUrl: String,
        trackingUrl: String,
        
        serviceType: String, // surface / express
        estimatedDelivery: Date,
        deliveredOn: Date,

        returnAwb: String,
    },

    // ORDER STATUS
    status: {
        type: String,
        enum: [
            "pending",           // order placed but not confirmed
            "confirmed",         // admin confirmed
            "ready_to_ship",     // AWB generated
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
        index: true,
    },

    // TIMELINE
    placedOn: { type: Date, default: Date.now },
    confirmedOn: Date,
    shippedOn: Date,
    deliveredOn: Date,
    cancelledOn: Date,

    // LOGS
    orderHistory: [
        {
            status: String,
            date: { type: Date, default: Date.now },
            note: String,
            updatedBy: { type: String, default: "system" }, // admin / user / system
        },
    ],

    notes: String,

    // RETURNS
    isReturnEligible: { type: Boolean, default: true },

    refund: {
        status: {
            type: String,
            enum: ["not_initiated", "processing", "completed"],
            default: "not_initiated",
        },
        amount: Number,
        initiatedOn: Date,
        completedOn: Date,
    },
},
{ timestamps: true }
);

// Indexes for faster dashboard queries
orderSchema.index({ status: 1 });
orderSchema.index({ "address.phone": 1 });
orderSchema.index({ createdAt: -1 });

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
