import mongoose from 'mongoose';

export const imageAssetSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    key: { type: String, default: null },
    alt: { type: String, default: '' },
    sortOrder: { type: Number, default: 0 },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: false }
);

export const videoAssetSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    thumbnail: { type: String, default: null },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: false }
);

export const seoSchema = new mongoose.Schema(
  {
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    seoKeywords: { type: [String], default: [] },
  },
  { _id: false }
);
