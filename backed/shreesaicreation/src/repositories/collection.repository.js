import CollectionModel from '../models/collection.model.js';

class CollectionRepository {
  create(payload) {
    return CollectionModel.create(payload);
  }

  findById(id) {
    return CollectionModel.findOne({ _id: id, isDeleted: false });
  }

  findBySlug(slug) {
    return CollectionModel.findOne({ slug, isDeleted: false });
  }

  findMany(filter = {}, { sort = { sortOrder: 1, createdAt: -1 }, skip = 0, limit = 50 } = {}) {
    return CollectionModel.find({ isDeleted: false, ...filter })
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  count(filter = {}) {
    return CollectionModel.countDocuments({ isDeleted: false, ...filter });
  }

  updateById(id, update) {
    return CollectionModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      update,
      { new: true }
    );
  }

  softDelete(id) {
    return CollectionModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date(), isActive: false },
      { new: true }
    );
  }

  listSlugs() {
    return CollectionModel.find({ isDeleted: false }).select('slug').lean();
  }
}

export default new CollectionRepository();
