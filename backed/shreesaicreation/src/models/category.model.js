import mongoose from 'mongoose';
import { imageAssetSchema, seoSchema } from './schemas/common.schema.js';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    description: { type: String, default: '' },
    shortDescription: { type: String, default: '' },
    image: { type: imageAssetSchema, default: null },
    bannerImage: { type: imageAssetSchema, default: null },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    productCount: { type: Number, default: 0 },
    ...seoSchema.obj,
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ isActive: 1, isDeleted: 1, sortOrder: 1 });
categorySchema.index({ parentId: 1, sortOrder: 1 });
categorySchema.index({ isFeatured: 1, isActive: 1 });

const CategoryModel = mongoose.model('Category', categorySchema);
export default CategoryModel;
