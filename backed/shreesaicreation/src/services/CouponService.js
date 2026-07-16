import couponRepository from '../repositories/coupon.repository.js';
import orderRepository from '../repositories/order.repository.js';
import {
  NotFoundError,
  ValidationError,
  ConflictError,
} from '../utilities/apiResponse.js';
import { rupeesToPaise, paiseToRupees } from '../utilities/money.js';

function serializeCoupon(coupon) {
  const obj = coupon.toObject ? coupon.toObject() : { ...coupon };
  return {
    ...obj,
    discountValueDisplay:
      obj.discountType === 'percentage'
        ? `${obj.discountValue}%`
        : `₹${paiseToRupees(obj.discountValue)?.toFixed(2)}`,
    minCart: paiseToRupees(obj.minCartInPaise),
    maxDiscount: paiseToRupees(obj.maxDiscountInPaise),
  };
}

class CouponService {
  async create(payload) {
    const code = String(payload.code).trim().toUpperCase();
    const existing = await couponRepository.findByCode(code);
    if (existing) throw new ConflictError('Coupon code already exists');

    const discountValue =
      payload.discountType === 'flat'
        ? payload.discountValueInPaise ??
          rupeesToPaise(payload.discountValue ?? payload.flatDiscount)
        : Number(payload.discountValue ?? payload.discountInPercentage);

    if (discountValue === null || Number.isNaN(discountValue)) {
      throw new ValidationError('discountValue is required');
    }

    const coupon = await couponRepository.create({
      code,
      description: payload.description || '',
      discountType: payload.discountType,
      discountValue,
      maxDiscountInPaise:
        payload.maxDiscountInPaise ??
        (payload.maxDiscount != null ? rupeesToPaise(payload.maxDiscount) : null),
      minCartInPaise:
        payload.minCartInPaise ??
        (payload.minCart != null ? rupeesToPaise(payload.minCart) : 0),
      startDate: payload.startDate || null,
      expiryDate: payload.expiryDate || null,
      usageLimit: payload.usageLimit ?? null,
      perUserLimit: payload.perUserLimit ?? 1,
      firstOrderOnly: Boolean(payload.firstOrderOnly),
      freeShipping: Boolean(payload.freeShipping),
      productIds: payload.productIds || [],
      categoryIds: payload.categoryIds || [],
      disabled: Boolean(payload.disabled),
    });

    return { coupon: serializeCoupon(coupon) };
  }

  async listAdmin({ page = 1, limit = 50 } = {}) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      couponRepository.findMany({}, { skip, limit }),
      couponRepository.count(),
    ]);
    return {
      coupons: items.map(serializeCoupon),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  async update(id, payload) {
    const coupon = await couponRepository.findById(id);
    if (!coupon) throw new NotFoundError('Coupon not found');

    const update = { ...payload };
    if (update.code) update.code = String(update.code).trim().toUpperCase();
    if (update.minCart != null) {
      update.minCartInPaise = rupeesToPaise(update.minCart);
      delete update.minCart;
    }
    if (update.maxDiscount != null) {
      update.maxDiscountInPaise = rupeesToPaise(update.maxDiscount);
      delete update.maxDiscount;
    }

    const updated = await couponRepository.updateById(id, { $set: update });
    return { coupon: serializeCoupon(updated) };
  }

  async remove(id) {
    const coupon = await couponRepository.findById(id);
    if (!coupon) throw new NotFoundError('Coupon not found');
    await couponRepository.softDelete(id);
    return { message: 'Coupon deleted' };
  }

  /**
   * Validate coupon against cart context. Returns discount breakdown.
   */
  async validateForCart({
    code,
    subtotalInPaise,
    items = [],
    userId = null,
    email = null,
  }) {
    const coupon = await couponRepository.findByCode(code);
    if (!coupon || coupon.disabled) {
      throw new ValidationError('Invalid or inactive coupon');
    }

    const now = new Date();
    if (coupon.startDate && now < coupon.startDate) {
      throw new ValidationError('Coupon is not active yet');
    }
    if (coupon.expiryDate && now > coupon.expiryDate) {
      throw new ValidationError('Coupon has expired');
    }
    if (coupon.usageLimit != null && coupon.usageCount >= coupon.usageLimit) {
      throw new ValidationError('Coupon usage limit reached');
    }
    if (subtotalInPaise < (coupon.minCartInPaise || 0)) {
      throw new ValidationError(
        `Minimum cart value is ₹${paiseToRupees(coupon.minCartInPaise)?.toFixed(2)}`
      );
    }

    if (coupon.productIds?.length) {
      const allowed = new Set(coupon.productIds.map(String));
      const ok = items.some((i) => allowed.has(String(i.productId)));
      if (!ok) throw new ValidationError('Coupon not applicable to cart items');
    }

    if (coupon.categoryIds?.length) {
      // Soft check — skip if items lack categoryIds snapshot
      const allowed = new Set(coupon.categoryIds.map(String));
      const hasCat = items.some((i) =>
        (i.categoryIds || []).some((c) => allowed.has(String(c)))
      );
      if (items.some((i) => i.categoryIds) && !hasCat) {
        throw new ValidationError('Coupon not applicable to cart categories');
      }
    }

    if (coupon.firstOrderOnly) {
      let prior = 0;
      if (userId) prior = await orderRepository.countPaidByUser(userId);
      else if (email) prior = await orderRepository.countPaidByEmail(email);
      if (prior > 0) {
        throw new ValidationError('Coupon valid for first order only');
      }
    }

    if (coupon.perUserLimit != null && (userId || email)) {
      const used = await couponRepository.countRedemptions({
        couponId: coupon._id,
        userId,
        email,
      });
      if (used >= coupon.perUserLimit) {
        throw new ValidationError('You have already used this coupon');
      }
    }

    let discountInPaise = 0;
    if (coupon.discountType === 'percentage') {
      discountInPaise = Math.round((subtotalInPaise * coupon.discountValue) / 100);
      if (coupon.maxDiscountInPaise != null) {
        discountInPaise = Math.min(discountInPaise, coupon.maxDiscountInPaise);
      }
    } else {
      discountInPaise = Math.min(coupon.discountValue, subtotalInPaise);
    }

    return {
      coupon,
      discountInPaise,
      freeShipping: Boolean(coupon.freeShipping),
      code: coupon.code,
    };
  }
}

export default new CouponService();
