import AddressModel from '../models/address.model.js';

class AddressRepository {
  create(payload) {
    return AddressModel.create(payload);
  }

  findById(id, userId) {
    return AddressModel.findOne({ _id: id, userId, isDeleted: false });
  }

  findByUser(userId) {
    return AddressModel.find({ userId, isDeleted: false }).sort({
      isDefault: -1,
      createdAt: -1,
    });
  }

  updateById(id, userId, update) {
    return AddressModel.findOneAndUpdate(
      { _id: id, userId, isDeleted: false },
      update,
      { new: true }
    );
  }

  clearDefault(userId) {
    return AddressModel.updateMany(
      { userId, isDeleted: false },
      { $set: { isDefault: false } }
    );
  }

  softDelete(id, userId) {
    return AddressModel.findOneAndUpdate(
      { _id: id, userId, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
  }
}

export default new AddressRepository();
