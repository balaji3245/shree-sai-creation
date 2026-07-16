import { handleApiRequest } from '../utilities/apiResponse.js';
import AdminService from '../services/AdminService.js';

class AdminController {
  login(req, res) {
    return handleApiRequest(req, res, async () => {
      const data = await AdminService.login(req.body);
      return [data, 'Admin login successful'];
    });
  }

  me(req, res) {
    return handleApiRequest(req, res, async () => {
      const admin = await AdminService.getMe(req.adminId);
      return [{ admin }, 'OK'];
    });
  }
}

export default new AdminController();
