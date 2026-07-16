import jwt from 'jsonwebtoken';
import adminRepository from '../repositories/admin.repository.js';
import userRepository from '../repositories/user.repository.js';
import {
  UnauthorizedError,
  ForbiddenError,
  handleError,
} from '../utilities/apiResponse.js';

function extractToken(req) {
  let token = req.headers.authorization;
  if (token?.startsWith('Bearer ')) {
    token = token.slice(7);
  }
  return token || null;
}

class AuthJwt {
  static async verifyAdmin(req, res, next) {
    try {
      const token = extractToken(req);
      if (!token) throw new UnauthorizedError('Access denied');

      const decoded = jwt.verify(token, process.env.HASH_KEY);
      if (!decoded?.id || (decoded.role !== 'Admin' && decoded.role !== 'SubAdmin')) {
        throw new UnauthorizedError('Admin token required');
      }

      const admin = await adminRepository.findById(decoded.id);
      if (!admin) throw new UnauthorizedError('Admin not found');
      if (admin.disable) throw new ForbiddenError('Your account is disabled');

      req.adminId = admin._id.toString();
      req.adminRole = admin.role;
      req.adminPermissions = admin.permissions || [];
      req.isAdminUser = true;
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return handleError(res, new UnauthorizedError('Invalid or expired token'));
      }
      return handleError(res, error);
    }
  }

  static async verifyUser(req, res, next) {
    try {
      const token = extractToken(req);
      if (!token) throw new UnauthorizedError('Access denied');

      const decoded = jwt.verify(token, process.env.HASH_KEY);
      if (!decoded?.id || decoded.role !== 'User') {
        throw new UnauthorizedError('User token required');
      }

      const user = await userRepository.findById(decoded.id);
      if (!user) throw new UnauthorizedError('User not found');
      if (user.disable) throw new ForbiddenError('Your account is disabled');

      req.userId = user._id.toString();
      req.userRole = 'User';
      req.userEmail = user.email;
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return handleError(res, new UnauthorizedError('Invalid or expired token'));
      }
      return handleError(res, error);
    }
  }

  /** User JWT optional; also reads x-guest-token for cart/checkout */
  static async optionalUserOrGuest(req, res, next) {
    try {
      const token = extractToken(req);
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.HASH_KEY);
          if (decoded?.role === 'User' && decoded.id) {
            const user = await userRepository.findById(decoded.id);
            if (user && !user.disable) {
              req.userId = user._id.toString();
              req.userRole = 'User';
              req.userEmail = user.email;
              req.email = user.email;
            }
          } else if (
            (decoded?.role === 'Admin' || decoded?.role === 'SubAdmin') &&
            decoded.id
          ) {
            req.isAdminUser = true;
            req.adminId = decoded.id;
          }
        } catch {
          // ignore invalid token for optional auth
        }
      }

      req.guestToken = req.headers['x-guest-token'] || null;
      next();
    } catch (error) {
      return handleError(res, error);
    }
  }

  static hasPermission(permission) {
    return (req, res, next) => {
      try {
        if (req.adminRole === 'Admin') {
          return next();
        }

        const perms = req.adminPermissions || [];
        if (!perms.includes(permission)) {
          throw new ForbiddenError(`Missing permission: ${permission}`);
        }
        return next();
      } catch (error) {
        return handleError(res, error);
      }
    };
  }
}

export default AuthJwt;
