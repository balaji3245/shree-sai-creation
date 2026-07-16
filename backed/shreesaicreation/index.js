import dotenv from 'dotenv';
import { connectDatabase } from './src/config/database.js';
import { connectRedis, isRedisReady } from './src/config/redis.js';
import logger from './src/utilities/logger.js';
import { runAllSeeds } from './src/seed/run.seed.js';
import { createApp } from './src/app.js';

dotenv.config();

const app = createApp();
const PORT = Number(process.env.PORT || 5050);

async function boot() {
  await connectDatabase();
  await connectRedis();

  if (String(process.env.AUTO_SEED || 'true').toLowerCase() !== 'false') {
    try {
      await runAllSeeds();
    } catch (err) {
      logger.warn({ err }, 'Auto-seed skipped or failed');
    }
  }

  app.listen(PORT, () => {
    logger.info(
      `Shree Sai Creation API listening on :${PORT} (redis=${isRedisReady() ? 'up' : 'down'})`
    );
  });
}

boot().catch((err) => {
  logger.error(err, 'Failed to boot server');
  process.exit(1);
});
