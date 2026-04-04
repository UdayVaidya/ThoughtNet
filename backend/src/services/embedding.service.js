import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateEmbedding = async ({ title, description, summary, tags }) => {
  const text = [title, description, summary, tags?.join(", ")].filter(Boolean).join(". ").slice(0, 2000);
  if (!text.trim()) return null;
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
    const result = await model.embedContent({
      content: { parts: [{ text }], role: "user" },
      taskType: "RETRIEVAL_DOCUMENT",
      outputDimensionality: 768,
    });
    return result.embedding.values;
  } catch (err) {
    console.error("Embedding error:", err.message);
    return null;
  }
};

export { generateEmbedding };
