import ShippingZoneModel from '../models/shippingZone.model.js';

class ShippingZoneRepository {
  create(payload) {
    return ShippingZoneModel.create(payload);
  }

  findById(id) {
    return ShippingZoneModel.findOne({ _id: id, isDeleted: false });
  }

  findMany(filter = {}, { skip = 0, limit = 50, sort = { sortOrder: 1 } } = {}) {
    return ShippingZoneModel.find({ isDeleted: false, ...filter })
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  findActive() {
    return ShippingZoneModel.find({ isDeleted: false, isActive: true }).sort({
      sortOrder: 1,
    });
  }

  count(filter = {}) {
    return ShippingZoneModel.countDocuments({ isDeleted: false, ...filter });
  }

  updateById(id, update) {
    return ShippingZoneModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      update,
      { new: true }
    );
  }

  softDelete(id) {
    return ShippingZoneModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date(), isActive: false },
      { new: true }
    );
  }
}

export default new ShippingZoneRepository();
