import { handleApiRequest } from '../utilities/apiResponse.js';
import ShippingService from '../services/ShippingService.js';

class ShippingZoneController {
  createZone(req, res) {
    return handleApiRequest(req, res, async () => {
      const result = await ShippingService.createZone(req.body);
      return [result, 'Shipping zone created', 201];
    });
  }

  listZones(req, res) {
    return handleApiRequest(req, res, async () => ShippingService.listAdmin());
  }

  updateZone(req, res) {
    return handleApiRequest(req, res, async () =>
      ShippingService.updateZone(req.params.id, req.body)
    );
  }

  removeZone(req, res) {
    return handleApiRequest(req, res, async () => {
      const result = await ShippingService.removeZone(req.params.id);
      return [result, result.message || 'Shipping zone deleted'];
    });
  }
}

export default new ShippingZoneController();
