import 'dotenv/config.js';
import { Worker } from 'bullmq';
import mongoose from 'mongoose';
import { connection } from '../config/queue.config.js';
import { initQdrant } from '../config/qdrant.config.js';
import Content from '../models/content.model.js';
import { extractFromUrl, extractYoutube } from '../utils/extractor.util.js';
import { processContent } from '../services/ai.service.js';
import { generateEmbedding } from '../services/embedding.service.js';
import { upsertVector } from '../services/qdrant.service.js';
import connectDB from '../config/db.config.js';

(async () => { await connectDB(); await initQdrant(); console.log("ToughtNet Worker started..."); })();

const worker = new Worker("content-processing", async (job) => {
  const { contentId } = job.data;
  console.log(`Processing: ${contentId}`);
  const content = await Content.findById(contentId).select("+rawText");
  if (!content) return;

  content.aiProcessing = true;
  await content.save();

  if (content.url && !content.rawText) {
    if (content.type === "youtube") {
      const yt = await extractYoutube(content.url);
      if (!content.thumbnail && yt.thumbnail) content.thumbnail = yt.thumbnail;
      if (!content.title || content.title.includes("YouTube")) content.title = yt.title;
    } else {
      const extracted = await extractFromUrl(content.url);
      if (extracted.rawText) content.rawText = extracted.rawText;
      if (!content.description) content.description = extracted.description;
      if (!content.thumbnail) content.thumbnail = extracted.thumbnail;
      if (!content.siteName) content.siteName = extracted.siteName;
      if (!content.author) content.author = extracted.author;
      if (!content.favicon) content.favicon = extracted.favicon;
    }
  }

  const aiResult = await processContent({ title: content.title, description: content.description, rawText: content.rawText, type: content.type });
  if (aiResult.tags?.length) content.tags = aiResult.tags;
  if (aiResult.summary) content.summary = aiResult.summary;
  if (aiResult.category) content.category = aiResult.category;
  if (aiResult.keyInsights?.length) content.keyInsights = aiResult.keyInsights;

  const vector = await generateEmbedding({ title: content.title, description: content.description, summary: content.summary, tags: content.tags });
  if (vector) {
    const pointId = await upsertVector(content._id, vector, { title: content.title, type: content.type, category: content.category, tags: content.tags, url: content.url });
    if (pointId) content.embeddingId = pointId;
  }

  content.aiProcessing = false;
  content.aiProcessed = true;
  await content.save();
  console.log(`Done: ${content.title}`);
}, { connection, concurrency: 3 });

worker.on("completed", (job) => console.log(`Job ${job.id} completed`));
worker.on("failed", (job, err) => console.error(`Job ${job.id} failed: ${err.message}`));
