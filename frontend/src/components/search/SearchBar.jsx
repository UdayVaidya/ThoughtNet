import React, { useRef } from "react";
import { Search, X, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SearchBar({ value, onChange, onSearch, placeholder = "Search your knowledge..." }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const handleKey = (e) => {
    if (e.key === "Enter") {
      onSearch ? onSearch(value) : navigate(`/search?q=${encodeURIComponent(value)}`);
    }
  };

  return (
    <div className="relative group">
      <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200"
        style={{ color: 'var(--text-3)' }}
        /* focus-within handled inline via sibling selector below */ />
      <input
        ref={inputRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKey}
        placeholder={placeholder}
        className="w-full rounded-2xl pl-12 pr-12 py-3.5 text-sm text-white outline-none transition-all"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          fontFamily: 'Space Grotesk, DM Sans, sans-serif',
        }}
        onFocus={e => {
          e.target.style.borderColor = 'var(--brand)';
          e.target.style.background = 'rgba(245,158,11,0.05)';
          e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.10)';
        }}
        onBlur={e => {
          e.target.style.borderColor = 'rgba(255,255,255,0.08)';
          e.target.style.background = 'rgba(255,255,255,0.04)';
          e.target.style.boxShadow = 'none';
        }}
      />
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {value && (
          <button onClick={() => onChange("")}>
            <X size={16} className="text-[var(--text-3)] hover:text-white transition-colors" />
          </button>
        )}
        <Sparkles size={15} style={{ color: 'var(--brand)' }} title="Semantic AI Search" />
      </div>
    </div>
  );
}
