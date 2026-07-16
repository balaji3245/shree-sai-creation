import NewsletterModel from '../models/newsletter.model.js';

class NewsletterRepository {
  findByEmail(email) {
    return NewsletterModel.findOne({ email: email.toLowerCase() });
  }

  create(payload) {
    return NewsletterModel.create(payload);
  }

  upsertSubscribe(email, name, source) {
    return NewsletterModel.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        $set: {
          isActive: true,
          unsubscribedAt: null,
          ...(name ? { name } : {}),
          ...(source ? { source } : {}),
        },
        $setOnInsert: { email: email.toLowerCase() },
      },
      { new: true, upsert: true }
    );
  }

  unsubscribe(email) {
    return NewsletterModel.findOneAndUpdate(
      { email: email.toLowerCase() },
      { $set: { isActive: false, unsubscribedAt: new Date() } },
      { new: true }
    );
  }

  findMany(filter = {}, { skip = 0, limit = 100, sort = { createdAt: -1 } } = {}) {
    return NewsletterModel.find(filter).sort(sort).skip(skip).limit(limit);
  }

  count(filter = {}) {
    return NewsletterModel.countDocuments(filter);
  }
}

export default new NewsletterRepository();
