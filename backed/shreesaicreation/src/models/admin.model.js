import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ADMIN_PERMISSIONS, ADMIN_ROLES } from '../constants/permissions.constants.js';

const SALT_ROUNDS = 10;

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, default: null },
    email: { type: String, required: true, trim: true, lowercase: true },
    password: { type: String, required: true, select: false },
    image: { type: String, default: null },
    role: {
      type: String,
      enum: ADMIN_ROLES,
      default: 'Admin',
    },
    permissions: [
      {
        type: String,
        enum: ADMIN_PERMISSIONS,
      },
    ],
    disable: { type: Boolean, default: false },
    refreshTokenHash: { type: String, select: false, default: null },
  },
  { timestamps: true }
);

adminSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

adminSchema.pre('save', async function hashPassword(next) {
  try {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (error) {
    return next(error);
  }
});

adminSchema.index({ email: 1 }, { unique: true });
adminSchema.index({ role: 1, createdAt: -1 });

const AdminModel = mongoose.model('Admin', adminSchema);
export default AdminModel;
