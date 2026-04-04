import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, ExternalLink, Tag, Zap, BookOpen } from "lucide-react";
import { contentAPI, searchAPI } from "../services/api.service.js";
import ContentCard from "../components/content/ContentCard.jsx";
import toast from "react-hot-toast";
import dayjs from "dayjs";

export default function ContentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    contentAPI.getOne(id)
      .then(res => {
        setItem(res.data);
        searchAPI.getRelated(id).then(r => setRelated(r.data || [])).catch(() => {});
      })
      .catch(() => navigate("/library"))
      .finally(() => setLoading(false));
  }, [id]);

  const getYoutubeVideoId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  const handleFavorite = async () => {
    const res = await contentAPI.toggleFavorite(id);
    setItem(i => ({ ...i, isFavorite: res.isFavorite }));
    toast.success(res.isFavorite ? "Favorited!" : "Removed from favorites");
  };

  if (loading) return (
    <div className="p-8 flex items-center justify-center h-full">
      <div className="glass rounded-2xl h-96 w-full max-w-3xl shimmer" />
    </div>
  );
  if (!item) return null;

  return (
    <div className="p-8 max-w-4xl mx-auto z-content">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[var(--text-3)] hover:text-white mb-6 transition-colors text-sm font-medium">
        <ArrowLeft size={16} /> Back
      </button>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        {item.type === 'youtube' && getYoutubeVideoId(item.url) ? (
          <div className="rounded-2xl overflow-hidden mb-6 h-64 lg:h-[400px] relative glass">
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${getYoutubeVideoId(item.url)}`}
              title={item.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (item.thumbnail || item.type === 'image') ? (
          <div className="rounded-2xl overflow-hidden mb-6 h-64 relative">
            <img src={item.thumbnail || item.url} alt={item.title} className="w-full h-full object-cover" />
          </div>
        ) : null}

        <div className="glass-mid rounded-2xl p-8 mb-6"
          style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="font-black text-2xl text-white leading-tight"
              style={{ fontFamily: 'Syne, sans-serif' }}>
              {item.title}
            </h1>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={handleFavorite}
                className="p-2 rounded-xl transition-all"
                style={item.isFavorite ? {
                  background: 'rgba(255,107,107,0.18)',
                  color: '#ff6b6b',
                } : {
                  background: 'rgba(255,255,255,0.05)',
                  color: 'var(--text-3)',
                }}>
                <Heart size={18} fill={item.isFavorite ? "currentColor" : "none"} />
              </button>
              {item.url && (
                <a href={item.url} target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-xl transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-3)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--brand-light)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>
                  <ExternalLink size={18} />
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-5 text-xs text-[var(--text-3)]">
            {item.author && <span>by {item.author}</span>}
            {item.siteName && <span>· {item.siteName}</span>}
            <span>· {dayjs(item.createdAt).format("MMM D, YYYY")}</span>
            <span>· {item.viewCount} views</span>
          </div>

          {item.summary && (
            <div className="rounded-xl p-4 mb-5"
              style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.18)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Zap size={14} style={{ color: 'var(--brand)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--brand-light)' }}>AI Summary</span>
              </div>
              <p className="text-sm text-[var(--text-2)] leading-relaxed">{item.summary}</p>
            </div>
          )}

          {item.keyInsights?.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={14} style={{ color: 'var(--teal)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--teal-light)' }}>Key Insights</span>
              </div>
              <ul className="space-y-2">
                {item.keyInsights.map((insight, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-3)]">
                    <span style={{ color: 'var(--brand)', marginTop: 2 }}>•</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {item.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {item.tags.map(tag => (
                <span key={tag} className="tag-chip">
                  <Tag size={10} />#{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {related.length > 0 && (
          <div>
            <h2 className="font-bold text-lg text-white mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
              Related Knowledge
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {related.slice(0, 4).map(r => <ContentCard key={r._id} item={r} onDelete={(id) => setRelated(prev => prev.filter(c => c._id !== id))} />)}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
