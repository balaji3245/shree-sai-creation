import HomeSectionModel from '../models/homeSection.model.js';

class HomeSectionRepository {
  create(payload) {
    return HomeSectionModel.create(payload);
  }

  findById(id) {
    return HomeSectionModel.findOne({ _id: id, isDeleted: false });
  }

  findByKey(sectionKey) {
    return HomeSectionModel.findOne({ sectionKey, isDeleted: false });
  }

  findMany(filter = {}, { skip = 0, limit = 100, sort = { sortOrder: 1 } } = {}) {
    return HomeSectionModel.find({ isDeleted: false, ...filter })
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  findActive() {
    return HomeSectionModel.find({
      isDeleted: false,
      isActive: true,
    }).sort({ sortOrder: 1 });
  }

  count(filter = {}) {
    return HomeSectionModel.countDocuments({ isDeleted: false, ...filter });
  }

  updateById(id, update) {
    return HomeSectionModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      update,
      { new: true }
    );
  }

  softDelete(id) {
    return HomeSectionModel.findOneAndUpdate(
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
    return HomeSectionModel.bulkWrite(ops);
  }
}

export default new HomeSectionRepository();
