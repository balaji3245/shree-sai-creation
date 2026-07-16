import WishlistModel from '../models/wishlist.model.js';

class WishlistRepository {
  findByUserId(userId) {
    return WishlistModel.findOne({ userId });
  }

  create(payload) {
    return WishlistModel.create(payload);
  }

  async save(doc) {
    return doc.save();
  }

  findByUserIdPopulated(userId) {
    return WishlistModel.findOne({ userId }).populate({
      path: 'productIds',
      match: { isDeleted: false, status: 'published', visibility: 'public' },
      select:
        'name slug images fromPriceInPaise hasOnlyDefaultVariant isFeatured variants.title variants.priceInPaise variants.isDefault',
    });
  }
}

export default new WishlistRepository();
