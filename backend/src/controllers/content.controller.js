import Content from '../models/content.model.js';
import { addToProcessingQueue } from '../queue/content.queue.js';
import { detectContentType, extractFromUrl } from '../utils/extractor.util.js';

export const saveContent = async (req, res, next) => {
  try {
    let body = { ...req.body, user: req.user._id };
    
    // Auto-detect type if missing
    if (body.url && !body.type) {
      body.type = detectContentType(body.url);
    }
    
    // Auto-fetch title if missing
    if (body.url && !body.title) {
      const extracted = await extractFromUrl(body.url);
      if (extracted.title) body.title = extracted.title;
      else body.title = body.url; // Fallback to URL
    }

    // Default for manual notes or fallbacks
    if (!body.type) body.type = "note";
    if (!body.title) body.title = "New Thought " + new Date().toLocaleDateString();

    const content = await Content.create(body);
    await addToProcessingQueue(content._id);
    res.status(201).json({ success: true, data: content });
  } catch (err) { next(err); }
};

export const getAllContent = async (req, res, next) => {
  try {
    const { type, tag, category, search, favorite, archived, page = 1, limit = 20 } = req.query;
    const query = { user: req.user._id };
    if (type) query.type = type;
    if (tag) query.tags = { $in: Array.isArray(tag) ? tag : [tag] };
    if (category) query.category = category;
    if (favorite === "true") query.isFavorite = true;
    if (archived === "true") query.isArchived = true;
    else query.isArchived = { $ne: true };
    if (search) query.$text = { $search: search };
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Content.countDocuments(query);
    const items = await Content.find(query)
      .sort(search ? { score: { $meta: "textScore" } } : { createdAt: -1 })
      .skip(skip).limit(Number(limit))
      .populate("collections", "name emoji color");
    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), data: items });
  } catch (err) { next(err); }
};

export const getContent = async (req, res, next) => {
  try {
    const content = await Content.findOne({ _id: req.params.id, user: req.user._id })
      .populate("collections", "name emoji color")
      .populate("relatedItems", "title type thumbnail url summary tags");
    if (!content) return res.status(404).json({ success: false, message: "Not found" });
    content.viewCount += 1;
    content.lastSurfaced = new Date();
    await content.save();
    res.json({ success: true, data: content });
  } catch (err) { next(err); }
};

export const updateContent = async (req, res, next) => {
  try {
    const content = await Content.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true, runValidators: true });
    if (!content) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: content });
  } catch (err) { next(err); }
};

export const deleteContent = async (req, res, next) => {
  try {
    const content = await Content.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!content) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, message: "Deleted successfully" });
  } catch (err) { next(err); }
};

export const addHighlight = async (req, res, next) => {
  try {
    const content = await Content.findOne({ _id: req.params.id, user: req.user._id });
    if (!content) return res.status(404).json({ success: false, message: "Not found" });
    content.highlights.push(req.body);
    await content.save();
    res.json({ success: true, data: content.highlights });
  } catch (err) { next(err); }
};

export const removeHighlight = async (req, res, next) => {
  try {
    const content = await Content.findOne({ _id: req.params.id, user: req.user._id });
    if (!content) return res.status(404).json({ success: false, message: "Not found" });
    content.highlights = content.highlights.filter(h => h._id.toString() !== req.params.highlightId);
    await content.save();
    res.json({ success: true, data: content.highlights });
  } catch (err) { next(err); }
};

export const toggleFavorite = async (req, res, next) => {
  try {
    const content = await Content.findOne({ _id: req.params.id, user: req.user._id });
    if (!content) return res.status(404).json({ success: false, message: "Not found" });
    content.isFavorite = !content.isFavorite;
    await content.save();
    res.json({ success: true, isFavorite: content.isFavorite });
  } catch (err) { next(err); }
};

export const toggleArchive = async (req, res, next) => {
  try {
    const content = await Content.findOne({ _id: req.params.id, user: req.user._id });
    if (!content) return res.status(404).json({ success: false, message: "Not found" });
    content.isArchived = !content.isArchived;
    await content.save();
    res.json({ success: true, isArchived: content.isArchived });
  } catch (err) { next(err); }
};

export const updateProgress = async (req, res, next) => {
  try {
    const content = await Content.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { readingProgress: req.body.progress }, { new: true });
    res.json({ success: true, data: content });
  } catch (err) { next(err); }
};

export const resurfaceMemories = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const items = await Content.find({
      user: req.user._id, aiProcessed: true, isArchived: { $ne: true },
      $or: [{ lastSurfaced: { $lt: thirtyDaysAgo } }, { lastSurfaced: null }],
    }).sort({ viewCount: 1, createdAt: 1 }).limit(5);
    await Content.updateMany({ _id: { $in: items.map(i => i._id) } }, { lastSurfaced: new Date() });
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
};

export const getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const total = await Content.countDocuments({ user: userId, isArchived: { $ne: true } });
    const byType = await Content.aggregate([{ $match: { user: userId, isArchived: { $ne: true } } }, { $group: { _id: "$type", count: { $sum: 1 } } }]);
    const byCategory = await Content.aggregate([{ $match: { user: userId, isArchived: { $ne: true }, aiProcessed: true } }, { $group: { _id: "$category", count: { $sum: 1 } } }]);
    const topTags = await Content.aggregate([{ $match: { user: userId } }, { $unwind: "$tags" }, { $group: { _id: "$tags", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 20 }]);
    const aiProcessed = await Content.countDocuments({ user: userId, aiProcessed: true });
    const favorites = await Content.countDocuments({ user: userId, isFavorite: true });
    res.json({ success: true, data: { total, aiProcessed, favorites, byType, byCategory, topTags } });
  } catch (err) { next(err); }
};
