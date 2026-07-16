import { handleApiRequest } from '../utilities/apiResponse.js';
import WebhookService from '../services/WebhookService.js';

class WebhookController {
  razorpay(req, res) {
    return handleApiRequest(req, res, async () => {
      const rawBody = req.rawBody || JSON.stringify(req.body);
      const signature = req.headers['x-razorpay-signature'];
      const result = await WebhookService.handleRazorpay(rawBody, signature);
      return [result, 'Webhook processed'];
    });
  }
}

export default new WebhookController();
