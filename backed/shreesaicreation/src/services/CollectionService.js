import collectionRepository from '../repositories/collection.repository.js';
import {
  NotFoundError,
  ValidationError,
} from '../utilities/apiResponse.js';
import { slugify, ensureUniqueSlug } from '../utilities/slugify.js';

class CollectionService {
  async create(payload) {
    const baseSlug = slugify(payload.slug || payload.name);
    if (!baseSlug) throw new ValidationError('Valid name or slug is required');

    const existing = await collectionRepository.listSlugs();
    const slug = ensureUniqueSlug(
      baseSlug,
      existing.map((c) => c.slug)
    );

    return collectionRepository.create({
      ...payload,
      slug,
      productIds: payload.productIds || [],
    });
  }

  async listAdmin({ page = 1, limit = 50, isActive, search } = {}) {
    const filter = {};
    if (typeof isActive === 'boolean') filter.isActive = isActive;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      collectionRepository.findMany(filter, { skip, limit }),
      collectionRepository.count(filter),
    ]);

    return {
      collections: items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  async listPublic() {
    const collections = await collectionRepository.findMany(
      { isActive: true },
      { sort: { sortOrder: 1, name: 1 }, limit: 100 }
    );
    return { collections };
  }

  async getBySlugPublic(slug) {
    const collection = await collectionRepository.findBySlug(slug);
    if (!collection || !collection.isActive) {
      throw new NotFoundError('Collection not found');
    }
    return { collection };
  }

  async getById(id) {
    const collection = await collectionRepository.findById(id);
    if (!collection) throw new NotFoundError('Collection not found');
    return { collection };
  }

  async update(id, payload) {
    const collection = await collectionRepository.findById(id);
    if (!collection) throw new NotFoundError('Collection not found');

    if (payload.slug || payload.name) {
      const baseSlug = slugify(payload.slug || payload.name || collection.name);
      if (baseSlug && baseSlug !== collection.slug) {
        const existing = await collectionRepository.listSlugs();
        payload.slug = ensureUniqueSlug(
          baseSlug,
          existing.filter((c) => c.slug !== collection.slug).map((c) => c.slug)
        );
      } else {
        delete payload.slug;
      }
    }

    const updated = await collectionRepository.updateById(id, { $set: payload });
    return { collection: updated };
  }

  async remove(id) {
    const collection = await collectionRepository.findById(id);
    if (!collection) throw new NotFoundError('Collection not found');
    await collectionRepository.softDelete(id);
    return { message: 'Collection deleted' };
  }
}

export default new CollectionService();
