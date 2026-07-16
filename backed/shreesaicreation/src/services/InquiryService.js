import inquiryRepository from '../repositories/inquiry.repository.js';
import { NotFoundError, ValidationError } from '../utilities/apiResponse.js';

class InquiryService {
  async create(payload) {
    if (!payload.name || !payload.email || !payload.message) {
      throw new ValidationError('name, email, and message are required');
    }
    const inquiry = await inquiryRepository.create({
      type: payload.type || 'contact',
      name: payload.name,
      email: payload.email,
      phone: payload.phone || '',
      subject: payload.subject || '',
      message: payload.message,
      roomType: payload.roomType || '',
      budgetRange: payload.budgetRange || '',
      preferredStyle: payload.preferredStyle || '',
      dimensions: payload.dimensions || '',
      attachmentUrls: payload.attachmentUrls || [],
    });
    return { inquiry };
  }

  async listAdmin({ page = 1, limit = 50, status, type } = {}) {
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    const skip = (page - 1) * limit;
    const [inquiries, total] = await Promise.all([
      inquiryRepository.findMany(filter, { skip, limit }),
      inquiryRepository.count(filter),
    ]);
    return {
      inquiries,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  async update(id, payload) {
    const inquiry = await inquiryRepository.findById(id);
    if (!inquiry) throw new NotFoundError('Inquiry not found');
    const allowed = {};
    if (payload.status) allowed.status = payload.status;
    if (payload.adminNotes !== undefined) allowed.adminNotes = payload.adminNotes;
    if (payload.assignedTo !== undefined) allowed.assignedTo = payload.assignedTo;
    const updated = await inquiryRepository.updateById(id, { $set: allowed });
    return { inquiry: updated };
  }
}

export default new InquiryService();
