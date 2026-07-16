import mongoose from 'mongoose';
import { HOME_SECTION_TYPES } from '../constants/cms.constants.js';

const homeSectionSchema = new mongoose.Schema(
  {
    sectionKey: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: HOME_SECTION_TYPES,
      required: true,
    },
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    dataSource: {
      type: String,
      enum: [
        'featured',
        'best_seller',
        'new_arrival',
        'category',
        'collection',
        'custom',
        'none',
      ],
      default: 'none',
    },
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    customProductIds: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    ],
    itemLimit: { type: Number, default: 8, min: 1, max: 48 },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    displayConfig: { type: mongoose.Schema.Types.Mixed, default: {} },
    // For trust_badges / feature_blocks / projects
    items: { type: [mongoose.Schema.Types.Mixed], default: [] },
    htmlContent: { type: String, default: '' },
    ctaText: { type: String, default: '' },
    ctaLink: { type: String, default: '' },
    imageUrl: { type: String, default: null },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

homeSectionSchema.index({ sectionKey: 1 }, { unique: true });
homeSectionSchema.index({ isActive: 1, isDeleted: 1, sortOrder: 1 });

const HomeSectionModel = mongoose.model('HomeSection', homeSectionSchema);
export default HomeSectionModel;
