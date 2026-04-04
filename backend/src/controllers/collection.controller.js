import Collection from '../models/collection.model.js';
import Content from '../models/content.model.js';

export const createCollection = async (req, res, next) => {
  try {
    const collection = await Collection.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, data: collection });
  } catch (err) { next(err); }
};

export const getAllCollections = async (req, res, next) => {
  try {
    const collections = await Collection.find({ user: req.user._id })
      .populate("items", "title type thumbnail tags createdAt")
      .sort({ isPinned: -1, createdAt: -1 });
    res.json({ success: true, data: collections });
  } catch (err) { next(err); }
};

export const getCollection = async (req, res, next) => {
  try {
    const collection = await Collection.findOne({ _id: req.params.id, user: req.user._id })
      .populate({ path: "items", populate: { path: "collections", select: "name emoji" } });
    if (!collection) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: collection });
  } catch (err) { next(err); }
};

export const updateCollection = async (req, res, next) => {
  try {
    const collection = await Collection.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true });
    if (!collection) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: collection });
  } catch (err) { next(err); }
};

export const deleteCollection = async (req, res, next) => {
  try {
    const collection = await Collection.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!collection) return res.status(404).json({ success: false, message: "Not found" });
    await Content.updateMany({ collections: req.params.id }, { $pull: { collections: collection._id } });
    res.json({ success: true, message: "Deleted" });
  } catch (err) { next(err); }
};

export const addToCollection = async (req, res, next) => {
  try {
    const { contentId } = req.body;
    const collection = await Collection.findOne({ _id: req.params.id, user: req.user._id });
    if (!collection) return res.status(404).json({ success: false, message: "Not found" });
    if (!collection.items.map(String).includes(contentId)) {
      collection.items.push(contentId);
      await collection.save();
      await Content.findOneAndUpdate({ _id: contentId, user: req.user._id }, { $addToSet: { collections: collection._id } });
    }
    res.json({ success: true, data: collection });
  } catch (err) { next(err); }
};

export const removeFromCollection = async (req, res, next) => {
  try {
    const { contentId } = req.params;
    await Collection.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { $pull: { items: contentId } });
    await Content.findOneAndUpdate({ _id: contentId, user: req.user._id }, { $pull: { collections: req.params.id } });
    res.json({ success: true, message: "Removed from collection" });
  } catch (err) { next(err); }
};
