import mongoose from 'mongoose';
import { BANNER_LINK_TYPES } from '../constants/cms.constants.js';

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    imageDesktop: { type: String, required: true },
    imageMobile: { type: String, default: null },
    ctaText: { type: String, default: '' },
    linkType: {
      type: String,
      enum: BANNER_LINK_TYPES,
      default: 'none',
    },
    linkValue: { type: String, default: '' },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    activeFrom: { type: Date, default: null },
    activeUntil: { type: Date, default: null },
    placement: {
      type: String,
      enum: ['home_hero', 'home_promo', 'category', 'global'],
      default: 'home_hero',
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

bannerSchema.index({ isActive: 1, placement: 1, sortOrder: 1 });

const BannerModel = mongoose.model('Banner', bannerSchema);
export default BannerModel;
