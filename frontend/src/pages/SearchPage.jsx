import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Search } from "lucide-react";
import { searchAPI } from "../services/api.service.js";
import ContentCard from "../components/content/ContentCard.jsx";
import SearchBar from "../components/search/SearchBar.jsx";
import toast from "react-hot-toast";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = async (q) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    setSearchParams({ q });
    try {
      const res = await searchAPI.search(q, "semantic");
      setResults(res.data || []);
    } catch (err) {
      toast.error("Search failed");
      setResults([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { if (searchParams.get("q")) doSearch(searchParams.get("q")); }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto z-content">
      <div className="mb-8">
        <h1 className="font-black text-3xl text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
          Semantic Search
        </h1>
        <p className="text-[var(--text-3)] text-sm flex items-center gap-2">
          <Sparkles size={14} style={{ color: 'var(--brand)' }} />
          AI-powered search across your knowledge base
        </p>
      </div>

      <div className="mb-8">
        <SearchBar value={query} onChange={setQuery} onSearch={doSearch}
          placeholder="Search by meaning, not just keywords..." />
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="glass rounded-2xl h-48 shimmer" />)}
        </div>
      )}

      {!loading && searched && (
        <div>
          <p className="text-[var(--text-3)] text-sm mb-5">
            <span style={{ color: 'var(--brand-light)' }} className="font-semibold">{results.length}</span>
            {" "}result{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((item, i) => (
              <motion.div key={item._id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}>
                <ContentCard item={item} onDelete={(id) => setResults(prev => prev.filter(c => c._id !== id))} />
              </motion.div>
            ))}
          </div>
          {results.length === 0 && (
            <div className="text-center py-16 glass rounded-2xl">
              <Search size={36} className="mx-auto mb-4 text-[var(--text-3)]" />
              <p className="text-[var(--text-2)] font-bold text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>
                No results found
              </p>
              <p className="text-[var(--text-3)] text-sm mt-2">Try different keywords or save more content</p>
            </div>
          )}
        </div>
      )}

      {!searched && (
        <div className="text-center py-24">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 glass"
            style={{ border: '1px solid rgba(245,158,11,0.2)' }}>
            <Sparkles size={28} style={{ color: 'var(--brand)' }} />
          </div>
          <p className="font-bold text-xl text-[var(--text-2)]" style={{ fontFamily: 'Syne, sans-serif' }}>
            Search your second brain
          </p>
          <p className="text-[var(--text-3)] text-sm mt-2">
            Uses AI embeddings to find semantically similar content
          </p>
        </div>
      )}
    </div>
  );
}
