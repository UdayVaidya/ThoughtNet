import mongoose from 'mongoose';
const collectionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String },
  emoji: { type: String, default: "F" },
  color: { type: String, default: "#6366f1" },
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: "Content" }],
  isSmartCollection: { type: Boolean, default: false },
  smartFilter: { type: Object },
  isPinned: { type: Boolean, default: false },
}, { timestamps: true });
export default mongoose.model("Collection", collectionSchema);
