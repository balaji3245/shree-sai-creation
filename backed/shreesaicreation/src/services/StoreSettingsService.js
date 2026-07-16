import storeSettingsRepository from '../repositories/storeSettings.repository.js';
import { invalidateHomeCache } from '../utilities/homeCache.js';

class StoreSettingsService {
  async getPublic() {
    const settings = await storeSettingsRepository.findDefault();
    if (!settings) {
      return {
        settings: {
          storeName: 'Shree Sai Creation',
          tagline: 'Premium Luxury Lighting',
          currency: 'INR',
        },
      };
    }

    return {
      settings: {
        storeName: settings.storeName,
        tagline: settings.tagline,
        supportEmail: settings.supportEmail,
        supportPhone: settings.supportPhone,
        whatsappNumber: settings.whatsappNumber,
        social: settings.social,
        logoUrl: settings.logoUrl,
        currency: settings.currency,
        freeShippingThresholdInPaise: settings.freeShippingThresholdInPaise,
        freeShippingThreshold:
          (settings.freeShippingThresholdInPaise || 0) / 100,
        address: {
          city: settings.address?.city || '',
          state: settings.address?.state || '',
          country: settings.address?.country || 'IN',
        },
      },
    };
  }

  async getAdmin() {
    const settings = await storeSettingsRepository.findDefault();
    return { settings };
  }

  async update(payload) {
    const settings = await storeSettingsRepository.upsertDefault(payload);
    await invalidateHomeCache();
    return { settings };
  }
}

export default new StoreSettingsService();
