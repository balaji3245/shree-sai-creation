import mongoose from 'mongoose';
import { imageAssetSchema, seoSchema } from './schemas/common.schema.js';

const collectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    description: { type: String, default: '' },
    image: { type: imageAssetSchema, default: null },
    productIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    ...seoSchema.obj,
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

collectionSchema.index({ slug: 1 }, { unique: true });
collectionSchema.index({ isActive: 1, isDeleted: 1, sortOrder: 1 });

const CollectionModel = mongoose.model('Collection', collectionSchema);
export default CollectionModel;
