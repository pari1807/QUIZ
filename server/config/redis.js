import { createClient } from 'redis';

let client = null;

export const getRedisClient = () => client;

export const initRedis = async () => {
  if (client) return client;

  const url = process.env.REDIS_URL;
  if (!url) {
    console.warn('REDIS_URL is not set. Redis features are disabled.');
    return null;
  }

  client = createClient({ url });

  client.on('error', (err) => {
    console.error('Redis client error:', err);
  });

  try {
    await client.connect();
    console.log('✅ Redis connected');
  } catch (err) {
    console.error('Failed to connect to Redis:', err.message);
    client = null;
  }

  return client;
};
