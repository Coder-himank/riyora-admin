import mongoose from 'mongoose';
import { unique } from 'next/dist/build/utils';

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

  validFrom: {
    type: Date,
    required: true,
  },
  expiry: {
    type: Date,
    required: true,
  },

  applicableProducts: {
    type: [{type:String, unique:true, trim:true}], // Array of product IDs or names
    default: [],
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

export default mongoose.models.Promocode || mongoose.model('Promocode', promocodeSchema);
