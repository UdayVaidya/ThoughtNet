import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { authAPI } from '../services/api.service.js';
import useStore from '../store/useStore.js';
import toast from 'react-hot-toast';
import { Brain, Mail, Lock, User, Sparkles, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useScramble } from '../hooks/useScramble.js';

/* ── Animated grid lines ── */
function GridLines() {
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      backgroundImage: `
        linear-gradient(rgba(245,158,11,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(245,158,11,0.04) 1px, transparent 1px)
      `,
      backgroundSize: '60px 60px',
    }} />
  );
}

/* ── Floating blobs ── */
function Blobs() {
  return (
    <>
      <div style={{
        position: 'absolute', width: 700, height: 700, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)',
        top: -300, left: -200,
        filter: 'blur(80px)',
        animation: 'meshDrift1 24s ease-in-out infinite alternate',
      }} />
      <div style={{
        position: 'absolute', width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(6,214,160,0.09) 0%, transparent 70%)',
        bottom: -200, right: -150,
        filter: 'blur(70px)',
        animation: 'meshDrift2 30s ease-in-out infinite alternate',
      }} />
    </>
  );
}

export default function AuthPage() {
  const [isLogin, setIsLogin]             = useState(true);
  const [loading, setLoading]             = useState(false);
  const [showPassword, setShowPassword]   = useState(false);
  const [formData, setFormData]           = useState({ name: '', email: '', password: '' });
  const setUser = useStore(s => s.setUser);

  const containerRef = useRef(null);
  const logoRef      = useRef(null);
  const canvasRef    = useRef(null);

  const headline = useScramble('ThoughtNet', 45, 7);

  /* ── Particle canvas ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx    = canvas.getContext('2d');
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const colorSets = [
      [245, 158, 11],
      [6,   214, 160],
      [56,  189, 248],
      [255, 107, 107],
    ];

    const particles = Array.from({ length: 50 }, () => {
      const c = colorSets[Math.floor(Math.random() * colorSets.length)];
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.5 + 0.08,
        color: c,
      };
    });

    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${p.alpha})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  /* ── Logo entrance ── */
  useEffect(() => {
    if (!logoRef.current) return;
    gsap.fromTo(logoRef.current,
      { scale: 0, rotation: -180, opacity: 0 },
      { scale: 1, rotation: 0, opacity: 1, duration: 1.2, ease: 'elastic.out(1, 0.5)', delay: 0.4 }
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = isLogin
        ? await authAPI.login({ email: formData.email, password: formData.password })
        : await authAPI.register(formData);
      if (res.token) localStorage.setItem('thoughtnet_token', res.token);
      setUser(res.user);
      toast.success(`Welcome${isLogin ? ' back' : ''}, ${res.user.name}! 🧠`);
    } catch (err) {
      toast.error(err.message || 'Authentication failed');
      gsap.fromTo(containerRef.current,
        { x: -12 }, { x: 12, duration: 0.08, repeat: 6, yoyo: true, ease: 'power2.inOut',
          onComplete: () => gsap.set(containerRef.current, { x: 0 }) }
      );
    } finally { setLoading(false); }
  };

  const field = (key) => ({
    value: formData[key],
    onChange: e => setFormData(f => ({ ...f, [key]: e.target.value })),
  });

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: 'var(--bg-0)' }}>

      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      <GridLines />
      <Blobs />

      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, y: 40, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Logo + Title */}
        <div className="flex flex-col items-center mb-10">
          <motion.div ref={logoRef}
            className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 grad-border"
            style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(6,214,160,0.12))' }}>
            <Brain size={38} style={{ color: '#f59e0b' }} />
          </motion.div>

          <h1 className="text-4xl font-black text-white tracking-tight glitch"
            data-text={headline}
            style={{ fontFamily: 'Syne, sans-serif' }}>
            <span className="gradient-text">{headline}</span>
          </h1>
          <p className="text-[var(--text-3)] text-sm mt-2 tracking-wider uppercase font-mono">
            AI-Powered Second Brain
          </p>

          {/* Feature tags */}
          <div className="flex gap-3 mt-4">
            {[
              { label: 'Vector', color: '#f59e0b' },
              { label: 'Semantic', color: '#06d6a0' },
              { label: 'Graphs', color: '#38bdf8' },
            ].map(f => (
              <span key={f.label} className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-lg font-semibold"
                style={{ background: `${f.color}12`, color: f.color, border: `1px solid ${f.color}25` }}>
                {f.label}
              </span>
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="glass-mid rounded-[var(--radius-lg)] p-8 shadow-2xl"
          style={{ border: '1px solid rgba(245,158,11,0.12)' }}>

          {/* Toggle */}
          <div className="flex bg-[rgba(255,255,255,0.04)] rounded-xl p-1 mb-8 relative">
            <motion.div
              className="absolute top-1 bottom-1 rounded-[10px]"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                boxShadow: '0 4px 20px rgba(245,158,11,0.4)',
              }}
              animate={{ left: isLogin ? '4px' : 'calc(50%)', right: isLogin ? 'calc(50%)' : '4px' }}
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
            {['Sign In', 'Sign Up'].map((label, i) => (
              <button key={label} onClick={() => setIsLogin(i === 0)}
                className="relative flex-1 py-2 text-sm font-semibold z-10 transition-colors duration-200"
                style={{ color: (i === 0) === isLogin ? '#0b0b0f' : 'var(--text-3)' }}>
                {label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <AnimatePresence>
              {!isLogin && (
                <motion.div key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}>
                  <div className="relative">
                    <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
                    <input type="text" placeholder="Full Name" required autoComplete="name"
                      className="input-field pl-11" {...field('name')} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
              <input type="email" placeholder="Email address" required autoComplete="email"
                className="input-field pl-11" {...field('email')} />
            </div>

            <div className="relative">
              <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
              <input type={showPassword ? 'text' : 'password'} placeholder="Password" required
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                className="input-field pl-11 pr-11" {...field('password')} />
              <button type="button" onClick={() => setShowPassword(s => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: 'var(--text-3)' }}>
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02, y: -1 }}
              whileTap={{ scale: loading ? 1 : 0.97 }}
              className="btn-primary w-full relative overflow-hidden"
              style={{ height: 50, marginTop: 8 }}>
              {loading ? (
                <div className="w-5 h-5 border-2 rounded-full animate-spin"
                  style={{ borderColor: 'rgba(11,11,15,0.3)', borderTopColor: '#0b0b0f' }} />
              ) : (
                <>
                  <Sparkles size={16} />
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={16} className="ml-auto" />
                </>
              )}
            </motion.button>
          </form>

          <p className="text-center text-[var(--text-3)] text-sm mt-6">
            {isLogin ? "New here? " : "Already a member? "}
            <button onClick={() => setIsLogin(v => !v)}
              className="font-semibold hover:text-white transition-colors"
              style={{ color: 'var(--brand-light)' }}>
              {isLogin ? 'Create account' : 'Sign in instead'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
