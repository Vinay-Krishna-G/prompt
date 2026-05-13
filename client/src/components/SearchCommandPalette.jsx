import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, CornerDownLeft, Sparkles, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PROMPTS, AI_MODELS } from '../data/mockData';
import { EASE_PREMIUM } from '../lib/motion';

const MAX_SUGGESTIONS = 6;

const SearchCommandPalette = () => {
  const navigate = useNavigate();
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    recentSearches,
    addRecentSearch,
    setSearchQuery,
  } = useApp();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return PROMPTS.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.aiModel.toLowerCase().includes(q)
    ).slice(0, MAX_SUGGESTIONS);
  }, [query]);

  const goSearch = useCallback(
    (q) => {
      const t = (q ?? query).trim();
      if (!t) return;
      addRecentSearch(t);
      setSearchQuery(t);
      setCommandPaletteOpen(false);
      setQuery('');
      setActiveIndex(-1);
      navigate(`/search?q=${encodeURIComponent(t)}`);
    },
    [query, addRecentSearch, navigate, setCommandPaletteOpen, setSearchQuery]
  );

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setCommandPaletteOpen]);

  useEffect(() => {
    if (!commandPaletteOpen) return;
    document.body.style.overflow = 'hidden';
    const t = requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      cancelAnimationFrame(t);
      document.body.style.overflow = '';
    };
  }, [commandPaletteOpen]);

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setCommandPaletteOpen(false);
      setQuery('');
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const len = suggestions.length;
      if (!len) return;
      setActiveIndex((i) => (i + 1) % len);
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const len = suggestions.length;
      if (!len) return;
      setActiveIndex((i) => (i <= 0 ? len - 1 : i - 1));
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        goSearch(suggestions[activeIndex].title);
      } else {
        goSearch(query);
      }
    }
  };

  const overlay = (
    <AnimatePresence>
      {commandPaletteOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Search vault"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: EASE_PREMIUM }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-start pt-[8vh] px-4"
          style={{
            backgroundColor: 'rgba(var(--bg-primary) / 0.72)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
          }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setCommandPaletteOpen(false);
              setQuery('');
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.62, ease: EASE_PREMIUM }}
            className="w-full max-w-2xl rounded-2xl border overflow-hidden shadow-2xl"
            style={{
              backgroundColor: 'rgba(var(--bg-surface) / 0.92)',
              borderColor: 'rgba(var(--border-color) / 0.08)',
              boxShadow:
                '0 24px 80px -24px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)',
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center gap-3 px-5 py-4 border-b"
              style={{ borderColor: 'rgba(var(--border-color) / 0.06)' }}
            >
              <Search
                size={20}
                className="shrink-0 opacity-45"
                style={{ color: 'rgb(var(--text-primary))' }}
              />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(-1);
                }}
                onKeyDown={onKeyDown}
                placeholder="Search prompts, models, tags…"
                className="flex-1 bg-transparent outline-none text-base md:text-lg font-medium placeholder:opacity-40"
                style={{ color: 'rgb(var(--text-primary))' }}
                autoComplete="off"
                autoCorrect="off"
              />
              <kbd
                className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-sans px-2 py-1 rounded-md opacity-35"
                style={{
                  border: '1px solid rgba(var(--border-color) / 0.12)',
                  color: 'rgb(var(--text-primary))',
                }}
              >
                esc
              </kbd>
            </div>

            <div className="max-h-[min(56vh,520px)] overflow-y-auto overscroll-contain px-5 py-4 space-y-6">
              {recentSearches.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3 text-[11px] font-semibold uppercase tracking-widest opacity-45">
                    <Clock size={12} />
                    Recent
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => goSearch(term)}
                        className="px-3 py-1.5 rounded-full text-[13px] transition-opacity duration-300 hover:opacity-100 opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(var(--accent),0.5)]"
                        style={{
                          backgroundColor: 'rgba(var(--text-primary) / 0.06)',
                          color: 'rgb(var(--text-primary))',
                        }}
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <div className="flex items-center gap-2 mb-3 text-[11px] font-semibold uppercase tracking-widest opacity-45">
                  <Sparkles size={12} />
                  Trending models
                </div>
                <div className="flex flex-wrap gap-2">
                  {AI_MODELS.slice(0, 8).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => goSearch(m)}
                      className="px-3 py-1.5 rounded-full text-[12px] transition-opacity duration-300 hover:opacity-100 opacity-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(var(--accent),0.5)]"
                      style={{
                        border: '1px solid rgba(var(--border-color) / 0.1)',
                        color: 'rgba(var(--text-primary) / 0.85)',
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </section>

              {suggestions.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-2 text-[11px] font-semibold uppercase tracking-widest opacity-45">
                    <Command size={12} />
                    Matches
                  </div>
                  <ul className="space-y-0.5">
                    {suggestions.map((p, i) => (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() => goSearch(p.title)}
                          className={`w-full text-left px-3 py-2.5 rounded-xl text-[14px] transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(var(--accent),0.45)] ${
                            i === activeIndex ? 'bg-[rgba(var(--text-primary)/0.08)]' : 'hover:bg-[rgba(var(--text-primary)/0.04)]'
                          }`}
                          style={{ color: 'rgb(var(--text-primary))' }}
                        >
                          <span className="font-medium line-clamp-1">{p.title}</span>
                          <span
                            className="block text-[11px] mt-0.5 opacity-50 truncate"
                            style={{ color: 'rgb(var(--text-primary))' }}
                          >
                            {p.aiModel} · {p.categoryName}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <p
                className="flex items-center gap-2 text-[12px] pt-2 opacity-40"
                style={{ color: 'rgb(var(--text-primary))' }}
              >
                <CornerDownLeft size={14} />
                Enter to search · arrows to navigate matches
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(overlay, document.body);
};

export default SearchCommandPalette;
