import mongoose from 'mongoose';

const pageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    content: { type: String, default: '' },
    excerpt: { type: String, default: '' },
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    seoKeywords: { type: [String], default: [] },
    isPublished: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

pageSchema.index({ slug: 1 }, { unique: true });
pageSchema.index({ isPublished: 1, isDeleted: 1 });

const PageModel = mongoose.model('Page', pageSchema);
export default PageModel;
