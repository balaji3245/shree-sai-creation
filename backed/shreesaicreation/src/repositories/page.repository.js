import PageModel from '../models/page.model.js';

class PageRepository {
  create(payload) {
    return PageModel.create(payload);
  }

  findById(id) {
    return PageModel.findOne({ _id: id, isDeleted: false });
  }

  findBySlug(slug) {
    return PageModel.findOne({ slug, isDeleted: false });
  }

  findMany(filter = {}, { skip = 0, limit = 50, sort = { sortOrder: 1 } } = {}) {
    return PageModel.find({ isDeleted: false, ...filter })
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  count(filter = {}) {
    return PageModel.countDocuments({ isDeleted: false, ...filter });
  }

  updateById(id, update) {
    return PageModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      update,
      { new: true }
    );
  }

  softDelete(id) {
    return PageModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date(), isPublished: false },
      { new: true }
    );
  }

  listSlugs() {
    return PageModel.find({ isDeleted: false }).select('slug').lean();
  }
}

export default new PageRepository();
