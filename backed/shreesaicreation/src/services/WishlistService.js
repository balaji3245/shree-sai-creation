import wishlistRepository from '../repositories/wishlist.repository.js';
import productRepository from '../repositories/product.repository.js';
import CartService from './CartService.js';
import { NotFoundError, ValidationError } from '../utilities/apiResponse.js';
import { paiseToRupees } from '../utilities/money.js';

class WishlistService {
  async getOrCreate(userId) {
    let wishlist = await wishlistRepository.findByUserId(userId);
    if (!wishlist) {
      wishlist = await wishlistRepository.create({ userId, productIds: [] });
    }
    return wishlist;
  }

  async list(userId) {
    let wishlist = await wishlistRepository.findByUserIdPopulated(userId);
    if (!wishlist) {
      await this.getOrCreate(userId);
      wishlist = await wishlistRepository.findByUserIdPopulated(userId);
    }

    const products = (wishlist.productIds || []).map((p) => {
      const obj = p.toObject ? p.toObject() : p;
      return {
        ...obj,
        fromPrice: paiseToRupees(obj.fromPriceInPaise),
      };
    });

    return { products, count: products.length };
  }

  async add(userId, productId) {
    const product = await productRepository.findById(productId);
    if (!product || product.status !== 'published') {
      throw new NotFoundError('Product not found');
    }

    const wishlist = await this.getOrCreate(userId);
    const exists = wishlist.productIds.some((id) => String(id) === String(productId));
    if (!exists) {
      wishlist.productIds.push(productId);
      await wishlistRepository.save(wishlist);
    }
    return this.list(userId);
  }

  async remove(userId, productId) {
    const wishlist = await this.getOrCreate(userId);
    wishlist.productIds = wishlist.productIds.filter(
      (id) => String(id) !== String(productId)
    );
    await wishlistRepository.save(wishlist);
    return this.list(userId);
  }

  async moveToCart(userId, { productId, variantId, quantity = 1 }) {
    if (!productId || !variantId) {
      throw new ValidationError('productId and variantId required');
    }
    await CartService.addItem(
      { userId },
      { productId, variantId, quantity }
    );
    await this.remove(userId, productId);
    return { message: 'Moved to cart' };
  }
}

export default new WishlistService();
