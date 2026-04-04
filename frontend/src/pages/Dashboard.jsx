import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { Brain, Zap, Heart, Tag, TrendingUp, ArrowRight, Clock, Cpu } from "lucide-react";
import { contentAPI } from "../services/api.service.js";
import { useStats } from "../hooks/useContent.js";
import { useScramble } from "../hooks/useScramble.js";
import ContentCard from "../components/content/ContentCard.jsx";
import useStore from "../store/useStore.js";
import { Link } from "react-router-dom";

/* Split text into individually animated letter spans */
function SplitLetters({ text, className, style, delay = 0 }) {
  return (
    <span className={className} style={style}>
      {text.split('').map((ch, i) => (
        <span key={i} className="letter-reveal" style={{ marginRight: ch === ' ' ? '0.25em' : 0 }}>
          <span style={{ animationDelay: `${delay + i * 0.04}s` }}>
            {ch === ' ' ? '\u00A0' : ch}
          </span>
        </span>
      ))}
    </span>
  );
}

/* Stat card with spotlight mouse tracking */
function StatCard({ s, index }) {
  const ref = useRef(null);

  const onMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    ref.current.style.setProperty('--mouse-x', `${x}%`);
    ref.current.style.setProperty('--mouse-y', `${y}%`);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      initial={{ opacity: 0, y: 24, scale: 0.93 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.1 + index * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, scale: 1.03 }}
      className="card card-spotlight p-5 relative overflow-hidden cursor-default"
      style={{ background: s.bg, borderColor: s.border }}>
      {/* Animated corner accent */}
      <div className="absolute top-0 right-0 w-16 h-16 opacity-30"
        style={{
          background: `conic-gradient(from 0deg, ${s.color}, transparent)`,
          borderRadius: '0 var(--radius-lg) 0 100%',
        }} />
      {/* Pulsing dot */}
      <div className="absolute top-3 right-3 w-2 h-2 rounded-full"
        style={{ background: s.color, boxShadow: `0 0 8px ${s.color}, 0 0 16px ${s.color}40`, animation: 'pulse-ring 2s infinite' }} />
      <s.icon size={20} style={{ color: s.color }} className="mb-3 relative z-10" />
      <div className="stat-num text-white relative z-10" data-count={s.value ?? 0}
        style={{ animation: 'numReveal 0.6s cubic-bezier(0.22, 1, 0.36, 1) both', animationDelay: `${0.5 + index * 0.1}s` }}>
        {s.value ?? '–'}
      </div>
      <div className="text-xs mt-1.5 relative z-10 font-medium tracking-wider uppercase"
        style={{ color: s.color + 'cc' }}>{s.label}</div>
    </motion.div>
  );
}

function ContentList({ items, title }) {
  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold mb-4 text-white">{title}</h2>
      <div className="grid gap-4">
        {items.length === 0 ? (
          <p className="text-text-3">No items yet.</p>
        ) : (
          items.map(item => (
            <ContentCard key={item._id} item={item} />
          ))
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const stats = useStats();
  const { user } = useStore();
  const [recent, setRecent] = useState([]);
  const [resurfaced, setResurfaced] = useState([]);
  const statsRef = useRef(null);

  const greetHour = new Date().getHours();
  const greeting  = greetHour < 12 ? 'Good morning' : greetHour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] || '';

  const scrambledGreet  = useScramble(`${greeting}${firstName ? ', ' + firstName : ''}.`, 32, 5);
  const scrambledTagline = useScramble('Everything you know, connected.', 28, 4);

  const statCards = [
    { label: "Total Saved",  value: stats?.total,           icon: Brain, color: "#f59e0b", bg: "#f59e0b0d", border: "#f59e0b20" },
    { label: "AI Processed", value: stats?.aiProcessed,     icon: Cpu,   color: "#06d6a0", bg: "#06d6a00d", border: "#06d6a020" },
    { label: "Favorites",    value: stats?.favorites,       icon: Heart, color: "#ff6b6b", bg: "#ff6b6b0d", border: "#ff6b6b20" },
    { label: "Unique Tags",  value: stats?.topTags?.length, icon: Tag,   color: "#38bdf8", bg: "#38bdf80d", border: "#38bdf820" },
  ];

  // GSAP counter animation for stat numbers
  useEffect(() => {
    if (!stats || !statsRef.current) return;
    const els = statsRef.current.querySelectorAll('[data-count]');
    els.forEach(el => {
      const target = parseInt(el.dataset.count, 10);
      if (isNaN(target)) return;
      gsap.fromTo({ val: 0 }, { val: target }, {
        duration: 0.9, ease: 'power2.out', delay: 0.3,
        onUpdate: function () { el.textContent = Math.round(this.targets()[0].val); },
      });
    });
  }, [stats]);

  useEffect(() => {
    contentAPI.getAll({ limit: 6 }).then(r => setRecent(r.data || [])).catch(() => {});
    contentAPI.resurface().then(r => setResurfaced(r.data || [])).catch(() => {});
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto z-content">

      {/* ── Hero Header ── */}
      <div className="mb-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}>

          {/* Greeting — scramble text */}
          <div className="flex items-center gap-2 mb-3">
            <Clock size={12} style={{ color: 'var(--text-3)' }} />
            <p className="text-xs font-mono tracking-widest uppercase typewriter-cursor"
              style={{ color: 'var(--text-3)', fontFamily: 'Space Grotesk, monospace' }}>
              {scrambledGreet}
            </p>
          </div>

          {/* Giant headline with letter split */}
          <h1 className="leading-none mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
            <div className="overflow-hidden">
              <SplitLetters
                text="Your Second"
                className="block text-5xl font-black text-white"
                delay={0.1}
              />
            </div>
            <div className="overflow-hidden">
              <motion.span
                initial={{ y: '110%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="block gradient-text"
                style={{
                  fontFamily: 'Syne, sans-serif',
                  fontSize: 'clamp(3.5rem, 8vw, 6rem)',
                  fontWeight: 900,
                  lineHeight: 1,
                }}>
                Brain.
              </motion.span>
            </div>
          </h1>

          {/* Tagline */}
          <div className="flex items-center justify-between">
            <p className="text-[var(--text-3)] text-sm font-mono tracking-wide"
              style={{ fontFamily: 'Space Grotesk, monospace' }}>
              {scrambledTagline}
            </p>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
              className="hidden lg:flex items-center gap-2 text-xs glass px-3 py-2 rounded-xl"
              style={{ color: 'var(--text-3)' }}>
              <span className="neon-dot" />
              <span>AI online</span>
            </motion.div>
          </div>

          {/* Animated divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.8, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            style={{
              height: 1,
              marginTop: '2rem',
              background: 'linear-gradient(90deg, var(--brand) 0%, var(--teal) 50%, transparent 100%)',
              transformOrigin: 'left',
            }}
          />
        </motion.div>
      </div>

      {/* ── Stats Grid ── */}
      <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {statCards.map((s, i) => <StatCard key={s.label} s={s} index={i} />)}
      </div>

      {/* ── Resurfaced Memories ── */}
      {resurfaced.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }} className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <TrendingUp size={15} style={{ color: 'var(--brand)' }} />
              </div>
              <div>
                <h2 className="section-heading">Resurfaced Memories</h2>
                <p className="text-[10px] text-[var(--text-3)] uppercase tracking-widest mt-0.5">From your past learning</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
            {resurfaced.map((item) => <ContentCard key={item._id} item={item} onDelete={(id) => setResurfaced(prev => prev.filter(c => c._id !== id))} />)}
          </div>
        </motion.div>
      )}

      {/* ── Recently Saved ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="section-heading">Recently Saved</h2>
            <p className="text-[10px] text-[var(--text-3)] uppercase tracking-widest mt-0.5">
              {recent.length} items
            </p>
          </div>
          <Link to="/library"
            className="flex items-center gap-1.5 text-sm font-semibold group transition-all"
            style={{ color: 'var(--brand-light)' }}>
            View all
            <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform duration-200" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-20 glass rounded-2xl flex flex-col items-center gap-4"
            style={{ border: '1px dashed rgba(245,158,11,0.2)' }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center float"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
              <Brain size={28} style={{ color: 'var(--brand)' }} />
            </div>
            <div className="text-center">
              <p className="text-[var(--text-2)] font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
                Your brain is empty
              </p>
              <p className="text-[var(--text-3)] text-sm mt-1">Start saving content using the button in the sidebar</p>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
            {recent.map((item) => <ContentCard key={item._id} item={item} onDelete={(id) => setRecent(prev => prev.filter(c => c._id !== id))} />)}
          </div>
        )}
      </motion.div>
    </div>
  );
}
