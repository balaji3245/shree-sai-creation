import { FaqModel, FaqCategoryModel } from '../models/faq.model.js';

class FaqRepository {
  createCategory(payload) {
    return FaqCategoryModel.create(payload);
  }

  findCategoryById(id) {
    return FaqCategoryModel.findOne({ _id: id, isDeleted: false });
  }

  findCategories(filter = {}) {
    return FaqCategoryModel.find({ isDeleted: false, ...filter }).sort({
      sortOrder: 1,
    });
  }

  updateCategory(id, update) {
    return FaqCategoryModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      update,
      { new: true }
    );
  }

  softDeleteCategory(id) {
    return FaqCategoryModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date(), isActive: false },
      { new: true }
    );
  }

  createFaq(payload) {
    return FaqModel.create(payload);
  }

  findFaqById(id) {
    return FaqModel.findOne({ _id: id, isDeleted: false });
  }

  findFaqs(filter = {}, { skip = 0, limit = 100 } = {}) {
    return FaqModel.find({ isDeleted: false, ...filter })
      .populate('categoryId', 'name slug')
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  countFaqs(filter = {}) {
    return FaqModel.countDocuments({ isDeleted: false, ...filter });
  }

  updateFaq(id, update) {
    return FaqModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      update,
      { new: true }
    );
  }

  softDeleteFaq(id) {
    return FaqModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date(), isActive: false },
      { new: true }
    );
  }
}

export default new FaqRepository();
