import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Sidebar from "./components/layout/Sidebar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import LibraryPage from "./pages/LibraryPage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import CollectionsPage from "./pages/CollectionsPage.jsx";
import GraphPage from "./pages/GraphPage.jsx";
import InsightsPage from "./pages/InsightsPage.jsx";
import ContentDetailPage from "./pages/ContentDetailPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import useStore from "./store/useStore.js";
import { authAPI } from "./services/api.service.js";
import { Brain } from "lucide-react";

import MeshBackground from "./components/ui/MeshBackground.jsx";

export default function App() {
  const { user, setUser, isAuthChecking, setIsAuthChecking } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  useEffect(() => {
    authAPI.getProfile()
      .then((res) => {
        setUser(res.user);
        if (res.token) localStorage.setItem('thoughtnet_token', res.token);
      })
      .catch(() => setUser(null))
      .finally(() => setIsAuthChecking(false));
  }, [setUser, setIsAuthChecking]);

  const toastStyle = {
    style: {
      background: '#111116',
      color: '#f8f4ef',
      border: '1px solid rgba(245,158,11,0.2)',
      fontFamily: 'Space Grotesk, DM Sans, sans-serif',
      fontSize: '14px',
      borderRadius: '12px',
    },
  };

  if (isAuthChecking) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: '#060608' }}>

        <div className="flex flex-col items-center gap-4">
          {/* Animated logo-ish spinner */}
          <div style={{ position: 'relative', width: 48, height: 48 }}>
            <div className="w-12 h-12 rounded-full border-2 animate-spin"
              style={{ borderColor: 'rgba(245,158,11,0.15)', borderTopColor: '#f59e0b' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full" style={{ background: '#f59e0b', boxShadow: '0 0 8px #f59e0b' }} />
            </div>
          </div>
          <span className="text-xs tracking-widest uppercase"
            style={{ color: '#5c5650', fontFamily: 'Space Grotesk, sans-serif' }}>
            Loading ThoughtNet...
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>

        <Toaster position="top-right" toastOptions={toastStyle} />
        <AuthPage />
      </>
    );
  }

  return (
    <BrowserRouter>
      <MeshBackground />
      <Toaster position="top-right" toastOptions={toastStyle} />

      {/* Mobile Top Header (Visible only on mobile) */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 h-16 glass z-40 px-4 flex items-center justify-between border-b border-white/5 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="flex items-center gap-3">
          <div  className="flex items-center gap-3">
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
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 rounded-lg bg-white/5 text-white active:scale-95 transition-all"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>

      <div className="flex h-screen overflow-hidden" style={{ position: 'relative', zIndex: 1 }}>
        <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        <main className="flex-1 overflow-y-auto pt-16 lg:pt-0" style={{ background: 'transparent' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/graph" element={<GraphPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/content/:id" element={<ContentDetailPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
