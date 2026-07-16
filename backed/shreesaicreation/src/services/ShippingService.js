import shippingZoneRepository from '../repositories/shippingZone.repository.js';
import storeSettingsRepository from '../repositories/storeSettings.repository.js';
import {
  NotFoundError,
  ValidationError,
} from '../utilities/apiResponse.js';
import { paiseToRupees, rupeesToPaise } from '../utilities/money.js';

function normalizeState(s) {
  return String(s || '')
    .trim()
    .toLowerCase();
}

function matchZone(zones, { state, pincode }) {
  const pin = String(pincode || '').trim();
  const st = normalizeState(state);

  // Prefer pin prefix match, then state
  for (const zone of zones) {
    const prefixes = zone.pinPrefixes || [];
    if (prefixes.length && pin) {
      if (prefixes.some((p) => pin.startsWith(String(p)))) {
        return zone;
      }
    }
  }

  for (const zone of zones) {
    const states = (zone.states || []).map(normalizeState);
    if (states.length && st && states.includes(st)) {
      return zone;
    }
  }

  // Catch-all: zone with no states and no pin prefixes
  const catchAll = zones.find(
    (z) => !(z.states || []).length && !(z.pinPrefixes || []).length
  );
  return catchAll || null;
}

class ShippingService {
  async createZone(payload) {
    if (!payload.name) throw new ValidationError('name required');
    if (!payload.methods?.length) {
      throw new ValidationError('At least one shipping method required');
    }

    const methods = payload.methods.map((m, i) => ({
      code: m.code || `method_${i + 1}`,
      name: m.name,
      amountInPaise:
        m.amountInPaise ??
        (m.amount != null ? rupeesToPaise(m.amount) : 0),
      estimatedDaysMin: m.estimatedDaysMin ?? 3,
      estimatedDaysMax: m.estimatedDaysMax ?? 7,
      isDefault: Boolean(m.isDefault) || i === 0,
    }));

    const zone = await shippingZoneRepository.create({
      name: payload.name,
      states: payload.states || [],
      pinPrefixes: payload.pinPrefixes || [],
      methods,
      isActive: payload.isActive !== false,
      sortOrder: payload.sortOrder || 0,
    });

    return { zone: this.serialize(zone) };
  }

  serialize(zone) {
    const obj = zone.toObject ? zone.toObject() : { ...zone };
    obj.methods = (obj.methods || []).map((m) => ({
      ...m,
      amount: paiseToRupees(m.amountInPaise),
    }));
    return obj;
  }

  async listAdmin() {
    const zones = await shippingZoneRepository.findMany({}, { limit: 100 });
    return { zones: zones.map((z) => this.serialize(z)) };
  }

  async updateZone(id, payload) {
    const zone = await shippingZoneRepository.findById(id);
    if (!zone) throw new NotFoundError('Shipping zone not found');

    const update = { ...payload };
    if (payload.methods) {
      update.methods = payload.methods.map((m, i) => ({
        code: m.code || `method_${i + 1}`,
        name: m.name,
        amountInPaise:
          m.amountInPaise ??
          (m.amount != null ? rupeesToPaise(m.amount) : 0),
        estimatedDaysMin: m.estimatedDaysMin ?? 3,
        estimatedDaysMax: m.estimatedDaysMax ?? 7,
        isDefault: Boolean(m.isDefault) || i === 0,
      }));
    }

    const updated = await shippingZoneRepository.updateById(id, { $set: update });
    return { zone: this.serialize(updated) };
  }

  async removeZone(id) {
    const zone = await shippingZoneRepository.findById(id);
    if (!zone) throw new NotFoundError('Shipping zone not found');
    await shippingZoneRepository.softDelete(id);
    return { message: 'Shipping zone deleted' };
  }

  /**
   * Resolve shipping methods for an address + optional cart subtotal after discount.
   */
  async quoteForAddress({ state, pincode, afterDiscountInPaise = 0, freeShippingCoupon = false }) {
    const settings = await storeSettingsRepository.findDefault();
    const threshold = settings?.freeShippingThresholdInPaise || 0;
    const flatFee = settings?.flatShippingFeeInPaise || 0;

    const zones = await shippingZoneRepository.findActive();
    const matched = matchZone(zones, { state, pincode });

    let methods = [];
    if (matched?.methods?.length) {
      methods = matched.methods.map((m) => ({
        id: m.code,
        code: m.code,
        name: m.name,
        amountInPaise: m.amountInPaise,
        amount: paiseToRupees(m.amountInPaise),
        estimatedDays: `${m.estimatedDaysMin}-${m.estimatedDaysMax}`,
        zoneId: matched._id,
        zoneName: matched.name,
      }));
    } else {
      methods = [
        {
          id: 'standard',
          code: 'standard',
          name: 'Standard Shipping',
          amountInPaise: flatFee,
          amount: paiseToRupees(flatFee),
          estimatedDays: '5-7',
          zoneId: null,
          zoneName: 'Default',
        },
      ];
    }

    const freeEligible =
      freeShippingCoupon || (threshold > 0 && afterDiscountInPaise >= threshold);

    if (freeEligible) {
      methods = methods.map((m) => ({
        ...m,
        amountInPaise: 0,
        amount: 0,
        name: m.name.includes('Free') ? m.name : `Free — ${m.name}`,
      }));
    }

    return {
      methods,
      matchedZone: matched
        ? { id: matched._id, name: matched.name }
        : null,
      freeShipping: freeEligible,
    };
  }
}

export default new ShippingService();
