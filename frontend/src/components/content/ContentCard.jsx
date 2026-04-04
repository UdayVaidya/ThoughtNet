import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ExternalLink, Youtube, Twitter, FileText, Globe, Image, File, Zap, Trash2 } from "lucide-react";
import { contentAPI } from "../../services/api.service.js";
import useStore from "../../store/useStore.js";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

const typeIcons  = { youtube: Youtube, tweet: Twitter, note: FileText, webpage: Globe, image: Image, pdf: File, article: Globe };
const typeColors = { youtube: "#ef4444", tweet: "#38bdf8", note: "#facc15", webpage: "#06d6a0", image: "#f472b6", pdf: "#fb923c", article: "#f59e0b" };
const typeBg     = { youtube: "#ef444415", tweet: "#38bdf815", note: "#facc1515", webpage: "#06d6a015", image: "#f472b615", pdf: "#fb923c15", article: "#f59e0b15" };

export default function ContentCard({ item, onUpdate, onDelete }) {
  const cardRef    = useRef(null);
  const rafRef     = useRef(null);
  const navigate   = useNavigate();
  const removeContent = useStore(s => s.removeContent);

  const Icon  = typeIcons[item.type]  || Globe;
  const color = typeColors[item.type] || "#f59e0b";
  const bg    = typeBg[item.type]     || "#f59e0b15";
  const imageSource = item.thumbnail || (item.type === 'image' ? item.url : null);

  const onMouseMove = (e) => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x  = e.clientX - rect.left;
      const y  = e.clientY - rect.top;
      const rx = ((y - rect.height / 2) / rect.height) * -7;
      const ry = ((x - rect.width  / 2) / rect.width)  *  7;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
      card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
      card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
    });
  };

  const onMouseLeave = () => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)';
      cardRef.current.style.transition = 'transform 0.5s cubic-bezier(0.22,1,0.36,1)';
      setTimeout(() => {
        if (cardRef.current) cardRef.current.style.transition = '';
      }, 500);
    }
  };

  const handleCardClick = (e) => {
    if (e.target.closest('button') || e.target.closest('a')) return;
    navigate(`/content/${item._id}`);
  };

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const el = e.currentTarget;
      el.style.transform = 'scale(1.4) rotate(-15deg)';
      setTimeout(() => { el.style.transform = ''; }, 300);
      const res = await contentAPI.toggleFavorite(item._id);
      onUpdate?.(item._id, { isFavorite: res.isFavorite });
      window.dispatchEvent(new CustomEvent('refresh-content'));
      toast.success(res.isFavorite ? "❤️ Added to favorites" : "Removed from favorites");
    } catch { toast.error("Failed"); }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await contentAPI.delete(item._id);
      removeContent(item._id);
      onDelete?.(item._id);
      window.dispatchEvent(new CustomEvent('refresh-content'));
      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onClick={handleCardClick}
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="h-full cursor-pointer"
      style={{ willChange: 'transform' }}>

      <div className="card card-spotlight flex flex-col overflow-hidden h-full group"
        style={{ background: 'rgba(255,255,255,0.025)' }}>

        {/* Thumbnail */}
        {imageSource ? (
          <div className="h-36 overflow-hidden relative">
            <img src={imageSource} alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy" />
            <div className="absolute top-0 left-0 right-0 h-0.5"
              style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
          </div>
        ) : (
          <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${color}70, transparent)` }} />
        )}

        <div className="p-4 flex flex-col flex-1">
          {/* Type badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-semibold capitalize"
              style={{ background: bg, color, border: `1px solid ${color}30` }}>
              <Icon size={11} />{item.type}
            </span>
            {item.aiProcessing && (
              <span className="badge badge-processing gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
                Processing
              </span>
            )}
            {item.aiProcessed && !item.aiProcessing && (
              <span className="badge badge-ready gap-1"><Zap size={9} />AI Ready</span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-bold text-sm text-white mb-1.5 line-clamp-2 leading-snug transition-colors duration-150 break-all overflow-hidden"
            style={{ fontFamily: 'Syne, sans-serif', overflowWrap: 'anywhere' }}
            onMouseEnter={e => e.currentTarget.style.color = color}
            onMouseLeave={e => e.currentTarget.style.color = ''}>
            {item.title}
          </h3>

          {/* Summary */}
          {item.summary && (
            <p className="text-xs text-[var(--text-3)] line-clamp-2 mb-3 leading-relaxed flex-1 break-words"
               style={{ overflowWrap: 'anywhere' }}>
              {item.summary}
            </p>
          )}

          {/* Tags */}
          {item.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {item.tags.slice(0, 3).map(tag => (
                <span key={tag} className="tag-chip">#{tag}</span>
              ))}
              {item.tags.length > 3 && (
                <span className="tag-chip" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-3)', borderColor: 'var(--border)' }}>
                  +{item.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-auto pt-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <span className="text-[11px] text-[var(--text-3)]">{dayjs(item.createdAt).fromNow()}</span>
            <div className="flex items-center gap-1.5">
              <button onClick={handleFavorite}
                className="p-1.5 rounded-lg transition-colors duration-150"
                style={{
                  color:      item.isFavorite ? '#ff6b6b' : 'var(--text-3)',
                  background: item.isFavorite ? 'rgba(255,107,107,0.12)' : 'transparent',
                  transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1)',
                }}>
                <Heart size={13} fill={item.isFavorite ? "currentColor" : "none"} />
              </button>
              {item.url && (
                <a href={item.url} target="_blank" rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="p-1.5 rounded-lg text-[var(--text-3)] hover:text-[var(--brand-light)] transition-colors duration-150">
                  <ExternalLink size={13} />
                </a>
              )}
              <button
                onClick={handleDelete}
                title="Delete item"
                className="p-1.5 rounded-lg transition-all duration-200 text-[var(--text-3)] hover:text-[#ff6b6b]">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
