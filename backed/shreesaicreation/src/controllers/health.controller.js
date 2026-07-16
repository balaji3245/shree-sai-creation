import { handleApiRequest } from '../utilities/apiResponse.js';
import { isRedisReady } from '../config/redis.js';
import mongoose from 'mongoose';

class HealthController {
  check(req, res) {
    return handleApiRequest(req, res, async () => {
      const dbOk = mongoose.connection.readyState === 1;
      return [
        {
          status: dbOk ? 'ok' : 'degraded',
          database: dbOk ? 'up' : 'down',
          redis: isRedisReady() ? 'up' : 'down',
          uptime: process.uptime(),
        },
        'Health check',
      ];
    });
  }
}

export default new HealthController();
