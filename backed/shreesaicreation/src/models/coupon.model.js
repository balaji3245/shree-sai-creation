import mongoose from 'mongoose';
import { DISCOUNT_TYPES } from '../constants/orderStatus.constants.js';

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true, uppercase: true },
    description: { type: String, default: '' },
    discountType: {
      type: String,
      enum: DISCOUNT_TYPES,
      required: true,
    },
    discountValue: { type: Number, required: true, min: 0 },
    maxDiscountInPaise: { type: Number, default: null },
    minCartInPaise: { type: Number, default: 0 },
    startDate: { type: Date, default: null },
    expiryDate: { type: Date, default: null },
    usageLimit: { type: Number, default: null },
    usageCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 1 },
    firstOrderOnly: { type: Boolean, default: false },
    freeShipping: { type: Boolean, default: false },
    productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    categoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    disabled: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

couponSchema.index({ code: 1 }, { unique: true });
couponSchema.index({ disabled: 1, startDate: 1, expiryDate: 1 });

const CouponModel = mongoose.model('Coupon', couponSchema);
export default CouponModel;
