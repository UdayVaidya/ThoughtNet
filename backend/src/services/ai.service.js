import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const processContent = async ({ title, description, rawText, type }) => {
  const textToProcess = [title, description, rawText].filter(Boolean).join("\n\n").slice(0, 4000);
  if (!textToProcess.trim()) return { tags: [], summary: "", category: "other", keyInsights: [] };

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `You are a knowledge management AI for ToughtNet. Respond ONLY with valid JSON (no markdown block, no extra text).
Analyze this ${type} content. Return JSON exactly formatted like this:
{
  "tags": ["array", "of", "5to8", "tags"],
  "summary": "2-3 sentence summary.",
  "category": "one of [technology,science,business,design,health,finance,politics,culture,education,other]",
  "keyInsights": ["Point 1", "Point 2", "Point 3"]
}

Content:
${textToProcess}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const raw = responseText.trim().replace(/^```json|```$/g, "").trim();
    return JSON.parse(raw);
  } catch (err) {
    console.error("AI processing error:", err.message);
    return { tags: [], summary: "", category: "other", keyInsights: [] };
  }
};

export { processContent };
