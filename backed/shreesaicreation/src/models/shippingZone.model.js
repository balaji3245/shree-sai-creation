import mongoose from 'mongoose';

const shippingMethodSchema = new mongoose.Schema(
  {
    code: { type: String, required: true },
    name: { type: String, required: true },
    amountInPaise: { type: Number, required: true, min: 0 },
    estimatedDaysMin: { type: Number, default: 3 },
    estimatedDaysMax: { type: Number, default: 7 },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const shippingZoneSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    // Match by state name/code and/or pin prefixes (e.g. "40", "400")
    states: { type: [String], default: [] },
    pinPrefixes: { type: [String], default: [] },
    methods: { type: [shippingMethodSchema], default: [] },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

shippingZoneSchema.index({ isActive: 1, isDeleted: 1, sortOrder: 1 });

const ShippingZoneModel = mongoose.model('ShippingZone', shippingZoneSchema);
export default ShippingZoneModel;
