import mongoose from 'mongoose';

const storeSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'default', unique: true },
    storeName: { type: String, default: 'Shree Sai Creation' },
    tagline: { type: String, default: 'Premium Luxury Lighting' },
    supportEmail: { type: String, default: 'support@shreesaicreation.com' },
    supportPhone: { type: String, default: '' },
    whatsappNumber: { type: String, default: '' },
    gstin: { type: String, default: '' },
    stateCode: { type: String, default: '' },
    address: {
      line1: { type: String, default: '' },
      line2: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
      country: { type: String, default: 'IN' },
    },
    currency: { type: String, default: 'INR' },
    freeShippingThresholdInPaise: { type: Number, default: 0 },
    flatShippingFeeInPaise: { type: Number, default: 0 },
    social: {
      instagram: { type: String, default: '' },
      facebook: { type: String, default: '' },
      youtube: { type: String, default: '' },
    },
    logoUrl: { type: String, default: null },
  },
  { timestamps: true }
);

const StoreSettingsModel = mongoose.model('StoreSettings', storeSettingsSchema);
export default StoreSettingsModel;
