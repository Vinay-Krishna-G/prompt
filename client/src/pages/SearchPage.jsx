import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, X } from 'lucide-react';
import PromptCard from '../components/PromptCard';
import { getCategories } from '../services/categoryService';
import { getPrompts } from '../services/promptService';
import { useApp } from '../context/AppContext';
import { EASE_PREMIUM } from '../lib/motion';

const TRENDING_TAGS = ['cinematic', 'neon', 'cyberpunk', 'portrait', 'abstract', 'anime', 'landscape', 'fantasy'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.055 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.62, ease: EASE_PREMIUM } },
};

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const { setSearchQuery } = useApp();
  const [localSearch, setLocalSearch] = useState(q);
  const [category, setCategory] = useState('all');
  const [type, setType] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');

  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);

  // Sync URL param → local state
  useEffect(() => {
    setLocalSearch(q);
    setSearchQuery(q);
  }, [q, setSearchQuery]);

  // Fetch categories from backend
  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.categories || []))
      .catch(() => {});
  }, []);

  // Debounced search: fires 350ms after last keystroke / filter change
  const fetchResults = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = { limit: 50, sort: '-createdAt' };
      if (localSearch.trim()) params.search = localSearch.trim();
      if (category !== 'all') params.category = category;
      if (type !== 'all') params.type = type;
      if (sortBy === 'popular') params.sort = '-copies';
      if (sortBy === 'liked') params.sort = '-likes';
      if (sortBy === 'newest') params.sort = '-createdAt';

      const res = await getPrompts(params);
      setResults(res.prompts || []);
      setTotal(res.pagination?.total ?? res.prompts?.length ?? 0);
    } catch (err) {
      console.error('Search failed', err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [localSearch, category, type, sortBy]);

  useEffect(() => {
    const timer = setTimeout(fetchResults, 350);
    return () => clearTimeout(timer);
  }, [fetchResults]);

  const clearFilters = () => {
    setCategory('all');
    setType('all');
    setSortBy('relevance');
    setLocalSearch('');
  };

  const hasFilters = category !== 'all' || type !== 'all' || sortBy !== 'relevance' || localSearch;

  return (
    <div className="min-h-screen pt-24 pb-24">
      <div className="section-contain">
        {/* Search Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.68, ease: EASE_PREMIUM }}
          className="mb-14"
        >
          <h1
            className="font-display font-bold tracking-tightest text-4xl sm:text-5xl mb-4"
            style={{ color: 'rgb(var(--text-primary))' }}
          >
            {q ? (
              <>
                Search: <span className="opacity-70">"{q}"</span>
              </>
            ) : (
              <>Explore Prompts</>
            )}
          </h1>

          {/* Main search bar */}
          <div
            className="flex items-center gap-3 p-4 rounded-2xl border focus-within:border-opacity-40 transition-colors mb-6 shadow-sm"
            style={{
              backgroundColor: 'rgba(var(--text-primary) / 0.03)',
              borderColor: 'rgba(var(--border-color) / 0.08)',
            }}
          >
            <Search
              size={20}
              className="opacity-40 flex-shrink-0"
              style={{ color: 'rgb(var(--text-primary))' }}
            />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search AI prompts, tags, models..."
              className="flex-1 bg-transparent outline-none text-base"
              style={{ color: 'rgb(var(--text-primary))' }}
              autoFocus={!q}
            />
            {localSearch && (
              <button
                onClick={() => setLocalSearch('')}
                className="opacity-30 hover:opacity-80 transition-opacity"
                style={{ color: 'rgb(var(--text-primary))' }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Trending keywords */}
          <div className="flex flex-wrap gap-2">
            <span
              className="text-xs self-center mr-1"
              style={{ color: 'rgba(var(--text-primary) / 0.4)' }}
            >
              Trending:
            </span>
            {TRENDING_TAGS.slice(0, 8).map((tag) => (
              <button
                key={tag}
                onClick={() => setLocalSearch(tag)}
                className={`tag text-xs ${localSearch === tag ? 'border-primary-500/50 text-primary-300' : ''}`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.62, ease: EASE_PREMIUM, delay: 0.12 }}
            className="hidden lg:block w-56 flex-shrink-0"
          >
            <div className="sticky top-24 space-y-6">
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center gap-2 text-sm font-semibold"
                  style={{ color: 'rgba(var(--text-primary) / 0.8)' }}
                >
                  <Filter size={14} />
                  Filters
                </div>
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Type */}
              <div>
                <p
                  className="text-xs uppercase tracking-widest mb-3"
                  style={{ color: 'rgba(var(--text-primary) / 0.4)' }}
                >
                  Type
                </p>
                <div className="space-y-1">
                  {[
                    { value: 'all', label: 'All Types' },
                    { value: 'image', label: '🖼 Image Prompts' },
                    { value: 'video', label: '▶ Video Prompts' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setType(opt.value)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${
                        type === opt.value
                          ? 'font-medium border'
                          : 'hover:bg-background/5 dark:hover:bg-primary/5'
                      }`}
                      style={
                        type === opt.value
                          ? {
                              backgroundColor: 'rgb(var(--text-primary))',
                              color: 'rgb(var(--bg-primary))',
                              borderColor: 'transparent',
                            }
                          : {
                              color: 'rgba(var(--text-primary) / 0.7)',
                            }
                      }
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <p
                  className="text-xs uppercase tracking-widest mb-3"
                  style={{ color: 'rgba(var(--text-primary) / 0.4)' }}
                >
                  Category
                </p>
                <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                  <button
                    onClick={() => setCategory('all')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${
                      category === 'all'
                        ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                        : 'text-primary/60 hover:text-primary hover:bg-primary/5'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => setCategory(cat.name)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all flex items-center gap-2 ${
                        category === cat.name
                          ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                          : 'text-primary/60 hover:text-primary hover:bg-primary/5'
                      }`}
                    >
                      {cat.icon && <span className="text-base">{cat.icon}</span>}
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <p
                  className="text-xs uppercase tracking-widest mb-3"
                  style={{ color: 'rgba(var(--text-primary) / 0.4)' }}
                >
                  Sort By
                </p>
                <div className="space-y-1">
                  {[
                    { value: 'relevance', label: 'Relevance' },
                    { value: 'popular', label: 'Most Copied' },
                    { value: 'newest', label: 'Newest' },
                    { value: 'liked', label: 'Most Liked' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSortBy(opt.value)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${
                        sortBy === opt.value
                          ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                          : 'text-primary/60 hover:text-primary hover:bg-primary/5'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            <div
              className="flex items-center justify-between mb-6 pb-2"
              style={{ borderBottom: '1px solid rgba(var(--border-color) / 0.06)' }}
            >
              <p className="text-sm" style={{ color: 'rgba(var(--text-primary) / 0.5)' }}>
                <span className="font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
                  {isLoading ? '...' : total}
                </span>{' '}
                prompts found
              </p>
              {/* Mobile sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="lg:hidden border rounded-xl px-3 py-2 text-sm outline-none"
                style={{
                  backgroundColor: 'rgba(var(--text-primary) / 0.05)',
                  borderColor: 'rgba(var(--border-color) / 0.1)',
                  color: 'rgb(var(--text-primary))',
                }}
              >
                <option value="relevance" style={{ color: '#000' }}>Relevance</option>
                <option value="popular" style={{ color: '#000' }}>Most Copied</option>
                <option value="newest" style={{ color: '#000' }}>Newest</option>
                <option value="liked" style={{ color: '#000' }}>Most Liked</option>
              </select>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl bg-primary/5 animate-pulse"
                    style={{ height: 280 }}
                  />
                ))}
              </div>
            ) : results.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-24"
              >
                <div className="text-6xl mb-4 opacity-50">🔍</div>
                <h3
                  className="font-display font-bold text-2xl mb-2"
                  style={{ color: 'rgb(var(--text-primary))' }}
                >
                  No results found
                </h3>
                <p style={{ color: 'rgba(var(--text-primary) / 0.5)' }}>
                  Try different keywords or browse all categories
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={`${localSearch}-${category}-${type}-${sortBy}`}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {results.map((prompt, i) => (
                  <motion.div key={prompt._id || prompt.id} variants={itemVariants}>
                    <PromptCard prompt={prompt} index={i} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
