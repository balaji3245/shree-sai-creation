import jwt from 'jsonwebtoken';
import userRepository from '../repositories/user.repository.js';
import {
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  ValidationError,
} from '../utilities/apiResponse.js';

function signUserToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      role: 'User',
      email: user.email,
    },
    process.env.HASH_KEY,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function sanitizeUser(user) {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  delete obj.refreshTokenHash;
  return obj;
}

class AuthService {
  async register({ name, email, password, phone }) {
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }
    if (String(password).length < 6) {
      throw new ValidationError('Password must be at least 6 characters');
    }

    const existing = await userRepository.findByEmail(email);
    if (existing) throw new ConflictError('Email already registered');

    const user = await userRepository.create({
      name: name || '',
      email: email.toLowerCase(),
      password,
      phone: phone || null,
    });

    const token = signUserToken(user);
    return { token, user: sanitizeUser(user) };
  }

  async login({ email, password }) {
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    const user = await userRepository.findByEmail(email, { withPassword: true });
    if (!user) throw new UnauthorizedError('Invalid email or password');
    if (user.disable) throw new ForbiddenError('Your account is disabled');

    const ok = await user.comparePassword(password);
    if (!ok) throw new UnauthorizedError('Invalid email or password');

    const token = signUserToken(user);
    return { token, user: sanitizeUser(user) };
  }

  async getMe(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new UnauthorizedError('User not found');
    if (user.disable) throw new ForbiddenError('Your account is disabled');
    return sanitizeUser(user);
  }

  async updateMe(userId, payload) {
    const allowed = {};
    if (payload.name !== undefined) allowed.name = payload.name;
    if (payload.phone !== undefined) allowed.phone = payload.phone;

    const user = await userRepository.updateById(userId, { $set: allowed });
    if (!user) throw new UnauthorizedError('User not found');
    return sanitizeUser(user);
  }
}

export default new AuthService();
