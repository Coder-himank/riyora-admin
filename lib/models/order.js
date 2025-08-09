// models/Order.js
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    products: [
        {
            productId: { type: String, ref: 'Product' },
            imageUrl: { type: String },
            quantity: Number,
            price: Number,
        },
    ],
    promoCode: { type: String, default: null },
    amountBreakDown: {
        subtotal: Number,
        shipping: Number,
        tax: Number,
        total: Number,
        discount: Number
    },
    address: { label: String, city: String, state: String, country: String, pincode: String, address: String },
    amount: Number,
    currency: { type: String, default: 'INR' },
    paymentId: String,
    signature: String,
    razorpayOrderId: { type: String, required: true, unique: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'COD'], default: 'pending' },
    paymentDetails: {
        transactionId: String,
        paymentGateway: String,
        paymentDate: Date,
    },
    status: { type: String, enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'payment_failed'], default: 'pending' },

    // dates
    placedOn: { type: Date, default: Date.now },
    expectedDelivery: { type: Date, default: Date.now },
    deliveredOn: { type: Date, default: null },
    cancelledOn: { type: Date, default: null },

    orderHistroy: [
        {
            status: { type: String, enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'payment_failed'], default: 'pending' },
            date: { type: Date, default: Date.now },
            note: String,
        },
    ],


    updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Order || mongoose.model('Order', orderSchema);
