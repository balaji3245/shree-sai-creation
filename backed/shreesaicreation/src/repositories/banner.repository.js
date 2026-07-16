import BannerModel from '../models/banner.model.js';

class BannerRepository {
  create(payload) {
    return BannerModel.create(payload);
  }

  findById(id) {
    return BannerModel.findOne({ _id: id, isDeleted: false });
  }

  findMany(filter = {}, { skip = 0, limit = 50, sort = { sortOrder: 1 } } = {}) {
    return BannerModel.find({ isDeleted: false, ...filter })
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  count(filter = {}) {
    return BannerModel.countDocuments({ isDeleted: false, ...filter });
  }

  findActive(placement) {
    const now = new Date();
    const filter = {
      isDeleted: false,
      isActive: true,
      $and: [
        { $or: [{ activeFrom: null }, { activeFrom: { $lte: now } }] },
        { $or: [{ activeUntil: null }, { activeUntil: { $gte: now } }] },
      ],
    };
    if (placement) filter.placement = placement;
    return BannerModel.find(filter).sort({ sortOrder: 1 });
  }

  updateById(id, update) {
    return BannerModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      update,
      { new: true }
    );
  }

  softDelete(id) {
    return BannerModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date(), isActive: false },
      { new: true }
    );
  }
}

export default new BannerRepository();
