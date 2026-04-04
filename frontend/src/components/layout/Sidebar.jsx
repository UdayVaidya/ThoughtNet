import React, { useState, useRef, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import {
  Brain, LayoutDashboard, Library, Search, FolderOpen,
  BarChart2, Plus, LogOut, User, ChevronRight, Sparkles, Network,
} from "lucide-react";
import SaveModal from "../content/SaveModal.jsx";
import { authAPI } from "../../services/api.service.js";
import useStore from "../../store/useStore.js";

const navItems = [
  { to: "/",            icon: LayoutDashboard, label: "Dashboard",       color: "#f59e0b" },
  { to: "/library",     icon: Library,         label: "Library",         color: "#06d6a0" },
  { to: "/search",      icon: Search,          label: "Semantic Search", color: "#38bdf8" },
  { to: "/collections", icon: FolderOpen,      label: "Collections",     color: "#fb923c" },
  { to: "/graph",       icon: Network,         label: "Knowledge Graph", color: "#a78bfa" },
  { to: "/insights",    icon: BarChart2,       label: "Insights",        color: "#f43f5e" },
];

export default function Sidebar({ isOpen, onClose }) {
  const [showSave, setShowSave] = useState(false);
  const { user, setUser } = useStore();
  const location = useLocation();
  const btnRef = useRef(null);
  const sidebarRef = useRef(null);
  const logoRef = useRef(null);

  // Close mobile sidebar on link click
  useEffect(() => {
    if (window.innerWidth < 1024) onClose();
  }, [location.pathname]);

  useEffect(() => {
    if (!logoRef.current) return;
    gsap.fromTo(logoRef.current,
      { scale: 0.5, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(2)", delay: 0.4 }
    );
  }, []);

  const handleLogout = async () => {
    await authAPI.logout();
    setUser(null);
  };

  const handleSaveClick = () => {
    const btn = btnRef.current;
    if (btn) gsap.fromTo(btn, { scale: 0.92 }, { scale: 1, duration: 0.3, ease: "back.out(3)" });
    setShowSave(true);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside 
        ref={sidebarRef} 
        className={`fixed inset-y-0 left-0 lg:static w-72 h-full flex flex-col shrink-0 z-[101] transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          background: 'rgba(6,6,8,0.95)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}>

        {/* Gradient accent line on the right edge */}
        <div className="sidebar-glow-line" />

        {/* Logo */}
        <div className="p-6 pb-4">
          <div ref={logoRef} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center grad-border relative"
              style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(245,158,11,0.08))' }}>
              <Brain size={18} className="relative z-10" style={{ color: '#f59e0b' }} />
            </div>
            <div>
              <span className="font-black text-[1.1rem] text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                Thought<span className="gradient-text">Net</span>
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="neon-dot" />
                <span className="text-[10px] text-[var(--text-3)] font-medium tracking-wider uppercase">AI Powered</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 pb-4">
          <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.12), transparent)' }} />
        </div>

        {/* Save Button */}
        <div className="px-4 pb-5">
          <motion.button
            ref={btnRef}
            onClick={handleSaveClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="w-full btn-primary justify-center gap-2 relative overflow-hidden"
            style={{ height: 44 }}>
            <Plus size={16} />
            Save Content
            <Sparkles size={13} className="opacity-70" />
          </motion.button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label, color }, index) => {
            return (
              <NavLink key={to} to={to} end={to === "/"}>
                {({ isActive: active }) => (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.07 + 0.5, duration: 0.4 }}
                    className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group cursor-pointer"
                    style={{
                      background: active ? `${color}10` : 'transparent',
                      color: active ? color : 'var(--text-3)',
                      border: `1px solid ${active ? `${color}22` : 'transparent'}`,
                    }}
                    whileHover={{ x: 2 }}>
                    {active && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                        style={{ background: color, boxShadow: `0 0 10px ${color}` }}
                      />
                    )}
                    <Icon size={17} style={{ color: active ? color : undefined }} />
                    <span style={{ fontFamily: 'Space Grotesk, DM Sans, sans-serif' }}>{label}</span>
                    {active && (
                      <ChevronRight size={14} className="ml-auto opacity-50" style={{ color }} />
                    )}
                  </motion.div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {user && (
            <div className="mb-3 flex items-center gap-3 px-2 py-2 rounded-xl"
              style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.08)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#0b0b0f' }}>
                {user.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[var(--text-1)] truncate">{user.name}</p>
                <p className="text-[10px] text-[var(--text-3)] truncate">{user.email}</p>
              </div>
            </div>
          )}
          <motion.button
            onClick={handleLogout}
            whileHover={{ x: 3 }}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-[var(--text-3)] hover:text-[var(--coral)] rounded-lg transition-colors duration-200">
            <LogOut size={16} />
            Sign Out
          </motion.button>
        </div>
      </aside>

      <AnimatePresence>
        {showSave && <SaveModal onClose={() => setShowSave(false)} />}
      </AnimatePresence>
    </>
  );
}
