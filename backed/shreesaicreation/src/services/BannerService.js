import bannerRepository from '../repositories/banner.repository.js';
import { NotFoundError, ValidationError } from '../utilities/apiResponse.js';
import { invalidateHomeCache } from '../utilities/homeCache.js';

class BannerService {
  async create(payload) {
    if (!payload.imageDesktop) {
      throw new ValidationError('imageDesktop is required');
    }
    const banner = await bannerRepository.create(payload);
    await invalidateHomeCache();
    return { banner };
  }

  async listAdmin({ page = 1, limit = 50, placement } = {}) {
    const filter = {};
    if (placement) filter.placement = placement;
    const skip = (page - 1) * limit;
    const [banners, total] = await Promise.all([
      bannerRepository.findMany(filter, { skip, limit }),
      bannerRepository.count(filter),
    ]);
    return {
      banners,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  async update(id, payload) {
    const banner = await bannerRepository.findById(id);
    if (!banner) throw new NotFoundError('Banner not found');
    const updated = await bannerRepository.updateById(id, { $set: payload });
    await invalidateHomeCache();
    return { banner: updated };
  }

  async remove(id) {
    const banner = await bannerRepository.findById(id);
    if (!banner) throw new NotFoundError('Banner not found');
    await bannerRepository.softDelete(id);
    await invalidateHomeCache();
    return { message: 'Banner deleted' };
  }
}

export default new BannerService();
