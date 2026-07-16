import newsletterRepository from '../repositories/newsletter.repository.js';
import { ValidationError } from '../utilities/apiResponse.js';

class NewsletterService {
  async subscribe({ email, name, source }) {
    if (!email) throw new ValidationError('email is required');
    const subscriber = await newsletterRepository.upsertSubscribe(
      email,
      name,
      source || 'website'
    );
    return {
      subscriber: {
        email: subscriber.email,
        name: subscriber.name,
        isActive: subscriber.isActive,
      },
      message: 'Subscribed successfully',
    };
  }

  async unsubscribe({ email }) {
    if (!email) throw new ValidationError('email is required');
    const subscriber = await newsletterRepository.unsubscribe(email);
    if (!subscriber) {
      return { message: 'Email not found or already unsubscribed' };
    }
    return { message: 'Unsubscribed successfully' };
  }

  async listAdmin({ page = 1, limit = 100, activeOnly = true } = {}) {
    const filter = activeOnly ? { isActive: true } : {};
    const skip = (page - 1) * limit;
    const [subscribers, total] = await Promise.all([
      newsletterRepository.findMany(filter, { skip, limit }),
      newsletterRepository.count(filter),
    ]);
    return {
      subscribers,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }
}

export default new NewsletterService();
