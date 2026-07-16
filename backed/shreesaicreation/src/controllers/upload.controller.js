import { handleApiRequest } from '../utilities/apiResponse.js';
import { mapUploadedFiles } from '../middleware/uploads.js';

class UploadController {
  upload(req, res) {
    return handleApiRequest(req, res, async () => {
      const files = mapUploadedFiles(req);
      return [{ files }, 'Upload successful', 201];
    });
  }
}

export default new UploadController();
