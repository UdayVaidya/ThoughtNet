import Content from '../models/content.model.js';
import { generateEmbedding } from '../services/embedding.service.js';
import { searchSimilar } from '../services/qdrant.service.js';

export const search = async (req, res, next) => {
  try {
    const { q, type = "semantic", limit = 10 } = req.query;
    if (!q) return res.status(400).json({ success: false, message: "Query required" });
    
    let textResults = [];
    let semanticResults = [];

    // 1. Priority 1: Keyword/Regex match (Title and Tags)
    // This handles short queries like "upsc" much better than semantic broadness
    textResults = await Content.find({
      user: req.user._id,
      $or: [
        { title: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } }
      ]
    }).populate("collections", "name emoji color").limit(Number(limit));

    // 2. Priority 2: Semantic Search (Deep context)
    if (type === "semantic") {
      const vector = await generateEmbedding({ title: q, description: q });
      if (vector) {
        const similar = await searchSimilar(vector, Number(limit) * 2);
        // Stricter threshold (0.72) for high relevance
        const relevant = similar.filter(s => s.score > 0.72);
        const mongoIds = relevant.map(s => s.mongoId).filter(Boolean);
        
        const items = await Content.find({ _id: { $in: mongoIds }, user: req.user._id }).populate("collections", "name emoji color");
        semanticResults = mongoIds.map(id => items.find(i => i._id.toString() === id)).filter(Boolean);
      }
    }

    // Merge and Deduplicate (Keep text matches at the top)
    const combined = [...textResults];
    const seenIds = new Set(textResults.map(r => r._id.toString()));

    semanticResults.forEach(r => {
      if (!seenIds.has(r._id.toString())) {
        combined.push(r);
        seenIds.add(r._id.toString());
      }
    });

    // Final fallback: $text search if still no results
    if (combined.length === 0) {
      const atlasResults = await Content.find({ $text: { $search: q }, isArchived: { $ne: true }, user: req.user._id })
        .sort({ score: { $meta: "textScore" } }).limit(Number(limit)).populate("collections", "name emoji color");
      combined.push(...atlasResults);
    }

    const finalResults = combined.slice(0, Number(limit));
    res.json({ success: true, query: q, count: finalResults.length, data: finalResults });
  } catch (err) { next(err); }
};

export const getRelated = async (req, res, next) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) return res.status(404).json({ success: false, message: "Not found" });
    let related = [];
    if (content.embeddingId) {
      const vector = await generateEmbedding({ title: content.title, description: content.description, summary: content.summary, tags: content.tags });
      if (vector) {
        const similar = await searchSimilar(vector, 6);
        const mongoIds = similar.map(s => s.mongoId).filter(id => id && id !== content._id.toString());
        related = await Content.find({ _id: { $in: mongoIds }, user: req.user._id }).select("title type thumbnail url summary tags");
      }
    }
    if (related.length === 0 && content.tags?.length) {
      related = await Content.find({ _id: { $ne: content._id }, user: req.user._id, tags: { $in: content.tags }, isArchived: { $ne: true } }).select("title type thumbnail url summary tags").limit(5);
    }
    res.json({ success: true, data: related });
  } catch (err) { next(err); }
};

export const getAllTags = async (req, res, next) => {
  try {
    const tags = await Content.aggregate([
      { $match: { user: req.user._id, isArchived: { $ne: true } } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 },
    ]);
    res.json({ success: true, data: tags });
  } catch (err) { next(err); }
};

export const getGraphData = async (req, res, next) => {
  try {
    const items = await Content.find({ user: req.user._id, isArchived: { $ne: true }, aiProcessed: true })
      .select("title type tags category relatedItems thumbnail").populate("relatedItems", "title type");
    const nodes = items.map(item => ({ id: item._id.toString(), title: item.title, type: item.type, category: item.category, tags: item.tags, thumbnail: item.thumbnail }));
    const links = [];
    items.forEach(item => {
      item.relatedItems?.forEach(rel => links.push({ source: item._id.toString(), target: rel._id.toString(), strength: 1 }));
    });
    const tagMap = {};
    items.forEach(item => { item.tags?.forEach(tag => { if (!tagMap[tag]) tagMap[tag] = []; tagMap[tag].push(item._id.toString()); }); });
    Object.values(tagMap).forEach(ids => {
      if (ids.length > 1 && ids.length <= 8) {
        for (let i = 0; i < ids.length - 1; i++) links.push({ source: ids[i], target: ids[i+1], strength: 0.5 });
      }
    });
    res.json({ success: true, data: { nodes, links } });
  } catch (err) { next(err); }
};
