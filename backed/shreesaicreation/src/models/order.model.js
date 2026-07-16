import mongoose from 'mongoose';
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
} from '../constants/orderStatus.constants.js';

const addressSnapshotSchema = new mongoose.Schema(
  {
    fullName: String,
    phone: String,
    email: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'IN' },
  },
  { _id: false }
);

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    variantId: { type: mongoose.Schema.Types.ObjectId, required: true },
    productName: { type: String, required: true },
    variantTitle: { type: String, default: 'Default' },
    sku: { type: String, required: true },
    hsnCode: { type: String, default: '9405' },
    quantity: { type: Number, required: true, min: 1 },
    unitPriceInPaise: { type: Number, required: true },
    taxPercent: { type: Number, default: 18 },
    lineTotalInPaise: { type: Number, required: true },
    imageUrl: { type: String, default: null },
  },
  { _id: true }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, enum: ORDER_STATUSES, required: true },
    at: { type: Date, default: Date.now },
    by: { type: String, default: 'system' },
    note: { type: String, default: '' },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    guestEmail: { type: String, default: null, lowercase: true },
    guestPhone: { type: String, default: null },
    items: { type: [orderItemSchema], required: true },
    shippingAddress: { type: addressSnapshotSchema, required: true },
    billingAddress: { type: addressSnapshotSchema, default: null },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: 'pending_payment',
      index: true,
    },
    statusHistory: { type: [statusHistorySchema], default: [] },
    subtotalInPaise: { type: Number, required: true },
    discountInPaise: { type: Number, default: 0 },
    shippingInPaise: { type: Number, default: 0 },
    taxInPaise: { type: Number, default: 0 },
    grandTotalInPaise: { type: Number, required: true },
    couponCode: { type: String, default: null },
    freeShippingApplied: { type: Boolean, default: false },
    currency: { type: String, default: 'INR' },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: 'created',
    },
    razorpayOrderId: { type: String, default: null, index: true },
    razorpayPaymentId: { type: String, default: null },
    inventoryDecremented: { type: Boolean, default: false },
    invoiceKey: { type: String, default: null },
    invoiceUrl: { type: String, default: null },
    cancelReason: { type: String, default: null },
    adminNotes: { type: String, default: '' },
    trackingNumber: { type: String, default: null },
    trackingUrl: { type: String, default: null },
    carrier: { type: String, default: null },
    paidAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
  },
  { timestamps: true }
);

orderSchema.index({ createdAt: -1 });
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ guestEmail: 1, orderNumber: 1 });

const OrderModel = mongoose.model('Order', orderSchema);
export default OrderModel;
