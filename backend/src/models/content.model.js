import mongoose from 'mongoose';
const highlightSchema = new mongoose.Schema({
  text: { type: String, required: true },
  note: { type: String },
  color: { type: String, default: "#facc15" },
  createdAt: { type: Date, default: Date.now },
});
const contentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ["article","tweet","youtube","pdf","image","webpage","note"], required: true },
  url: { type: String },
  title: { type: String, required: true },
  description: { type: String },
  rawText: { type: String, select: false },
  summary: { type: String },
  tags: [{ type: String }],
  manualTags: [{ type: String }],
  category: { type: String, default: "other" },
  keyInsights: [{ type: String }],
  thumbnail: { type: String },
  favicon: { type: String },
  author: { type: String },
  siteName: { type: String },
  aiProcessed: { type: Boolean, default: false },
  aiProcessing: { type: Boolean, default: false },
  embeddingId: { type: String },
  collections: [{ type: mongoose.Schema.Types.ObjectId, ref: "Collection" }],
  relatedItems: [{ type: mongoose.Schema.Types.ObjectId, ref: "Content" }],
  lastSurfaced: { type: Date },
  viewCount: { type: Number, default: 0 },
  isFavorite: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
  highlights: [highlightSchema],
  readingProgress: { type: Number, default: 0, min: 0, max: 100 },
}, { timestamps: true });
contentSchema.index({ title: "text", description: "text", tags: "text", summary: "text" });
contentSchema.index({ createdAt: -1 });
contentSchema.index({ type: 1 });
export default mongoose.model("Content", contentSchema);
