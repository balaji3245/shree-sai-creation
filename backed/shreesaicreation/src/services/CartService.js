import { nanoid } from 'nanoid';
import cartRepository from '../repositories/cart.repository.js';
import productRepository from '../repositories/product.repository.js';
import storeSettingsRepository from '../repositories/storeSettings.repository.js';
import CouponService from './CouponService.js';
import InventoryService from './InventoryService.js';
import {
  NotFoundError,
  ValidationError,
} from '../utilities/apiResponse.js';
import { paiseToRupees } from '../utilities/money.js';

function primaryImage(product, variant) {
  if (variant?.images?.length) {
    const p = variant.images.find((i) => i.isPrimary) || variant.images[0];
    return p?.url || null;
  }
  if (product?.images?.length) {
    const p = product.images.find((i) => i.isPrimary) || product.images[0];
    return p?.url || null;
  }
  return null;
}

class CartService {
  async resolveCart({ userId, guestToken, createIfMissing = true }) {
    let cart = null;
    if (userId) {
      cart = await cartRepository.findByUserId(userId);
      if (!cart && createIfMissing) {
        cart = await cartRepository.create({ userId, items: [] });
      }
    } else if (guestToken) {
      cart = await cartRepository.findByGuestToken(guestToken);
      if (!cart && createIfMissing) {
        cart = await cartRepository.create({ guestToken, items: [] });
      }
    } else if (createIfMissing) {
      const token = `gst_${nanoid(24)}`;
      cart = await cartRepository.create({ guestToken: token, items: [] });
    }
    return cart;
  }

  async getCart(ctx) {
    const cart = await this.resolveCart({ ...ctx, createIfMissing: true });
    const summary = await this.buildSummary(cart, ctx);
    return {
      cart: this.serializeCart(cart),
      summary,
      guestToken: cart.guestToken || null,
    };
  }

  serializeCart(cart) {
    const obj = cart.toObject ? cart.toObject() : { ...cart };
    return obj;
  }

  async addItem(ctx, { productId, variantId, quantity = 1 }) {
    if (!productId || !variantId) {
      throw new ValidationError('productId and variantId are required');
    }
    const qty = Number(quantity) || 1;
    if (qty < 1) throw new ValidationError('quantity must be at least 1');

    const { product, variant } = await InventoryService.assertAvailable(
      productId,
      variantId,
      qty
    );

    const cart = await this.resolveCart({ ...ctx, createIfMissing: true });
    const existing = cart.items.find(
      (i) =>
        String(i.productId) === String(productId) &&
        String(i.variantId) === String(variantId)
    );

    if (existing) {
      const newQty = existing.quantity + qty;
      await InventoryService.assertAvailable(productId, variantId, newQty);
      existing.quantity = newQty;
      existing.unitPriceInPaise = variant.priceInPaise;
    } else {
      cart.items.push({
        productId,
        variantId,
        quantity: qty,
        productName: product.name,
        variantTitle: variant.title,
        sku: variant.sku,
        unitPriceInPaise: variant.priceInPaise,
        imageUrl: primaryImage(product, variant),
      });
    }

    await cartRepository.save(cart);
    const summary = await this.buildSummary(cart, ctx);
    return {
      cart: this.serializeCart(cart),
      summary,
      guestToken: cart.guestToken || null,
    };
  }

  async updateItem(ctx, itemId, { quantity }) {
    const cart = await this.resolveCart({ ...ctx, createIfMissing: false });
    if (!cart) throw new NotFoundError('Cart not found');

    const item = cart.items.id(itemId);
    if (!item) throw new NotFoundError('Cart item not found');

    const qty = Number(quantity);
    if (!qty || qty < 1) {
      item.deleteOne();
    } else {
      await InventoryService.assertAvailable(item.productId, item.variantId, qty);
      item.quantity = qty;
      // refresh price snapshot
      const product = await productRepository.findById(item.productId);
      const variant = product?.variants?.id(item.variantId);
      if (variant) item.unitPriceInPaise = variant.priceInPaise;
    }

    await cartRepository.save(cart);
    const summary = await this.buildSummary(cart, ctx);
    return { cart: this.serializeCart(cart), summary };
  }

  async removeItem(ctx, itemId) {
    const cart = await this.resolveCart({ ...ctx, createIfMissing: false });
    if (!cart) throw new NotFoundError('Cart not found');
    const item = cart.items.id(itemId);
    if (!item) throw new NotFoundError('Cart item not found');
    item.deleteOne();
    await cartRepository.save(cart);
    const summary = await this.buildSummary(cart, ctx);
    return { cart: this.serializeCart(cart), summary };
  }

  async clear(ctx) {
    const cart = await this.resolveCart({ ...ctx, createIfMissing: false });
    if (!cart) return { cart: { items: [] }, summary: this.emptySummary() };
    cart.items = [];
    cart.couponCode = null;
    await cartRepository.save(cart);
    return { cart: this.serializeCart(cart), summary: this.emptySummary() };
  }

  async applyCoupon(ctx, code) {
    const cart = await this.resolveCart({ ...ctx, createIfMissing: false });
    if (!cart || !cart.items.length) {
      throw new ValidationError('Cart is empty');
    }
    cart.couponCode = String(code).trim().toUpperCase();
    await cartRepository.save(cart);
    const summary = await this.buildSummary(cart, ctx);
    return { cart: this.serializeCart(cart), summary };
  }

  async removeCoupon(ctx) {
    const cart = await this.resolveCart({ ...ctx, createIfMissing: false });
    if (!cart) throw new NotFoundError('Cart not found');
    cart.couponCode = null;
    await cartRepository.save(cart);
    const summary = await this.buildSummary(cart, ctx);
    return { cart: this.serializeCart(cart), summary };
  }

  async merge(userId, guestToken) {
    if (!guestToken) {
      return this.getCart({ userId });
    }

    const guestCart = await cartRepository.findByGuestToken(guestToken);
    let userCart = await cartRepository.findByUserId(userId);
    if (!userCart) {
      userCart = await cartRepository.create({ userId, items: [] });
    }

    if (guestCart?.items?.length) {
      for (const gItem of guestCart.items) {
        const existing = userCart.items.find(
          (i) =>
            String(i.productId) === String(gItem.productId) &&
            String(i.variantId) === String(gItem.variantId)
        );
        if (existing) {
          existing.quantity += gItem.quantity;
        } else {
          userCart.items.push({
            productId: gItem.productId,
            variantId: gItem.variantId,
            quantity: gItem.quantity,
            productName: gItem.productName,
            variantTitle: gItem.variantTitle,
            sku: gItem.sku,
            unitPriceInPaise: gItem.unitPriceInPaise,
            imageUrl: gItem.imageUrl,
          });
        }
      }
      if (guestCart.couponCode && !userCart.couponCode) {
        userCart.couponCode = guestCart.couponCode;
      }
      await cartRepository.save(userCart);
      await cartRepository.deleteById(guestCart._id);
    }

    return this.getCart({ userId });
  }

  emptySummary() {
    return {
      itemCount: 0,
      subtotalInPaise: 0,
      discountInPaise: 0,
      shippingInPaise: 0,
      taxInPaise: 0,
      grandTotalInPaise: 0,
      subtotal: 0,
      discount: 0,
      shipping: 0,
      tax: 0,
      grandTotal: 0,
      couponCode: null,
      freeShipping: false,
      currency: 'INR',
    };
  }

  async buildSummary(cart, ctx = {}) {
    if (!cart?.items?.length) return this.emptySummary();

    // Revalidate live prices & availability
    let subtotalInPaise = 0;
    const lineItems = [];

    for (const item of cart.items) {
      const product = await productRepository.findById(item.productId);
      if (!product || product.status !== 'published' || product.visibility !== 'public') {
        throw new ValidationError(`Product unavailable: ${item.productName}`);
      }
      const variant = product.variants.id(item.variantId);
      if (!variant || !variant.isActive) {
        throw new ValidationError(`Variant unavailable: ${item.sku}`);
      }
      if (
        variant.trackInventory &&
        !variant.allowBackorder &&
        variant.stock < item.quantity
      ) {
        throw new ValidationError(
          `Insufficient stock for ${variant.sku} (available: ${variant.stock})`
        );
      }

      // Refresh snapshot prices
      item.unitPriceInPaise = variant.priceInPaise;
      item.productName = product.name;
      item.variantTitle = variant.title;
      item.sku = variant.sku;

      const lineTotal = variant.priceInPaise * item.quantity;
      subtotalInPaise += lineTotal;
      lineItems.push({
        productId: product._id,
        variantId: variant._id,
        categoryIds: product.categoryIds || [],
        quantity: item.quantity,
        unitPriceInPaise: variant.priceInPaise,
        lineTotalInPaise: lineTotal,
        taxPercent: product.taxPercent ?? 18,
        hsnCode: product.hsnCode || '9405',
        productName: product.name,
        variantTitle: variant.title,
        sku: variant.sku,
        imageUrl: primaryImage(product, variant),
        product,
        variant,
      });
    }

    await cartRepository.save(cart);

    let discountInPaise = 0;
    let freeShipping = false;
    let couponCode = cart.couponCode || null;

    if (couponCode) {
      try {
        const applied = await CouponService.validateForCart({
          code: couponCode,
          subtotalInPaise,
          items: lineItems,
          userId: ctx.userId || null,
          email: ctx.email || null,
        });
        discountInPaise = applied.discountInPaise;
        freeShipping = applied.freeShipping;
        couponCode = applied.code;
      } catch {
        // Invalid coupon — clear silently on summary (or keep and surface)
        couponCode = cart.couponCode;
        discountInPaise = 0;
      }
    }

    const settings = await storeSettingsRepository.findDefault();
    const threshold = settings?.freeShippingThresholdInPaise || 0;
    const flatFee = settings?.flatShippingFeeInPaise || 0;
    const afterDiscount = Math.max(0, subtotalInPaise - discountInPaise);

    let shippingInPaise = 0;
    if (freeShipping || (threshold > 0 && afterDiscount >= threshold)) {
      shippingInPaise = 0;
      freeShipping = true;
    } else {
      shippingInPaise = flatFee;
    }

    // Tax inclusive assumption: tax portion of taxable amount
    const taxable = afterDiscount;
    const avgTax =
      lineItems.length > 0
        ? lineItems.reduce((s, i) => s + (i.taxPercent || 18), 0) / lineItems.length
        : 18;
    const taxInPaise = Math.round(taxable - taxable / (1 + avgTax / 100));

    const grandTotalInPaise = afterDiscount + shippingInPaise;

    return {
      itemCount: cart.items.reduce((s, i) => s + i.quantity, 0),
      subtotalInPaise,
      discountInPaise,
      shippingInPaise,
      taxInPaise,
      grandTotalInPaise,
      subtotal: paiseToRupees(subtotalInPaise),
      discount: paiseToRupees(discountInPaise),
      shipping: paiseToRupees(shippingInPaise),
      tax: paiseToRupees(taxInPaise),
      grandTotal: paiseToRupees(grandTotalInPaise),
      couponCode,
      freeShipping,
      currency: 'INR',
      lineItems,
    };
  }

  async quoteShipping(ctx, address = {}) {
    const cart = await this.resolveCart({ ...ctx, createIfMissing: false });
    if (!cart?.items?.length) {
      throw new ValidationError('Cart is empty');
    }
    const summary = await this.buildSummary(cart, ctx);

    const ShippingService = (await import('./ShippingService.js')).default;
    const quote = await ShippingService.quoteForAddress({
      state: address.state,
      pincode: address.pincode,
      afterDiscountInPaise: Math.max(
        0,
        summary.subtotalInPaise - summary.discountInPaise
      ),
      freeShippingCoupon: summary.freeShipping,
    });

    // Prefer zone quote shipping for first/default method when summarizing
    const preferred =
      quote.methods.find((m) => m.id === 'standard') || quote.methods[0];
    if (preferred) {
      summary.shippingInPaise = preferred.amountInPaise;
      summary.shipping = preferred.amount;
      summary.grandTotalInPaise =
        Math.max(0, summary.subtotalInPaise - summary.discountInPaise) +
        preferred.amountInPaise;
      summary.grandTotal = summary.grandTotalInPaise / 100;
      summary.freeShipping = quote.freeShipping;
    }

    return {
      methods: quote.methods,
      matchedZone: quote.matchedZone,
      summary,
    };
  }
}

export default new CartService();
