import { handleApiRequest } from '../utilities/apiResponse.js';
import AddressService from '../services/AddressService.js';

class AddressController {
  list(req, res) {
    return handleApiRequest(req, res, async () => AddressService.list(req.userId));
  }

  create(req, res) {
    return handleApiRequest(req, res, async () => {
      const result = await AddressService.create(req.userId, req.body);
      return [result, 'Address created', 201];
    });
  }

  update(req, res) {
    return handleApiRequest(req, res, async () =>
      AddressService.update(req.userId, req.params.id, req.body)
    );
  }

  setDefault(req, res) {
    return handleApiRequest(req, res, async () =>
      AddressService.setDefault(req.userId, req.params.id)
    );
  }

  remove(req, res) {
    return handleApiRequest(req, res, async () =>
      AddressService.remove(req.userId, req.params.id)
    );
  }
}

export default new AddressController();
