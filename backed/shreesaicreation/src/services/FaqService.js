import faqRepository from '../repositories/faq.repository.js';
import { NotFoundError, ValidationError } from '../utilities/apiResponse.js';
import { slugify } from '../utilities/slugify.js';

class FaqService {
  async createCategory(payload) {
    if (!payload.name) throw new ValidationError('name required');
    const category = await faqRepository.createCategory({
      ...payload,
      slug: slugify(payload.slug || payload.name),
    });
    return { category };
  }

  async listCategoriesAdmin() {
    const categories = await faqRepository.findCategories();
    return { categories };
  }

  async updateCategory(id, payload) {
    const category = await faqRepository.findCategoryById(id);
    if (!category) throw new NotFoundError('FAQ category not found');
    if (payload.name && !payload.slug) payload.slug = slugify(payload.name);
    const updated = await faqRepository.updateCategory(id, { $set: payload });
    return { category: updated };
  }

  async removeCategory(id) {
    const category = await faqRepository.findCategoryById(id);
    if (!category) throw new NotFoundError('FAQ category not found');
    await faqRepository.softDeleteCategory(id);
    return { message: 'FAQ category deleted' };
  }

  async createFaq(payload) {
    if (!payload.question || !payload.answer) {
      throw new ValidationError('question and answer required');
    }
    const faq = await faqRepository.createFaq(payload);
    return { faq };
  }

  async listFaqsAdmin({ page = 1, limit = 100 } = {}) {
    const skip = (page - 1) * limit;
    const [faqs, total] = await Promise.all([
      faqRepository.findFaqs({}, { skip, limit }),
      faqRepository.countFaqs(),
    ]);
    return {
      faqs,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  async listPublic() {
    const [categories, faqs] = await Promise.all([
      faqRepository.findCategories({ isActive: true }),
      faqRepository.findFaqs({ isActive: true }, { limit: 200 }),
    ]);
    return { categories, faqs };
  }

  async updateFaq(id, payload) {
    const faq = await faqRepository.findFaqById(id);
    if (!faq) throw new NotFoundError('FAQ not found');
    const updated = await faqRepository.updateFaq(id, { $set: payload });
    return { faq: updated };
  }

  async removeFaq(id) {
    const faq = await faqRepository.findFaqById(id);
    if (!faq) throw new NotFoundError('FAQ not found');
    await faqRepository.softDeleteFaq(id);
    return { message: 'FAQ deleted' };
  }
}

export default new FaqService();
