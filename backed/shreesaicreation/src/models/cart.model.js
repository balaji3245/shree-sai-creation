import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    // Snapshot for display; pricing revalidated on summary/checkout
    productName: { type: String, default: '' },
    variantTitle: { type: String, default: '' },
    sku: { type: String, default: '' },
    unitPriceInPaise: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, default: null },
  },
  { _id: true, timestamps: true }
);

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    guestToken: { type: String, default: null, index: true },
    items: { type: [cartItemSchema], default: [] },
    couponCode: { type: String, default: null },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

cartSchema.index({ userId: 1 }, { unique: true, sparse: true });
cartSchema.index({ guestToken: 1 }, { unique: true, sparse: true });

const CartModel = mongoose.model('Cart', cartSchema);
export default CartModel;
