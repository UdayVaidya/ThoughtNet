import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Sidebar from "./components/layout/Sidebar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import LibraryPage from "./pages/LibraryPage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import CollectionsPage from "./pages/CollectionsPage.jsx";
import GraphPage from "./pages/GraphPage.jsx";
import ContentDetailPage from "./pages/ContentDetailPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import useStore from "./store/useStore.js";
import { authAPI } from "./services/api.service.js";

import MeshBackground from "./components/ui/MeshBackground.jsx";

export default function App() {
  const { user, setUser, isAuthChecking, setIsAuthChecking } = useStore();

  useEffect(() => {
    authAPI.getProfile()
      .then((res) => setUser(res.user))
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
      <div className="flex h-screen overflow-hidden" style={{ position: 'relative', zIndex: 1 }}>
        <Sidebar />
        <main className="flex-1 overflow-y-auto" style={{ background: 'transparent' }}>
          <Routes>
            <Route path="/"           element={<Dashboard />} />
            <Route path="/library"    element={<LibraryPage />} />
            <Route path="/search"     element={<SearchPage />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/graph"      element={<GraphPage />} />
            <Route path="/content/:id" element={<ContentDetailPage />} />
            <Route path="*"           element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
