import mongoose from 'mongoose';

const faqCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

faqCategorySchema.index({ slug: 1 }, { unique: true });

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FaqCategory',
      default: null,
    },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

faqSchema.index({ isActive: 1, isDeleted: 1, sortOrder: 1 });
faqSchema.index({ categoryId: 1, sortOrder: 1 });

export const FaqCategoryModel = mongoose.model('FaqCategory', faqCategorySchema);
export const FaqModel = mongoose.model('Faq', faqSchema);
