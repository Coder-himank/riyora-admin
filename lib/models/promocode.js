import mongoose from 'mongoose';

const promocodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  },
  discount: {
    type: Number,
    required: true,
    min: 1,
    max: 100,
  },
  expiry: {
    type: Date,
    required: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
  usageLimit: {
    type: Number,
    default: 0, // 0 = unlimited
  },
  timesUsed: {
    type: Number,
    default: 0,
  },
  minimumOrderValue: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Promocode', promocodeSchema);
