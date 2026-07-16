import mongoose from 'mongoose';

const newsletterSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true },
    name: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    unsubscribedAt: { type: Date, default: null },
    source: { type: String, default: 'website' },
  },
  { timestamps: true }
);

newsletterSchema.index({ email: 1 }, { unique: true });
newsletterSchema.index({ isActive: 1, createdAt: -1 });

const NewsletterModel = mongoose.model('NewsletterSubscriber', newsletterSchema);
export default NewsletterModel;
