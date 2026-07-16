import mongoose from 'mongoose';
import {
  PRODUCT_STATUS,
  PRODUCT_VISIBILITY,
  PRODUCT_TYPES,
  PRODUCT_STYLES,
  MOUNT_TYPES,
  ROOM_TYPES,
  BULB_TYPES,
  COLOR_TEMPERATURES,
  INSTALLATION_TYPES,
} from '../constants/lighting.constants.js';
import { imageAssetSchema, videoAssetSchema, seoSchema } from './schemas/common.schema.js';
import { variantSchema } from './schemas/variant.schema.js';

const optionDefinitionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    values: { type: [String], default: [] },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    hsnCode: { type: String, default: '9405' },
    brand: { type: String, default: 'Shree Sai Creation' },
    categoryIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    collectionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Collection',
      },
    ],
    status: {
      type: String,
      enum: PRODUCT_STATUS,
      default: 'draft',
    },
    visibility: {
      type: String,
      enum: PRODUCT_VISIBILITY,
      default: 'public',
    },
    shortDescription: { type: String, default: '' },
    description: { type: String, default: '' },
    highlights: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    taxPercent: { type: Number, default: 18, min: 0, max: 100 },
    isTaxInclusive: { type: Boolean, default: true },
    optionDefinitions: { type: [optionDefinitionSchema], default: [] },
    hasOnlyDefaultVariant: { type: Boolean, default: true },
    variants: {
      type: [variantSchema],
      validate: {
        validator(v) {
          return Array.isArray(v) && v.length >= 1;
        },
        message: 'Product must have at least one variant',
      },
    },
    // Denormalized for PLP sorting/cards
    fromPriceInPaise: { type: Number, default: 0 },
    totalStock: { type: Number, default: 0 },

    productType: {
      type: String,
      enum: PRODUCT_TYPES,
      default: 'chandelier',
    },
    style: [{ type: String, enum: PRODUCT_STYLES }],
    mountType: { type: String, enum: MOUNT_TYPES, default: 'ceiling' },
    roomTypes: [{ type: String, enum: ROOM_TYPES }],
    materials: { type: [String], default: [] },
    finish: { type: [String], default: [] },
    primaryColor: { type: String, default: '' },
    bulbType: { type: String, enum: BULB_TYPES, default: 'e27' },
    bulbIncluded: { type: Boolean, default: false },
    numberOfLights: { type: Number, default: null },
    maxWattage: { type: Number, default: null },
    totalWattage: { type: Number, default: null },
    voltage: { type: String, default: '220-240V' },
    colorTemperature: [{ type: String, enum: COLOR_TEMPERATURES }],
    lumens: { type: Number, default: null },
    cri: { type: Number, default: null },
    dimmable: { type: Boolean, default: false },
    dimmerType: { type: String, default: null },
    ipRating: { type: String, default: null },
    energyRating: { type: String, default: null },
    heightCm: { type: Number, default: null },
    widthCm: { type: Number, default: null },
    depthCm: { type: Number, default: null },
    diameterCm: { type: Number, default: null },
    canopyDiameterCm: { type: Number, default: null },
    minDropCm: { type: Number, default: null },
    maxDropCm: { type: Number, default: null },
    chainLengthCm: { type: Number, default: null },
    weightKg: { type: Number, default: null },
    installationType: {
      type: String,
      enum: INSTALLATION_TYPES,
      default: 'hardwired',
    },
    assemblyRequired: { type: Boolean, default: true },
    certified: { type: [String], default: [] },
    warrantyMonths: { type: Number, default: 12 },
    careInstructions: { type: String, default: '' },
    installationNotes: { type: String, default: '' },
    customizationAvailable: { type: Boolean, default: false },
    customizationNotes: { type: String, default: '' },

    images: { type: [imageAssetSchema], default: [] },
    lifestyleImages: { type: [imageAssetSchema], default: [] },
    videos: { type: [videoAssetSchema], default: [] },
    brochurePdf: {
      url: { type: String, default: null },
      key: { type: String, default: null },
    },
    sizeGuideImage: { type: imageAssetSchema, default: null },

    isFeatured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isCustomOrder: { type: Boolean, default: false },
    leadTimeDays: { type: Number, default: 0 },
    sortOrder: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
    relatedProductIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    ...seoSchema.obj,
    publishedAt: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ 'variants.sku': 1 }, { unique: true });
productSchema.index({ status: 1, visibility: 1, isDeleted: 1 });
productSchema.index({ categoryIds: 1, status: 1 });
productSchema.index({ collectionIds: 1, status: 1 });
productSchema.index({ isFeatured: 1, status: 1 });
productSchema.index({ isBestSeller: 1, status: 1 });
productSchema.index({ fromPriceInPaise: 1 });
productSchema.index({ productType: 1, style: 1, mountType: 1 });
productSchema.index({ name: 'text', shortDescription: 'text', tags: 'text' });

const ProductModel = mongoose.model('Product', productSchema);
export default ProductModel;
