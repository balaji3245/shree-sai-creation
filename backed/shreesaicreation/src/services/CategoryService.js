import categoryRepository from '../repositories/category.repository.js';
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../utilities/apiResponse.js';
import { slugify, ensureUniqueSlug } from '../utilities/slugify.js';

class CategoryService {
  async create(payload) {
    const baseSlug = slugify(payload.slug || payload.name);
    if (!baseSlug) throw new ValidationError('Valid name or slug is required');

    const existing = await categoryRepository.listSlugs();
    const slug = ensureUniqueSlug(
      baseSlug,
      existing.map((c) => c.slug)
    );

    return categoryRepository.create({
      ...payload,
      slug,
    });
  }

  async listAdmin({ page = 1, limit = 50, isActive, search } = {}) {
    const filter = {};
    if (typeof isActive === 'boolean') filter.isActive = isActive;
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      categoryRepository.findMany(filter, { skip, limit }),
      categoryRepository.count(filter),
    ]);

    return {
      categories: items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  async listPublic() {
    const categories = await categoryRepository.findMany(
      { isActive: true },
      { sort: { sortOrder: 1, name: 1 }, limit: 200 }
    );
    return { categories };
  }

  async getBySlugPublic(slug) {
    const category = await categoryRepository.findBySlug(slug);
    if (!category || !category.isActive) {
      throw new NotFoundError('Category not found');
    }
    return { category };
  }

  async getById(id) {
    const category = await categoryRepository.findById(id);
    if (!category) throw new NotFoundError('Category not found');
    return { category };
  }

  async update(id, payload) {
    const category = await categoryRepository.findById(id);
    if (!category) throw new NotFoundError('Category not found');

    if (payload.slug || payload.name) {
      const baseSlug = slugify(payload.slug || payload.name || category.name);
      if (baseSlug && baseSlug !== category.slug) {
        const existing = await categoryRepository.listSlugs();
        payload.slug = ensureUniqueSlug(
          baseSlug,
          existing.filter((c) => c.slug !== category.slug).map((c) => c.slug)
        );
      } else {
        delete payload.slug;
      }
    }

    const updated = await categoryRepository.updateById(id, { $set: payload });
    return { category: updated };
  }

  async reorder(items) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new ValidationError('items array is required');
    }
    await categoryRepository.bulkReorder(items);
    return { message: 'Categories reordered' };
  }

  async remove(id) {
    const category = await categoryRepository.findById(id);
    if (!category) throw new NotFoundError('Category not found');
    if (category.productCount > 0) {
      throw new ConflictError(
        'Category has products. Reassign or remove products first.'
      );
    }
    await categoryRepository.softDelete(id);
    return { message: 'Category deleted' };
  }
}

export default new CategoryService();
