import IORedis from 'ioredis';
import logger from '../utilities/logger.js';

const redisEnabled = String(process.env.REDIS_ENABLED || 'true').toLowerCase() !== 'false';

let redisConnection = null;

export function getRedis() {
  return redisConnection;
}

export function isRedisReady() {
  return Boolean(redisConnection && redisConnection.status === 'ready');
}

export async function connectRedis() {
  if (!redisEnabled) {
    logger.warn('Redis disabled via REDIS_ENABLED=false');
    return null;
  }

  const config = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number.parseInt(process.env.REDIS_PORT || '6379', 10),
    maxRetriesPerRequest: 1,
    lazyConnect: true,
    enableOfflineQueue: false,
  };

  if (process.env.REDIS_PASSWORD) {
    config.password = process.env.REDIS_PASSWORD;
  }

  redisConnection = new IORedis(config);

  redisConnection.on('connect', () => logger.info('Redis client connected'));
  redisConnection.on('error', (err) => logger.error({ err }, 'Redis error'));

  try {
    await redisConnection.connect();
    await redisConnection.ping();
    logger.info('Redis ping ok');
  } catch (err) {
    logger.warn({ err }, 'Redis unavailable — continuing without cache');
    try {
      redisConnection.disconnect();
    } catch {
      /* ignore */
    }
    redisConnection = null;
  }

  return redisConnection;
}

export default { getRedis, connectRedis, isRedisReady };
