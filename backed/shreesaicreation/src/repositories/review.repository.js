import ReviewModel from '../models/review.model.js';

class ReviewRepository {
  create(payload) {
    return ReviewModel.create(payload);
  }

  findById(id) {
    return ReviewModel.findOne({ _id: id, isDeleted: false });
  }

  findByProductUser(productId, userId) {
    return ReviewModel.findOne({ productId, userId, isDeleted: false });
  }

  findMany(filter = {}, { skip = 0, limit = 20, sort = { createdAt: -1 } } = {}) {
    return ReviewModel.find({ isDeleted: false, ...filter })
      .populate('userId', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  count(filter = {}) {
    return ReviewModel.countDocuments({ isDeleted: false, ...filter });
  }

  updateById(id, update) {
    return ReviewModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      update,
      { new: true }
    );
  }

  softDelete(id) {
    return ReviewModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
  }

  async aggregateProductStats(productId) {
    const rows = await ReviewModel.aggregate([
      {
        $match: {
          productId,
          status: 'approved',
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: '$productId',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 },
        },
      },
    ]);
    return rows[0] || { averageRating: 0, reviewCount: 0 };
  }
}

export default new ReviewRepository();
