import { getRedis, isRedisReady } from '../config/redis.js';
import logger from './logger.js';

const HOME_CACHE_KEY = 'ssc:home:v1';
const HOME_CACHE_TTL = 120;  

export async function getCachedHome() {
  if (!isRedisReady()) return null;
  try {
    const raw = await getRedis().get(HOME_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    logger.warn({ err }, 'Home cache read failed');
    return null;
  }
}

export async function setCachedHome(payload) {
  if (!isRedisReady()) return;
  try {
    await getRedis().set(
      HOME_CACHE_KEY,
      JSON.stringify(payload),
      'EX',
      HOME_CACHE_TTL
    );
  } catch (err) {
    logger.warn({ err }, 'Home cache write failed');
  }
}

export async function invalidateHomeCache() {
  if (!isRedisReady()) return;
  try {
    await getRedis().del(HOME_CACHE_KEY);
  } catch (err) {
    logger.warn({ err }, 'Home cache invalidate failed');
  }
}
