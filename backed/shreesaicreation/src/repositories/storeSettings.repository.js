import StoreSettingsModel from '../models/storeSettings.model.js';

class StoreSettingsRepository {
  findDefault() {
    return StoreSettingsModel.findOne({ key: 'default' });
  }

  upsertDefault(payload) {
    return StoreSettingsModel.findOneAndUpdate(
      { key: 'default' },
      { $set: payload },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
  }
}

export default new StoreSettingsRepository();
