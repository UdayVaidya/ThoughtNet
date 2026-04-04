import { qdrant, COLLECTION_NAME } from '../config/qdrant.config.js';
import { v4 as uuidv4 } from 'uuid';

const upsertVector = async (contentId, vector, payload) => {
  try {
    const pointId = uuidv4();
    await qdrant.upsert(COLLECTION_NAME, {
      wait: true,
      points: [{ id: pointId, vector, payload: { ...payload, mongoId: contentId.toString() } }],
    });
    return pointId;
  } catch (err) {
    console.error("Qdrant upsert error:", err.message);
    return null;
  }
};

const searchSimilar = async (vector, limit = 10) => {
  try {
    const results = await qdrant.search(COLLECTION_NAME, { vector, limit, with_payload: true });
    return results.map(r => ({ mongoId: r.payload.mongoId, score: r.score, payload: r.payload }));
  } catch (err) {
    console.error("Qdrant search error:", err.message);
    return [];
  }
};

const deleteVector = async (embeddingId) => {
  try {
    await qdrant.delete(COLLECTION_NAME, { wait: true, points: [embeddingId] });
  } catch (err) {
    console.error("Qdrant delete error:", err.message);
  }
};

export { upsertVector, searchSimilar, deleteVector };
