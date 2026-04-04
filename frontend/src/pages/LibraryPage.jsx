import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, Grid, List, BookOpen } from "lucide-react";
import { useContent } from "../hooks/useContent.js";
import ContentCard from "../components/content/ContentCard.jsx";
import SearchBar from "../components/search/SearchBar.jsx";

const types = ["article", "youtube", "tweet", "note", "image", "webpage", "pdf"];
const typeEmojis = { article: "📰", youtube: "▶️", tweet: "🐦", note: "📝", image: "🖼", webpage: "🌐", pdf: "📄" };

function SkeletonCard() {
  return (
    <div className="card overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
      <div className="h-36 shimmer" />
      <div className="p-4 space-y-3">
        <div className="h-3 shimmer rounded-full w-1/3" />
        <div className="h-4 shimmer rounded-full w-4/5" />
        <div className="h-3 shimmer rounded-full w-full" />
        <div className="h-3 shimmer rounded-full w-3/5" />
      </div>
    </div>
  );
}

export default function LibraryPage() {
  const [search, setSearch]   = useState("");
  const [type, setType]       = useState("");
  const [favorite, setFavorite] = useState(false);
  const [view, setView]       = useState("grid");

  const params = {};
  if (type)     params.type     = type;
  if (favorite) params.favorite = "true";
  if (search)   params.search   = search;

  const { data, setData, loading, total } = useContent(params);

  return (
    <div className="p-8 max-w-7xl mx-auto z-content">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
            Library
          </h1>
          <p className="text-[var(--text-3)] text-sm mt-1.5">
            <span className="font-semibold" style={{ color: 'var(--brand-light)' }}>{total}</span> items saved in your knowledge base
          </p>
        </div>
        {/* View toggle */}
        <div className="flex items-center gap-1 glass p-1 rounded-xl">
          {[{ mode: 'grid', icon: Grid }, { mode: 'list', icon: List }].map(({ mode, icon: Icon }) => (
            <button key={mode} onClick={() => setView(mode)}
              className="p-2 rounded-lg transition-all duration-200"
              style={{
                background: view === mode ? 'rgba(245,158,11,0.18)' : 'transparent',
                color: view === mode ? 'var(--brand-light)' : 'var(--text-3)',
              }}>
              <Icon size={16} />
            </button>
          ))}
        </div>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-5">
        <SearchBar value={search} onChange={setSearch} />
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
        className="flex flex-wrap gap-2 mb-7">
        <button onClick={() => setFavorite(f => !f)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200"
          style={{
            background: favorite ? 'rgba(255,107,107,0.15)' : 'rgba(255,255,255,0.05)',
            color:      favorite ? '#ff6b6b' : 'var(--text-3)',
            border:     `1px solid ${favorite ? 'rgba(255,107,107,0.3)' : 'var(--border)'}`,
          }}>
          ❤️ Favorites
        </button>
        {types.map(t => {
          const active = type === t;
          return (
            <motion.button key={t} onClick={() => setType(type === t ? "" : t)}
              whileTap={{ scale: 0.94 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 capitalize"
              style={{
                background: active ? 'rgba(245,158,11,0.14)' : 'rgba(255,255,255,0.05)',
                color:      active ? 'var(--brand-light)' : 'var(--text-3)',
                border:     `1px solid ${active ? 'rgba(245,158,11,0.28)' : 'var(--border)'}`,
              }}>
              <span>{typeEmojis[t]}</span>
              {t}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Grid / List */}
      {loading ? (
        <div className={view === 'grid'
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          : "flex flex-col gap-3"}>
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <motion.div
            layout
            className={view === 'grid'
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              : "flex flex-col gap-3"}>
            {data.map((item, i) => (
              <motion.div key={item._id} layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}>
                <ContentCard item={item} onDelete={(id) => setData(prev => prev.filter(c => c._id !== id))} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Empty State */}
      {!loading && data.length === 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="text-center py-24 glass rounded-2xl">
          <BookOpen size={40} className="mx-auto mb-4 text-[var(--text-3)]" />
          <p className="font-bold text-[var(--text-2)] text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>
            Nothing found
          </p>
          <p className="text-[var(--text-3)] text-sm mt-2">
            {search ? `No results for "${search}"` : "Try different filters or save some content"}
          </p>
        </motion.div>
      )}
    </div>
  );
}
