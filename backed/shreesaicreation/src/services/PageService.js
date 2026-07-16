import pageRepository from '../repositories/page.repository.js';
import {
  NotFoundError,
  ValidationError,
} from '../utilities/apiResponse.js';
import { slugify, ensureUniqueSlug } from '../utilities/slugify.js';

class PageService {
  async create(payload) {
    const baseSlug = slugify(payload.slug || payload.title);
    if (!baseSlug) throw new ValidationError('title or slug required');
    const existing = await pageRepository.listSlugs();
    const slug = ensureUniqueSlug(
      baseSlug,
      existing.map((p) => p.slug)
    );
    const page = await pageRepository.create({ ...payload, slug });
    return { page };
  }

  async listAdmin({ page = 1, limit = 50 } = {}) {
    const skip = (page - 1) * limit;
    const [pages, total] = await Promise.all([
      pageRepository.findMany({}, { skip, limit }),
      pageRepository.count(),
    ]);
    return {
      pages,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  async listPublic() {
    const pages = await pageRepository.findMany(
      { isPublished: true },
      { limit: 50 }
    );
    return {
      pages: pages.map((p) => ({
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
      })),
    };
  }

  async getBySlug(slug) {
    const page = await pageRepository.findBySlug(slug);
    if (!page || !page.isPublished) throw new NotFoundError('Page not found');
    return { page };
  }

  async getById(id) {
    const page = await pageRepository.findById(id);
    if (!page) throw new NotFoundError('Page not found');
    return { page };
  }

  async update(id, payload) {
    const page = await pageRepository.findById(id);
    if (!page) throw new NotFoundError('Page not found');

    if (payload.slug || payload.title) {
      const baseSlug = slugify(payload.slug || payload.title || page.title);
      if (baseSlug && baseSlug !== page.slug) {
        const existing = await pageRepository.listSlugs();
        payload.slug = ensureUniqueSlug(
          baseSlug,
          existing.filter((p) => p.slug !== page.slug).map((p) => p.slug)
        );
      } else {
        delete payload.slug;
      }
    }

    const updated = await pageRepository.updateById(id, { $set: payload });
    return { page: updated };
  }

  async remove(id) {
    const page = await pageRepository.findById(id);
    if (!page) throw new NotFoundError('Page not found');
    await pageRepository.softDelete(id);
    return { message: 'Page deleted' };
  }
}

export default new PageService();
