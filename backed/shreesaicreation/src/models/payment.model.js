import mongoose from 'mongoose';
import { PAYMENT_STATUSES } from '../constants/orderStatus.constants.js';

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    orderNumber: { type: String, required: true, index: true },
    amountInPaise: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: 'created',
    },
    razorpayOrderId: { type: String, default: null, index: true },
    razorpayPaymentId: { type: String, default: null, unique: true, sparse: true },
    razorpaySignature: { type: String, default: null },
    method: { type: String, default: null },
    webhookEventId: { type: String, default: null },
    refundId: { type: String, default: null },
    refundedAmountInPaise: { type: Number, default: 0 },
    raw: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

paymentSchema.index({ razorpayOrderId: 1, status: 1 });

const PaymentModel = mongoose.model('Payment', paymentSchema);
export default PaymentModel;
