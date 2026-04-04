import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Link, FileText, Youtube, Twitter, Image, FolderClosed, ChevronDown } from "lucide-react";
import { contentAPI, collectionsAPI } from "../../services/api.service.js";
import toast from "react-hot-toast";

const types = [
  { value: "article", label: "Article", icon: Link },
  { value: "youtube", label: "YouTube", icon: Youtube },
  { value: "tweet",   label: "Tweet",   icon: Twitter },
  { value: "note",    label: "Note",    icon: FileText },
  { value: "image",   label: "Image",   icon: Image },
];

export default function SaveModal({ onClose }) {
  const [form, setForm] = useState({ type: "", url: "", title: "", description: "", collections: [] });
  const [loading, setLoading] = useState(false);
  const [collections, setCollections] = useState([]);
  const [fetchingCols, setFetchingCols] = useState(true);

  useEffect(() => {
    collectionsAPI.getAll()
      .then(res => setCollections(res.data || []))
      .catch(() => {})
      .finally(() => setFetchingCols(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.url && !form.title) return toast.error("Please provide a Title or URL");
    
    setLoading(true);
    try {
      await contentAPI.save(form);
      toast.success("Saved! AI processing started...");
      onClose();
      window.dispatchEvent(new CustomEvent('refresh-content'));
    } catch (err) {
      toast.error(err.message || "Failed to save");
    } finally { setLoading(false); }
  };

  const inputCls = `w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-[var(--text-3)]
    transition-all outline-none
    bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)]
    focus:border-[var(--brand)] focus:bg-[rgba(245,158,11,0.05)]
    focus:shadow-[0_0_0_3px_rgba(245,158,11,0.10)]`;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}>
        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="glass-mid rounded-2xl p-6 w-full max-w-md"
          style={{ border: '1px solid rgba(245,158,11,0.14)' }}>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-xl text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                Save to ThoughtNet
              </h2>
              <p className="text-xs text-[var(--text-3)] mt-0.5">AI will process and tag it automatically</p>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-3)]
                hover:text-white hover:bg-white/8 transition-all">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-[var(--text-3)] mb-2 block font-medium">Content Type (optional - auto-detected)</label>
              <div className="flex gap-2 flex-wrap">
                {types.map(({ value, label, icon: Icon }) => (
                  <button key={value} type="button"
                    onClick={() => setForm(f => ({ ...f, type: value }))}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={form.type === value ? {
                      background: 'rgba(245,158,11,0.18)',
                      color: 'var(--brand-light)',
                      border: '1px solid rgba(245,158,11,0.3)',
                    } : {
                      background: 'rgba(255,255,255,0.05)',
                      color: 'var(--text-3)',
                      border: '1px solid var(--border)',
                    }}>
                    <Icon size={13} />{label}
                  </button>
                ))}
              </div>
            </div>

            {form.type !== "note" && (
              <div>
                <label className="text-xs text-[var(--text-3)] mb-1.5 block font-medium">URL</label>
                <input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                  placeholder="https://..." className={inputCls} />
              </div>
            )}

            <div>
              <label className="text-xs text-[var(--text-3)] mb-1.5 block font-medium">Title (optional if URL provided)</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Give it a title..." className={inputCls} />
            </div>

            <div>
              <label className="text-xs text-[var(--text-3)] mb-1.5 block font-medium">Save to Collection (optional)</label>
              <div className="relative">
                <select 
                  onChange={e => setForm(f => ({ ...f, collections: e.target.value ? [e.target.value] : [] }))}
                  className={`${inputCls} appearance-none cursor-pointer pr-10`}
                  disabled={collections.length === 0}
                >
                  <option value="" className="bg-[#0b0b0f]">
                    {collections.length === 0 ? "No collections created yet" : "Choose a collection..."}
                  </option>
                  {collections.map(col => (
                    <option key={col._id} value={col._id} className="bg-[#0b0b0f]">
                      {col.emoji} {col.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-3)]">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs text-[var(--text-3)] mb-1.5 block font-medium">Notes (optional)</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Your thoughts on this..."
                rows={3}
                className={`${inputCls} resize-none`} />
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full"
              style={{ height: 48 }}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 rounded-full animate-spin"
                    style={{ borderColor: 'rgba(11,11,15,0.3)', borderTopColor: '#0b0b0f' }} />
                  Saving...
                </span>
              ) : "Save & Process with AI"}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
