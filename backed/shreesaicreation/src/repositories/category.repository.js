import CategoryModel from '../models/category.model.js';

class CategoryRepository {
  create(payload) {
    return CategoryModel.create(payload);
  }

  findById(id) {
    return CategoryModel.findOne({ _id: id, isDeleted: false });
  }

  findBySlug(slug) {
    return CategoryModel.findOne({ slug, isDeleted: false });
  }

  findMany(filter = {}, { sort = { sortOrder: 1, createdAt: -1 }, skip = 0, limit = 50 } = {}) {
    return CategoryModel.find({ isDeleted: false, ...filter })
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  count(filter = {}) {
    return CategoryModel.countDocuments({ isDeleted: false, ...filter });
  }

  updateById(id, update) {
    return CategoryModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      update,
      { new: true }
    );
  }

  softDelete(id) {
    return CategoryModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date(), isActive: false },
      { new: true }
    );
  }

  bulkReorder(items) {
    const ops = items.map(({ id, sortOrder }) => ({
      updateOne: {
        filter: { _id: id, isDeleted: false },
        update: { $set: { sortOrder } },
      },
    }));
    return CategoryModel.bulkWrite(ops);
  }

  listSlugs() {
    return CategoryModel.find({ isDeleted: false }).select('slug').lean();
  }

  incrementProductCount(categoryIds, delta = 1) {
    if (!categoryIds?.length) return null;
    return CategoryModel.updateMany(
      { _id: { $in: categoryIds } },
      { $inc: { productCount: delta } }
    );
  }
}

export default new CategoryRepository();
