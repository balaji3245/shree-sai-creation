import mongoose from 'mongoose';

/** Tracks coupon redemptions per user/email for per-user limits */
const couponRedemptionSchema = new mongoose.Schema(
  {
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
      required: true,
      index: true,
    },
    code: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    email: { type: String, default: null, lowercase: true },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
  },
  { timestamps: true }
);

couponRedemptionSchema.index({ couponId: 1, userId: 1 });
couponRedemptionSchema.index({ couponId: 1, email: 1 });

const CouponRedemptionModel = mongoose.model(
  'CouponRedemption',
  couponRedemptionSchema
);
export default CouponRedemptionModel;
