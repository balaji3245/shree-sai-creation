import ProductModel from '../models/product.model.js';
import { ConflictError, NotFoundError } from '../utilities/apiResponse.js';
import productRepository from '../repositories/product.repository.js';

class InventoryService {
  async assertAvailable(productId, variantId, quantity) {
    const product = await productRepository.findById(productId);
    if (!product || product.status !== 'published') {
      throw new NotFoundError('Product not available');
    }
    const variant = product.variants.id(variantId);
    if (!variant || !variant.isActive) {
      throw new NotFoundError('Variant not available');
    }
    if (
      variant.trackInventory &&
      !variant.allowBackorder &&
      variant.stock < quantity
    ) {
      throw new ConflictError(`Only ${variant.stock} in stock for ${variant.sku}`);
    }
    return { product, variant };
  }

  async decrementForOrderItems(items) {
    for (const item of items) {
      const product = await productRepository.findById(item.productId);
      if (!product) {
        throw new ConflictError(`Product missing for SKU ${item.sku}`);
      }

      const variant = product.variants.id(item.variantId);
      if (!variant) {
        throw new ConflictError(`Variant missing for SKU ${item.sku}`);
      }

      if (variant.trackInventory && !variant.allowBackorder) {
        // Conditional atomic update
        const result = await ProductModel.findOneAndUpdate(
          {
            _id: item.productId,
            variants: {
              $elemMatch: {
                _id: item.variantId,
                stock: { $gte: item.quantity },
                trackInventory: true,
              },
            },
          },
          {
            $inc: {
              'variants.$.stock': -item.quantity,
              soldCount: item.quantity,
            },
          },
          { new: true }
        );

        if (!result) {
          throw new ConflictError(
            `Insufficient stock for SKU ${item.sku || item.variantId}`
          );
        }

        // Refresh totalStock denorm
        const fresh = await productRepository.findById(item.productId);
        if (fresh) {
          fresh.totalStock = fresh.variants
            .filter((v) => v.trackInventory)
            .reduce((sum, v) => sum + v.stock, 0);
          await productRepository.save(fresh);
        }
      } else {
        product.soldCount = (product.soldCount || 0) + item.quantity;
        await productRepository.save(product);
      }
    }
  }

  async restockForOrderItems(items) {
    for (const item of items) {
      const product = await productRepository.findById(item.productId);
      if (!product) continue;

      const variant = product.variants.id(item.variantId);
      if (!variant) continue;

      if (variant.trackInventory) {
        variant.stock += item.quantity;
      }
      product.soldCount = Math.max(0, (product.soldCount || 0) - item.quantity);
      product.totalStock = product.variants
        .filter((v) => v.trackInventory)
        .reduce((sum, v) => sum + v.stock, 0);

      await productRepository.save(product);
    }
  }
}

export default new InventoryService();
