import jwt from 'jsonwebtoken';
import {
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
} from '../utilities/apiResponse.js';
import adminRepository from '../repositories/admin.repository.js';
import { ADMIN_PERMISSIONS } from '../constants/permissions.constants.js';

function signAccessToken(admin) {
  return jwt.sign(
    {
      id: admin._id.toString(),
      role: admin.role,
      email: admin.email,
    },
    process.env.HASH_KEY,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function sanitizeAdmin(admin) {
  const obj = admin.toObject ? admin.toObject() : { ...admin };
  delete obj.password;
  delete obj.refreshTokenHash;
  return obj;
}

class AdminService {
  async login({ email, password }) {
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    const admin = await adminRepository.findByEmail(email, { withPassword: true });
    if (!admin) {
      throw new UnauthorizedError('Invalid email or password');
    }
    if (admin.disable) {
      throw new ForbiddenError('Your account is disabled');
    }

    const ok = await admin.comparePassword(password);
    if (!ok) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = signAccessToken(admin);
    return {
      token,
      admin: sanitizeAdmin(admin),
    };
  }

  async getMe(adminId) {
    const admin = await adminRepository.findById(adminId);
    if (!admin) throw new UnauthorizedError('Admin not found');
    if (admin.disable) throw new ForbiddenError('Your account is disabled');
    return sanitizeAdmin(admin);
  }

  async createSubAdmin(payload) {
    const existing = await adminRepository.findByEmail(payload.email);
    if (existing) {
      throw new ValidationError('Admin with this email already exists');
    }

    const permissions = (payload.permissions || []).filter((p) =>
      ADMIN_PERMISSIONS.includes(p)
    );

    const admin = await adminRepository.create({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      phone: payload.phone || null,
      role: 'SubAdmin',
      permissions,
    });

    return sanitizeAdmin(admin);
  }
}

export default new AdminService();
