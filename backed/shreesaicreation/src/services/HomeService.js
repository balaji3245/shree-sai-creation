import homeSectionRepository from '../repositories/homeSection.repository.js';
import bannerRepository from '../repositories/banner.repository.js';
import categoryRepository from '../repositories/category.repository.js';
import productRepository from '../repositories/product.repository.js';
import storeSettingsRepository from '../repositories/storeSettings.repository.js';
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../utilities/apiResponse.js';
import {
  getCachedHome,
  setCachedHome,
  invalidateHomeCache,
} from '../utilities/homeCache.js';
import { paiseToRupees } from '../utilities/money.js';
import { HOME_SECTION_TYPES } from '../constants/cms.constants.js';

function serializeProductCard(product) {
  const obj = product.toObject ? product.toObject() : product;
  const defaultVariant =
    (obj.variants || []).find((v) => v.isDefault) || obj.variants?.[0];
  return {
    _id: obj._id,
    name: obj.name,
    slug: obj.slug,
    images: obj.images || [],
    fromPriceInPaise: obj.fromPriceInPaise,
    fromPrice: paiseToRupees(obj.fromPriceInPaise),
    hasOnlyDefaultVariant: obj.hasOnlyDefaultVariant,
    isFeatured: obj.isFeatured,
    isBestSeller: obj.isBestSeller,
    isNewArrival: obj.isNewArrival,
    defaultVariantId: defaultVariant?._id || null,
  };
}

class HomeService {
  async createSection(payload) {
    if (!HOME_SECTION_TYPES.includes(payload.type)) {
      throw new ValidationError('Invalid section type');
    }
    if (!payload.sectionKey) {
      throw new ValidationError('sectionKey is required');
    }
    const existing = await homeSectionRepository.findByKey(payload.sectionKey);
    if (existing) throw new ConflictError('sectionKey already exists');

    const section = await homeSectionRepository.create(payload);
    await invalidateHomeCache();
    return { section };
  }

  async listAdmin() {
    const sections = await homeSectionRepository.findMany({}, { limit: 200 });
    return { sections };
  }

  async updateSection(id, payload) {
    const section = await homeSectionRepository.findById(id);
    if (!section) throw new NotFoundError('Section not found');
    if (payload.sectionKey && payload.sectionKey !== section.sectionKey) {
      const clash = await homeSectionRepository.findByKey(payload.sectionKey);
      if (clash) throw new ConflictError('sectionKey already exists');
    }
    const updated = await homeSectionRepository.updateById(id, { $set: payload });
    await invalidateHomeCache();
    return { section: updated };
  }

  async reorder(items) {
    if (!Array.isArray(items) || !items.length) {
      throw new ValidationError('items required');
    }
    await homeSectionRepository.bulkReorder(items);
    await invalidateHomeCache();
    return { message: 'Sections reordered' };
  }

  async removeSection(id) {
    const section = await homeSectionRepository.findById(id);
    if (!section) throw new NotFoundError('Section not found');
    await homeSectionRepository.softDelete(id);
    await invalidateHomeCache();
    return { message: 'Section deleted' };
  }

  async resolveSectionProducts(section) {
    const limit = section.itemLimit || 8;
    let filter = {
      status: 'published',
      visibility: 'public',
    };

    switch (section.dataSource) {
      case 'featured':
        filter.isFeatured = true;
        break;
      case 'best_seller':
        filter.isBestSeller = true;
        break;
      case 'new_arrival':
        filter.isNewArrival = true;
        break;
      case 'category':
        if (section.sourceId) filter.categoryIds = section.sourceId;
        break;
      case 'collection':
        if (section.sourceId) filter.collectionIds = section.sourceId;
        break;
      case 'custom':
        if (section.customProductIds?.length) {
          filter._id = { $in: section.customProductIds };
        } else {
          return [];
        }
        break;
      default:
        return [];
    }

    const products = await productRepository.findMany(filter, {
      limit,
      sort: { sortOrder: 1, soldCount: -1, createdAt: -1 },
    });
    return products.map(serializeProductCard);
  }

  async assembleHome({ bypassCache = false } = {}) {
    if (!bypassCache) {
      const cached = await getCachedHome();
      if (cached) return { ...cached, cached: true };
    }

    const [banners, sections, featuredCategories, settings] = await Promise.all([
      bannerRepository.findActive('home_hero'),
      homeSectionRepository.findActive(),
      categoryRepository.findMany(
        { isActive: true, isFeatured: true },
        { limit: 12, sort: { sortOrder: 1 } }
      ),
      storeSettingsRepository.findDefault(),
    ]);

    const assembledSections = [];
    for (const section of sections) {
      const base = section.toObject ? section.toObject() : { ...section };
      const entry = {
        _id: base._id,
        sectionKey: base.sectionKey,
        type: base.type,
        title: base.title,
        subtitle: base.subtitle,
        displayConfig: base.displayConfig || {},
        items: base.items || [],
        htmlContent: base.htmlContent || '',
        ctaText: base.ctaText || '',
        ctaLink: base.ctaLink || '',
        imageUrl: base.imageUrl || null,
        dataSource: base.dataSource,
        products: [],
        banners: [],
        categories: [],
      };

      if (['product_rail', 'product_grid'].includes(base.type)) {
        entry.products = await this.resolveSectionProducts(section);
      }
      if (base.type === 'hero_banner') {
        entry.banners = banners;
      }
      if (base.type === 'category_grid') {
        entry.categories = featuredCategories;
      }

      assembledSections.push(entry);
    }

    // If no hero_banner section, still expose hero banners at top level
    const payload = {
      banners,
      sections: assembledSections,
      featuredCategories,
      store: settings
        ? {
            storeName: settings.storeName,
            tagline: settings.tagline,
            whatsappNumber: settings.whatsappNumber,
            social: settings.social,
            logoUrl: settings.logoUrl,
          }
        : null,
      cached: false,
    };

    await setCachedHome(payload);
    return payload;
  }
}

export default new HomeService();
