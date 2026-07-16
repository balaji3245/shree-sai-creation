import mongoose from 'mongoose';
import reviewRepository from '../repositories/review.repository.js';
import productRepository from '../repositories/product.repository.js';
import orderRepository from '../repositories/order.repository.js';
import {
  ConflictError,
  NotFoundError,
  ValidationError,
  ForbiddenError,
} from '../utilities/apiResponse.js';

class ReviewService {
  async create(userId, productSlugOrId, payload) {
    let product = null;
    if (mongoose.isValidObjectId(productSlugOrId)) {
      product = await productRepository.findById(productSlugOrId);
    }
    if (!product) {
      product = await productRepository.findBySlug(productSlugOrId);
    }
    if (!product || product.status !== 'published') {
      throw new NotFoundError('Product not found');
    }

    const rating = Number(payload.rating);
    if (!rating || rating < 1 || rating > 5) {
      throw new ValidationError('rating must be 1–5');
    }

    const existing = await reviewRepository.findByProductUser(product._id, userId);
    if (existing) {
      throw new ConflictError('You already reviewed this product');
    }

    // Verified purchase if user has a paid/completed order containing product
    const orders = await orderRepository.findMany(
      {
        userId,
        status: { $in: ['paid', 'processing', 'packed', 'shipped', 'delivered', 'completed'] },
        'items.productId': product._id,
      },
      { limit: 1 }
    );
    const isVerifiedPurchase = orders.length > 0;

    const review = await reviewRepository.create({
      productId: product._id,
      userId,
      orderId: orders[0]?._id || null,
      rating,
      title: payload.title || '',
      body: payload.body || '',
      status: 'pending',
      isVerifiedPurchase,
    });

    return { review };
  }

  async listPublic(productSlug, { page = 1, limit = 20 } = {}) {
    const product = await productRepository.findBySlug(productSlug);
    if (!product) throw new NotFoundError('Product not found');

    const filter = { productId: product._id, status: 'approved' };
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      reviewRepository.findMany(filter, { skip, limit }),
      reviewRepository.count(filter),
    ]);

    return {
      reviews,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
      stats: {
        averageRating: product.averageRating,
        reviewCount: product.reviewCount,
      },
    };
  }

  async listAdmin({ page = 1, limit = 50, status } = {}) {
    const filter = {};
    if (status) filter.status = status;
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      reviewRepository.findMany(filter, { skip, limit }),
      reviewRepository.count(filter),
    ]);
    return {
      reviews,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  async moderate(id, { status, adminNote }, adminId) {
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      throw new ValidationError('Invalid status');
    }
    const review = await reviewRepository.findById(id);
    if (!review) throw new NotFoundError('Review not found');

    const updated = await reviewRepository.updateById(id, {
      $set: {
        status,
        adminNote: adminNote || '',
      },
    });

    await this.recomputeProductRatings(review.productId);
    return { review: updated, moderatedBy: adminId };
  }

  async remove(id, ctx) {
    const review = await reviewRepository.findById(id);
    if (!review) throw new NotFoundError('Review not found');
    if (
      !ctx.isAdminUser &&
      String(review.userId) !== String(ctx.userId)
    ) {
      throw new ForbiddenError('Not your review');
    }
    await reviewRepository.softDelete(id);
    await this.recomputeProductRatings(review.productId);
    return { message: 'Review deleted' };
  }

  async recomputeProductRatings(productId) {
    const stats = await reviewRepository.aggregateProductStats(
      new mongoose.Types.ObjectId(String(productId))
    );
    await productRepository.updateById(productId, {
      $set: {
        averageRating: Math.round((stats.averageRating || 0) * 10) / 10,
        reviewCount: stats.reviewCount || 0,
      },
    });
  }
}

export default new ReviewService();
