import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, FolderOpen, Trash2 } from "lucide-react";
import { collectionsAPI } from "../services/api.service.js";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const inputCls = `w-full rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-all
  bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)]
  focus:border-[var(--brand)] focus:bg-[rgba(245,158,11,0.05)]
  placeholder-[var(--text-3)]`;

export default function CollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", emoji: "📁", color: "#f59e0b" });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { const res = await collectionsAPI.getAll(); setCollections(res.data || []); }
    catch { toast.error("Failed to load collections"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error("Name required");
    try {
      await collectionsAPI.create(form);
      toast.success("Collection created!");
      setShowCreate(false);
      setForm({ name: "", description: "", emoji: "📁", color: "#f59e0b" });
      load();
    } catch { toast.error("Failed"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this collection?")) return;
    try { await collectionsAPI.delete(id); toast.success("Deleted"); load(); }
    catch { toast.error("Failed"); }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto z-content">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-black text-3xl text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
            Collections
          </h1>
          <p className="text-[var(--text-3)] text-sm mt-1">Organize your knowledge into curated sets</p>
        </div>
        <button onClick={() => setShowCreate(s => !s)}
          className="btn-primary"
          style={{ height: 40 }}>
          <Plus size={15} /> New Collection
        </button>
      </div>

      {showCreate && (
        <motion.form initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          onSubmit={handleCreate}
          className="glass-mid rounded-2xl p-6 mb-6 space-y-4"
          style={{ border: '1px solid rgba(245,158,11,0.14)' }}>
          <h3 className="font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Create Collection</h3>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Collection name" className={inputCls} />
          <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Description (optional)" className={inputCls} />
          <div className="flex gap-3">
            <button type="submit" className="btn-primary" style={{ height: 38 }}>Create</button>
            <button type="button" onClick={() => setShowCreate(false)} className="btn-ghost" style={{ height: 38 }}>Cancel</button>
          </div>
        </motion.form>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="glass rounded-2xl h-36 shimmer" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((c, i) => (
            <motion.div key={c._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -3 }}
              className="card p-5 group cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.025)' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="text-2xl">{c.emoji}</div>
                <button onClick={() => handleDelete(c._id)}
                  className="opacity-0 group-hover:opacity-100 text-[var(--text-3)] hover:text-[var(--coral)] transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
              <h3 className="font-bold text-white mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>{c.name}</h3>
              {c.description && <p className="text-xs text-[var(--text-3)] mb-3">{c.description}</p>}
              <div className="flex items-center gap-2">
                <FolderOpen size={13} style={{ color: 'var(--brand)' }} />
                <span className="text-xs text-[var(--text-3)]">{c.items?.length || 0} items</span>
              </div>
            </motion.div>
          ))}
          {collections.length === 0 && (
            <div className="col-span-3 text-center py-20 glass rounded-2xl">
              <FolderOpen size={36} className="mx-auto mb-4 text-[var(--text-3)]" />
              <p className="text-[var(--text-2)] font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>No collections yet</p>
              <p className="text-[var(--text-3)] text-sm mt-1">Create one to organize your knowledge</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
