import ProductModel from '../models/product.model.js';

class ProductRepository {
  create(payload) {
    return ProductModel.create(payload);
  }

  findById(id) {
    return ProductModel.findOne({ _id: id, isDeleted: false });
  }

  findBySlug(slug) {
    return ProductModel.findOne({ slug, isDeleted: false });
  }

  findPublishedBySlug(slug) {
    return ProductModel.findOne({
      slug,
      isDeleted: false,
      status: 'published',
      visibility: 'public',
    })
      .populate('categoryIds', 'name slug')
      .populate('collectionIds', 'name slug')
      .populate(
        'relatedProductIds',
        'name slug images fromPriceInPaise hasOnlyDefaultVariant variants.title variants.priceInPaise variants.isDefault variants.isActive'
      );
  }

  findMany(
    filter = {},
    { sort = { createdAt: -1 }, skip = 0, limit = 24, populate = false } = {}
  ) {
    let query = ProductModel.find({ isDeleted: false, ...filter })
      .sort(sort)
      .skip(skip)
      .limit(limit);

    if (populate) {
      query = query
        .populate('categoryIds', 'name slug')
        .populate('collectionIds', 'name slug');
    }

    return query;
  }

  count(filter = {}) {
    return ProductModel.countDocuments({ isDeleted: false, ...filter });
  }

  updateById(id, update) {
    return ProductModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      update,
      { new: true, runValidators: true }
    );
  }

  softDelete(id) {
    return ProductModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date(), status: 'archived' },
      { new: true }
    );
  }

  findByVariantSku(sku, excludeProductId = null) {
    const filter = {
      isDeleted: false,
      'variants.sku': sku,
    };
    if (excludeProductId) {
      filter._id = { $ne: excludeProductId };
    }
    return ProductModel.findOne(filter).select('_id name variants.sku');
  }

  listSlugs() {
    return ProductModel.find({ isDeleted: false }).select('slug').lean();
  }

  async save(productDoc) {
    return productDoc.save();
  }
 
  async decrementVariantStock(productId, variantId, quantity) {
    return ProductModel.findOneAndUpdate(
      {
        _id: productId,
        isDeleted: false,
        variants: {
          $elemMatch: {
            _id: variantId,
            $or: [
              { trackInventory: false },
              { allowBackorder: true },
              { stock: { $gte: quantity } },
            ],
          },
        },
      },
      {
        $inc: {
          'variants.$[v].stock': -quantity,
          totalStock: -quantity,
          soldCount: quantity,
        },
      },
      {
        new: true,
        arrayFilters: [
          {
            'v._id': variantId,
            'v.trackInventory': true,
            'v.allowBackorder': { $ne: true },
          },
        ],
      }
    );
  }

  /**
   * Restock after cancel/refund before ship.
   */
  async incrementVariantStock(productId, variantId, quantity) {
    return ProductModel.findOneAndUpdate(
      {
        _id: productId,
        isDeleted: false,
        'variants._id': variantId,
      },
      {
        $inc: {
          'variants.$.stock': quantity,
          totalStock: quantity,
          soldCount: -quantity,
        },
      },
      { new: true }
    );
  }
}

export default new ProductRepository();