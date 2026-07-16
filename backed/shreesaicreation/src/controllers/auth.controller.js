import { handleApiRequest } from '../utilities/apiResponse.js';
import AuthService from '../services/AuthService.js';

class AuthController {
  register(req, res) {
    return handleApiRequest(req, res, async () => {
      const data = await AuthService.register(req.body);
      return [data, 'Registered successfully', 201];
    });
  }

  login(req, res) {
    return handleApiRequest(req, res, async () => {
      const data = await AuthService.login(req.body);
      return [data, 'Login successful'];
    });
  }

  me(req, res) {
    return handleApiRequest(req, res, async () => {
      const user = await AuthService.getMe(req.userId);
      return [{ user }, 'OK'];
    });
  }

  updateMe(req, res) {
    return handleApiRequest(req, res, async () => {
      const user = await AuthService.updateMe(req.userId, req.body);
      return [{ user }, 'Profile updated'];
    });
  }
}

export default new AuthController();
