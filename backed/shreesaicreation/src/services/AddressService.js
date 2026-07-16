import addressRepository from '../repositories/address.repository.js';
import { NotFoundError, ValidationError } from '../utilities/apiResponse.js';

class AddressService {
  async list(userId) {
    const addresses = await addressRepository.findByUser(userId);
    return { addresses };
  }

  async create(userId, payload) {
    if (!payload.fullName || !payload.phone || !payload.line1 || !payload.city || !payload.state || !payload.pincode) {
      throw new ValidationError('fullName, phone, line1, city, state, pincode are required');
    }

    if (payload.isDefault) {
      await addressRepository.clearDefault(userId);
    }

    const existing = await addressRepository.findByUser(userId);
    const isDefault = payload.isDefault || existing.length === 0;

    const address = await addressRepository.create({
      ...payload,
      userId,
      isDefault,
    });

    return { address };
  }

  async update(userId, id, payload) {
    const address = await addressRepository.findById(id, userId);
    if (!address) throw new NotFoundError('Address not found');

    if (payload.isDefault === true) {
      await addressRepository.clearDefault(userId);
    }

    const updated = await addressRepository.updateById(id, userId, { $set: payload });
    return { address: updated };
  }

  async setDefault(userId, id) {
    const address = await addressRepository.findById(id, userId);
    if (!address) throw new NotFoundError('Address not found');
    await addressRepository.clearDefault(userId);
    const updated = await addressRepository.updateById(id, userId, {
      $set: { isDefault: true },
    });
    return { address: updated };
  }

  async remove(userId, id) {
    const address = await addressRepository.findById(id, userId);
    if (!address) throw new NotFoundError('Address not found');
    await addressRepository.softDelete(id, userId);
    return { message: 'Address deleted' };
  }
}

export default new AddressService();
