import InquiryModel from '../models/inquiry.model.js';

class InquiryRepository {
  create(payload) {
    return InquiryModel.create(payload);
  }

  findById(id) {
    return InquiryModel.findById(id);
  }

  findMany(filter = {}, { skip = 0, limit = 50, sort = { createdAt: -1 } } = {}) {
    return InquiryModel.find(filter).sort(sort).skip(skip).limit(limit);
  }

  count(filter = {}) {
    return InquiryModel.countDocuments(filter);
  }

  updateById(id, update) {
    return InquiryModel.findByIdAndUpdate(id, update, { new: true });
  }
}

export default new InquiryRepository();
