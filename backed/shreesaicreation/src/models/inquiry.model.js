import mongoose from 'mongoose';
import {
  INQUIRY_TYPES,
  INQUIRY_STATUSES,
} from '../constants/cms.constants.js';

const inquirySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: INQUIRY_TYPES,
      default: 'contact',
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: '', trim: true },
    subject: { type: String, default: '' },
    message: { type: String, required: true },
    // Custom design fields
    roomType: { type: String, default: '' },
    budgetRange: { type: String, default: '' },
    preferredStyle: { type: String, default: '' },
    dimensions: { type: String, default: '' },
    attachmentUrls: { type: [String], default: [] },
    status: {
      type: String,
      enum: INQUIRY_STATUSES,
      default: 'new',
      index: true,
    },
    adminNotes: { type: String, default: '' },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
  },
  { timestamps: true }
);

inquirySchema.index({ createdAt: -1 });
inquirySchema.index({ type: 1, status: 1 });

const InquiryModel = mongoose.model('Inquiry', inquirySchema);
export default InquiryModel;
