import { contentQueue } from '../config/queue.config.js';

const addToProcessingQueue = async (contentId) => {
  const job = await contentQueue.add("process-content", { contentId: contentId.toString() });
  console.log(`Queued job ${job.id} for content: ${contentId}`);
  return job;
};

export { addToProcessingQueue };
