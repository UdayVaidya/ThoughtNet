import { QdrantClient } from '@qdrant/js-client-rest';
const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL || "http://localhost:6333",
  apiKey: process.env.QDRANT_API_KEY || undefined,
  checkCompatibility: false,
});
const COLLECTION_NAME = process.env.QDRANT_COLLECTION || "toughtnet_vectors";
const VECTOR_SIZE = 768;
const initQdrant = async () => {
  try {
    const collections = await qdrant.getCollections();
    const exists = collections.collections.some(c => c.name === COLLECTION_NAME);
    if (!exists) {
      await qdrant.createCollection(COLLECTION_NAME, { vectors: { size: VECTOR_SIZE, distance: "Cosine" } });
      console.log(`Qdrant collection "${COLLECTION_NAME}" created`);
    } else {
      console.log(`Qdrant collection "${COLLECTION_NAME}" ready`);
    }
  } catch (err) {
    console.warn("Qdrant not available:", err);
  }
};
export { qdrant, COLLECTION_NAME, initQdrant };
