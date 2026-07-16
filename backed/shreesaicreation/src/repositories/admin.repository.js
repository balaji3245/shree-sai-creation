import AdminModel from '../models/admin.model.js';

class AdminRepository {
  findByEmail(email, { withPassword = false } = {}) {
    const query = AdminModel.findOne({ email: email.toLowerCase() });
    if (withPassword) query.select('+password');
    return query;
  }

  findById(id, { withPassword = false } = {}) {
    const query = AdminModel.findById(id);
    if (withPassword) query.select('+password');
    return query;
  }

  create(payload) {
    return AdminModel.create(payload);
  }

  updateById(id, update) {
    return AdminModel.findByIdAndUpdate(id, update, { new: true });
  }

  countDocuments(filter = {}) {
    return AdminModel.countDocuments(filter);
  }
}

export default new AdminRepository();
