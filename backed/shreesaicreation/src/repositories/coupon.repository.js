import CouponModel from '../models/coupon.model.js';
import CouponRedemptionModel from '../models/couponRedemption.model.js';

class CouponRepository {
  create(payload) {
    return CouponModel.create(payload);
  }

  findByCode(code) {
    return CouponModel.findOne({
      code: String(code).toUpperCase(),
      isDeleted: false,
    });
  }

  findById(id) {
    return CouponModel.findOne({ _id: id, isDeleted: false });
  }

  findMany(filter = {}, { skip = 0, limit = 50, sort = { createdAt: -1 } } = {}) {
    return CouponModel.find({ isDeleted: false, ...filter })
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  count(filter = {}) {
    return CouponModel.countDocuments({ isDeleted: false, ...filter });
  }

  updateById(id, update) {
    return CouponModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      update,
      { new: true }
    );
  }

  softDelete(id) {
    return CouponModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date(), disabled: true },
      { new: true }
    );
  }

  incrementUsage(id) {
    return CouponModel.findByIdAndUpdate(id, { $inc: { usageCount: 1 } }, { new: true });
  }

  countRedemptions({ couponId, userId, email }) {
    const filter = { couponId };
    if (userId) filter.userId = userId;
    else if (email) filter.email = email.toLowerCase();
    return CouponRedemptionModel.countDocuments(filter);
  }

  createRedemption(payload) {
    return CouponRedemptionModel.create(payload);
  }
}

export default new CouponRepository();
