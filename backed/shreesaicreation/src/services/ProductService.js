import productRepository from '../repositories/product.repository.js';
import categoryRepository from '../repositories/category.repository.js';
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../utilities/apiResponse.js';
import { slugify, ensureUniqueSlug } from '../utilities/slugify.js';
import { rupeesToPaise, paiseToRupees } from '../utilities/money.js';
import {
  PUBLIC_PRODUCT_SORTS,
  PRODUCT_TYPES,
  PRODUCT_STYLES,
  MOUNT_TYPES,
  ROOM_TYPES,
} from '../constants/lighting.constants.js';

function toPaise(value, fieldName) {
  if (value === null || value === undefined || value === '') return null;
  if (Number.isInteger(value) && value >= 1000) {
    // Heuristic: callers may already send paise; prefer explicit *InPaise fields
  }
  return rupeesToPaise(value);
}

function normalizeVariantInput(raw, { index = 0, forceDefault = false } = {}) {
  const priceInPaise =
    raw.priceInPaise !== undefined && raw.priceInPaise !== null
      ? Number(raw.priceInPaise)
      : toPaise(raw.price);

  if (priceInPaise === null || Number.isNaN(priceInPaise)) {
    throw new ValidationError(`Variant[${index}] price is required`);
  }

  const compareAtPriceInPaise =
    raw.compareAtPriceInPaise !== undefined
      ? raw.compareAtPriceInPaise
      : raw.compareAtPrice !== undefined
        ? toPaise(raw.compareAtPrice)
        : null;

  const costPriceInPaise =
    raw.costPriceInPaise !== undefined
      ? raw.costPriceInPaise
      : raw.costPrice !== undefined
        ? toPaise(raw.costPrice)
        : null;

  if (!raw.sku || !String(raw.sku).trim()) {
    throw new ValidationError(`Variant[${index}] sku is required`);
  }

  return {
    title: raw.title || raw.variantName || (forceDefault ? 'Default' : `Variant ${index + 1}`),
    sku: String(raw.sku).trim().toUpperCase(),
    barcode: raw.barcode || null,
    options: raw.options || {},
    priceInPaise,
    compareAtPriceInPaise,
    costPriceInPaise,
    stock: Number(raw.stock ?? 0),
    trackInventory: raw.trackInventory !== false,
    allowBackorder: Boolean(raw.allowBackorder),
    lowStockThreshold: Number(raw.lowStockThreshold ?? 2),
    images: raw.images || [],
    dimensions: raw.dimensions || {},
    package: raw.package || {},
    weightKg: raw.weightKg ?? null,
    isDefault: Boolean(raw.isDefault) || forceDefault,
    isActive: raw.isActive !== false,
    position: Number(raw.position ?? index),
  };
}

function ensureDefaultVariant(variants) {
  if (!variants.length) {
    throw new ValidationError('Product must have at least one variant');
  }

  const defaults = variants.filter((v) => v.isDefault);
  if (defaults.length === 0) {
    variants[0].isDefault = true;
  } else if (defaults.length > 1) {
    let kept = false;
    for (const v of variants) {
      if (v.isDefault && !kept) {
        kept = true;
      } else {
        v.isDefault = false;
      }
    }
  }

  return variants;
}

function deriveDenorm(variants) {
  const active = variants.filter((v) => v.isActive !== false);
  const prices = active.map((v) => v.priceInPaise);
  const stocks = active.map((v) => (v.trackInventory ? v.stock : 0));

  return {
    fromPriceInPaise: prices.length ? Math.min(...prices) : 0,
    totalStock: stocks.reduce((a, b) => a + b, 0),
    hasOnlyDefaultVariant:
      variants.length === 1 &&
      (variants[0].title === 'Default' ||
        !variants[0].options ||
        (typeof variants[0].options === 'object' &&
          Object.keys(
            variants[0].options instanceof Map
              ? Object.fromEntries(variants[0].options)
              : variants[0].options
          ).length === 0)),
  };
}

function serializeProduct(product) {
  const obj = product.toObject ? product.toObject() : { ...product };
  obj.fromPrice = paiseToRupees(obj.fromPriceInPaise);
  if (Array.isArray(obj.variants)) {
    obj.variants = obj.variants.map((v) => ({
      ...v,
      price: paiseToRupees(v.priceInPaise),
      compareAtPrice: paiseToRupees(v.compareAtPriceInPaise),
      costPrice: paiseToRupees(v.costPriceInPaise),
      options:
        v.options instanceof Map ? Object.fromEntries(v.options) : v.options || {},
    }));
  }
  return obj;
}

async function assertSkusUnique(variants, excludeProductId = null) {
  const skus = variants.map((v) => v.sku);
  const unique = new Set(skus);
  if (unique.size !== skus.length) {
    throw new ConflictError('Duplicate SKUs in variant payload');
  }

  for (const sku of skus) {
    const existing = await productRepository.findByVariantSku(sku, excludeProductId);
    if (existing) {
      throw new ConflictError(`SKU already exists: ${sku}`);
    }
  }
}

class ProductService {
  async create(payload) {
    const baseSlug = slugify(payload.slug || payload.name);
    if (!baseSlug) throw new ValidationError('Valid name or slug is required');

    const existingSlugs = await productRepository.listSlugs();
    const slug = ensureUniqueSlug(
      baseSlug,
      existingSlugs.map((p) => p.slug)
    );

    let variants;
    if (Array.isArray(payload.variants) && payload.variants.length > 0) {
      variants = payload.variants.map((v, index) =>
        normalizeVariantInput(v, { index })
      );
    } else {
      // Single-SKU product → auto-create first Default variant
      variants = [
        normalizeVariantInput(
          {
            title: 'Default',
            sku: payload.sku,
            price: payload.price,
            priceInPaise: payload.priceInPaise,
            compareAtPrice: payload.compareAtPrice,
            compareAtPriceInPaise: payload.compareAtPriceInPaise,
            costPrice: payload.costPrice,
            costPriceInPaise: payload.costPriceInPaise,
            stock: payload.stock ?? 0,
            trackInventory: payload.trackInventory,
            allowBackorder: payload.allowBackorder,
            lowStockThreshold: payload.lowStockThreshold,
            barcode: payload.barcode,
            images: payload.variantImages || [],
            dimensions: payload.dimensions,
            package: payload.package,
            weightKg: payload.weightKg,
            isDefault: true,
          },
          { index: 0, forceDefault: true }
        ),
      ];
    }

    variants = ensureDefaultVariant(variants);
    await assertSkusUnique(variants);

    const denorm = deriveDenorm(variants);
    const status = payload.status || 'draft';

    const {
      price,
      priceInPaise,
      compareAtPrice,
      stock,
      sku,
      variants: _v,
      ...rest
    } = payload;

    const product = await productRepository.create({
      ...rest,
      slug,
      variants,
      ...denorm,
      status,
      publishedAt: status === 'published' ? new Date() : null,
    });

    if (product.categoryIds?.length) {
      await categoryRepository.incrementProductCount(product.categoryIds, 1);
    }

    return { product: serializeProduct(product) };
  }

  async listAdmin({
    page = 1,
    limit = 24,
    status,
    search,
    categoryId,
    sort = 'newest',
  } = {}) {
    const filter = {};
    if (status) filter.status = status;
    if (categoryId) filter.categoryIds = categoryId;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'variants.sku': { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const sortSpec = PUBLIC_PRODUCT_SORTS[sort] || { createdAt: -1 };
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      productRepository.findMany(filter, {
        sort: sortSpec,
        skip,
        limit,
        populate: true,
      }),
      productRepository.count(filter),
    ]);

    return {
      products: items.map(serializeProduct),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  buildPublicFilter(query) {
    const filter = {
      status: 'published',
      visibility: 'public',
    };

    if (query.category) {
      filter.categoryIds = query.category;
    }
    if (query.collection) {
      filter.collectionIds = query.collection;
    }
    if (query.productType) filter.productType = query.productType;
    if (query.style) filter.style = query.style;
    if (query.mountType) filter.mountType = query.mountType;
    if (query.roomType) filter.roomTypes = query.roomType;
    if (query.finish) filter.finish = query.finish;
    if (query.material) filter.materials = query.material;
    if (query.dimmable === 'true' || query.dimmable === true) filter.dimmable = true;
    if (query.ipRating) filter.ipRating = query.ipRating;
    if (query.isFeatured === 'true' || query.isFeatured === true) {
      filter.isFeatured = true;
    }
    if (query.isBestSeller === 'true' || query.isBestSeller === true) {
      filter.isBestSeller = true;
    }
    if (query.isNewArrival === 'true' || query.isNewArrival === true) {
      filter.isNewArrival = true;
    }
    if (query.numberOfLights) {
      filter.numberOfLights = Number(query.numberOfLights);
    }

    if (query.minPrice || query.maxPrice) {
      filter.fromPriceInPaise = {};
      if (query.minPrice) {
        filter.fromPriceInPaise.$gte = rupeesToPaise(query.minPrice);
      }
      if (query.maxPrice) {
        filter.fromPriceInPaise.$lte = rupeesToPaise(query.maxPrice);
      }
    }

    if (query.inStock === 'true' || query.inStock === true) {
      filter.totalStock = { $gt: 0 };
    }

    if (query.q) {
      filter.$text = { $search: query.q };
    }

    return filter;
  }

  async listPublic(query = {}) {
    const page = Number(query.page || 1);
    const limit = Math.min(Number(query.limit || 24), 100);
    const skip = (page - 1) * limit;
    const sortKey = query.sort || 'newest';
    const sort = PUBLIC_PRODUCT_SORTS[sortKey] || PUBLIC_PRODUCT_SORTS.newest;

    const filter = this.buildPublicFilter(query);

    const [items, total] = await Promise.all([
      productRepository.findMany(filter, {
        sort,
        skip,
        limit,
        populate: true,
      }),
      productRepository.count(filter),
    ]);

    return {
      products: items.map(serializeProduct),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  async searchPublic(q, query = {}) {
    if (!q || !String(q).trim()) {
      throw new ValidationError('q is required');
    }
    return this.listPublic({ ...query, q: String(q).trim() });
  }

  async getBySlugPublic(slug) {
    const product = await productRepository.findPublishedBySlug(slug);
    if (!product) throw new NotFoundError('Product not found');
    return { product: serializeProduct(product) };
  }

  async getById(id) {
    const product = await productRepository.findById(id);
    if (!product) throw new NotFoundError('Product not found');
    return { product: serializeProduct(product) };
  }

  async update(id, payload) {
    const product = await productRepository.findById(id);
    if (!product) throw new NotFoundError('Product not found');

    const update = { ...payload };
    delete update.variants;
    delete update.sku;
    delete update.price;
    delete update.priceInPaise;
    delete update.stock;

    if (update.slug || update.name) {
      const baseSlug = slugify(update.slug || update.name || product.name);
      if (baseSlug && baseSlug !== product.slug) {
        const existing = await productRepository.listSlugs();
        update.slug = ensureUniqueSlug(
          baseSlug,
          existing.filter((p) => p.slug !== product.slug).map((p) => p.slug)
        );
      } else {
        delete update.slug;
      }
    }

    if (update.status === 'published' && product.status !== 'published') {
      update.publishedAt = new Date();
    }

    const prevCategoryIds = (product.categoryIds || []).map(String);
    const updated = await productRepository.updateById(id, { $set: update });

    if (update.categoryIds) {
      const next = update.categoryIds.map(String);
      const removed = prevCategoryIds.filter((c) => !next.includes(c));
      const added = next.filter((c) => !prevCategoryIds.includes(c));
      if (removed.length) await categoryRepository.incrementProductCount(removed, -1);
      if (added.length) await categoryRepository.incrementProductCount(added, 1);
    }

    return { product: serializeProduct(updated) };
  }

  async updateStatus(id, status) {
    if (!['draft', 'published', 'archived'].includes(status)) {
      throw new ValidationError('Invalid status');
    }
    const product = await productRepository.findById(id);
    if (!product) throw new NotFoundError('Product not found');

    const update = { status };
    if (status === 'published' && product.status !== 'published') {
      update.publishedAt = new Date();
    }

    const updated = await productRepository.updateById(id, { $set: update });
    return { product: serializeProduct(updated) };
  }

  async remove(id) {
    const product = await productRepository.findById(id);
    if (!product) throw new NotFoundError('Product not found');

    if (product.categoryIds?.length) {
      await categoryRepository.incrementProductCount(product.categoryIds, -1);
    }

    await productRepository.softDelete(id);
    return { message: 'Product deleted' };
  }

  async addVariant(productId, rawVariant) {
    const product = await productRepository.findById(productId);
    if (!product) throw new NotFoundError('Product not found');

    const variant = normalizeVariantInput(rawVariant, {
      index: product.variants.length,
    });
    await assertSkusUnique([variant], productId);

    product.variants.push(variant);
    const variants = ensureDefaultVariant(
      product.variants.map((v) => {
        const o = v.toObject ? v.toObject() : v;
        return {
          ...o,
          options: o.options instanceof Map ? Object.fromEntries(o.options) : o.options,
        };
      })
    );

    // Re-apply flags on mongoose subdocs
    product.variants.forEach((v, i) => {
      v.isDefault = Boolean(variants[i]?.isDefault);
    });

    const denorm = deriveDenorm(
      product.variants.map((v) => (v.toObject ? v.toObject() : v))
    );
    product.hasOnlyDefaultVariant = denorm.hasOnlyDefaultVariant;
    product.fromPriceInPaise = denorm.fromPriceInPaise;
    product.totalStock = denorm.totalStock;

    await productRepository.save(product);
    return { product: serializeProduct(product) };
  }

  async updateVariant(productId, variantId, rawUpdate) {
    const product = await productRepository.findById(productId);
    if (!product) throw new NotFoundError('Product not found');

    const variant = product.variants.id(variantId);
    if (!variant) throw new NotFoundError('Variant not found');

    const merged = {
      title: rawUpdate.title ?? variant.title,
      sku: rawUpdate.sku ?? variant.sku,
      barcode: rawUpdate.barcode ?? variant.barcode,
      options:
        rawUpdate.options ??
        (variant.options instanceof Map
          ? Object.fromEntries(variant.options)
          : variant.options),
      priceInPaise:
        rawUpdate.priceInPaise !== undefined
          ? rawUpdate.priceInPaise
          : rawUpdate.price !== undefined
            ? toPaise(rawUpdate.price)
            : variant.priceInPaise,
      compareAtPriceInPaise:
        rawUpdate.compareAtPriceInPaise !== undefined
          ? rawUpdate.compareAtPriceInPaise
          : rawUpdate.compareAtPrice !== undefined
            ? toPaise(rawUpdate.compareAtPrice)
            : variant.compareAtPriceInPaise,
      costPriceInPaise:
        rawUpdate.costPriceInPaise !== undefined
          ? rawUpdate.costPriceInPaise
          : rawUpdate.costPrice !== undefined
            ? toPaise(rawUpdate.costPrice)
            : variant.costPriceInPaise,
      stock: rawUpdate.stock !== undefined ? rawUpdate.stock : variant.stock,
      trackInventory:
        rawUpdate.trackInventory !== undefined
          ? rawUpdate.trackInventory
          : variant.trackInventory,
      allowBackorder:
        rawUpdate.allowBackorder !== undefined
          ? rawUpdate.allowBackorder
          : variant.allowBackorder,
      lowStockThreshold:
        rawUpdate.lowStockThreshold !== undefined
          ? rawUpdate.lowStockThreshold
          : variant.lowStockThreshold,
      images: rawUpdate.images ?? variant.images,
      dimensions: rawUpdate.dimensions ?? variant.dimensions,
      package: rawUpdate.package ?? variant.package,
      weightKg: rawUpdate.weightKg ?? variant.weightKg,
      isDefault:
        rawUpdate.isDefault !== undefined ? rawUpdate.isDefault : variant.isDefault,
      isActive: rawUpdate.isActive !== undefined ? rawUpdate.isActive : variant.isActive,
      position: rawUpdate.position !== undefined ? rawUpdate.position : variant.position,
    };

    const normalized = normalizeVariantInput(merged, { index: 0 });
    if (normalized.sku !== variant.sku) {
      await assertSkusUnique([normalized], productId);
    }

    Object.assign(variant, normalized);

    const asPlain = product.variants.map((v) => {
      const o = v.toObject ? v.toObject() : v;
      return {
        ...o,
        options: o.options instanceof Map ? Object.fromEntries(o.options) : o.options,
      };
    });
    ensureDefaultVariant(asPlain);
    product.variants.forEach((v, i) => {
      v.isDefault = Boolean(asPlain[i]?.isDefault);
    });

    const denorm = deriveDenorm(asPlain);
    product.hasOnlyDefaultVariant = denorm.hasOnlyDefaultVariant;
    product.fromPriceInPaise = denorm.fromPriceInPaise;
    product.totalStock = denorm.totalStock;

    await productRepository.save(product);
    return { product: serializeProduct(product) };
  }

  async removeVariant(productId, variantId) {
    const product = await productRepository.findById(productId);
    if (!product) throw new NotFoundError('Product not found');

    if (product.variants.length <= 1) {
      throw new ConflictError(
        'Cannot delete the only variant. Archive the product instead.'
      );
    }

    const variant = product.variants.id(variantId);
    if (!variant) throw new NotFoundError('Variant not found');

    const wasDefault = variant.isDefault;
    variant.deleteOne();

    const asPlain = product.variants.map((v) => {
      const o = v.toObject ? v.toObject() : v;
      return {
        ...o,
        options: o.options instanceof Map ? Object.fromEntries(o.options) : o.options,
      };
    });

    if (wasDefault && asPlain.length) {
      asPlain[0].isDefault = true;
    }
    ensureDefaultVariant(asPlain);
    product.variants.forEach((v, i) => {
      v.isDefault = Boolean(asPlain[i]?.isDefault);
    });

    const denorm = deriveDenorm(asPlain);
    product.hasOnlyDefaultVariant = denorm.hasOnlyDefaultVariant;
    product.fromPriceInPaise = denorm.fromPriceInPaise;
    product.totalStock = denorm.totalStock;

    await productRepository.save(product);
    return { product: serializeProduct(product) };
  }

  async attachMedia(productId, { images, lifestyleImages, videos, brochurePdf } = {}) {
    const product = await productRepository.findById(productId);
    if (!product) throw new NotFoundError('Product not found');

    const update = {};
    if (images) update.images = images;
    if (lifestyleImages) update.lifestyleImages = lifestyleImages;
    if (videos) update.videos = videos;
    if (brochurePdf) update.brochurePdf = brochurePdf;

    const updated = await productRepository.updateById(productId, { $set: update });
    return { product: serializeProduct(updated) };
  }

  async getFilters() {
    return {
      productTypes: PRODUCT_TYPES,
      styles: PRODUCT_STYLES,
      mountTypes: MOUNT_TYPES,
      roomTypes: ROOM_TYPES,
      sorts: Object.keys(PUBLIC_PRODUCT_SORTS),
    };
  }
}

export default new ProductService();
