// server/models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const AddressSchema = new mongoose.Schema({
  label: { type: String, required: true, default: "home" },
  address: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  pincode: { type: String, required: true }
});

const CartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity_demanded: { type: Number, required: true, min: 1 },
  addedAt: { type: Date, default: Date.now }
});

const WishlistItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  addedAt: { type: Date, default: Date.now }
});

const OrderHistorySchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  status: { type: String, enum: ["pending", "shipped", "delivered", "cancelled"], required: true },
  totalAmount: { type: Number, required: true },
  placedOn: { type: Date, default: Date.now }
});

const PreferencesSchema = new mongoose.Schema({
  receiveMarketingEmails: { type: Boolean, default: true },
  receivePushNotifications: { type: Boolean, default: true }
});

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    email: { type: String, unique: true, lowercase: true, trim: true , sparse : true},
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    verificationToken: { type: String },

    enrolled: { type: Boolean, default: false },

    // OTP-based login fields
    otp: { type: String, select: false }, // Store hashed OTP
    otpExpires: { type: Date },

    role: { type: String, enum: ["customer", "admin", "guest"], default: "customer" },

    addresses: [AddressSchema],
    cartData: [CartItemSchema],
    wishlistData: [WishlistItemSchema],
    orderHistory: [OrderHistorySchema],
    preferences: PreferencesSchema,

    failedLoginAttempts: { type: Number, default: 0 },
    accountLocked: { type: Boolean, default: false },
    referralCode: { type: String },
    loyaltyPoints: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Method to set OTP securely
UserSchema.methods.setOTP = async function (otp) {
  const salt = await bcrypt.genSalt(10);
  this.otp = await bcrypt.hash(otp.toString(), salt);
  this.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 min
};

// Method to verify OTP
UserSchema.methods.verifyOTP = async function (otp) {
  if (!this.otp || !this.otpExpires) return false;
  if (this.otpExpires < Date.now()) return false; // expired
  return bcrypt.compare(otp.toString(), this.otp);
};

export default mongoose.models.User || mongoose.model("User", UserSchema);
