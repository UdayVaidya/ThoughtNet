import { Queue } from 'bullmq';
import IORedis from 'ioredis';
const connection = new IORedis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
});

connection.on('error', (err) => {
  if (err.code !== 'EADDRNOTAVAIL') {
    console.error(`[Redis] Error: ${err.message}`);
  }
});

const contentQueue = new Queue("content-processing", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 3000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});
export { contentQueue, connection };
