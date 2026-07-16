import UserModel from '../models/user.model.js';

class UserRepository {
  create(payload) {
    return UserModel.create(payload);
  }

  findByEmail(email, { withPassword = false } = {}) {
    const query = UserModel.findOne({
      email: email.toLowerCase(),
      isDeleted: false,
    });
    if (withPassword) query.select('+password');
    return query;
  }

  findById(id, { withPassword = false } = {}) {
    const query = UserModel.findOne({ _id: id, isDeleted: false });
    if (withPassword) query.select('+password');
    return query;
  }

  updateById(id, update) {
    return UserModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      update,
      { new: true }
    );
  }

  softDelete(id) {
    return UserModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date(), disable: true },
      { new: true }
    );
  }
}

export default new UserRepository();
