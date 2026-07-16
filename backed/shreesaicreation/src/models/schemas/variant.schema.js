import mongoose from 'mongoose';
import { imageAssetSchema } from './common.schema.js';

export const variantDimensionsSchema = new mongoose.Schema(
  {
    heightCm: Number,
    widthCm: Number,
    depthCm: Number,
    diameterCm: Number,
    canopyDiameterCm: Number,
    minDropCm: Number,
    maxDropCm: Number,
    chainLengthCm: Number,
    weightKg: Number,
  },
  { _id: false }
);

export const variantPackageSchema = new mongoose.Schema(
  {
    packageLengthCm: Number,
    packageWidthCm: Number,
    packageHeightCm: Number,
    packageWeightKg: Number,
    fragile: { type: Boolean, default: true },
    shipsSeparately: { type: Boolean, default: false },
  },
  { _id: false }
);

export const variantSchema = new mongoose.Schema(
  {
    title: { type: String, default: 'Default' },
    sku: { type: String, required: true, trim: true },
    barcode: { type: String, default: null },
    options: { type: Map, of: String, default: {} },
    priceInPaise: { type: Number, required: true, min: 0 },
    compareAtPriceInPaise: { type: Number, default: null, min: 0 },
    costPriceInPaise: { type: Number, default: null, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    trackInventory: { type: Boolean, default: true },
    allowBackorder: { type: Boolean, default: false },
    lowStockThreshold: { type: Number, default: 2, min: 0 },
    images: { type: [imageAssetSchema], default: [] },
    dimensions: { type: variantDimensionsSchema, default: () => ({}) },
    package: { type: variantPackageSchema, default: () => ({}) },
    weightKg: { type: Number, default: null },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    position: { type: Number, default: 0 },
  },
  { _id: true, timestamps: true }
);
