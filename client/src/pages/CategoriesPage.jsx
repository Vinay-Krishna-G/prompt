import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Filter, SlidersHorizontal } from 'lucide-react';
import PromptCard from '../components/PromptCard';
import CategoryCard from '../components/CategoryCard';
import { getCategories } from '../services/categoryService';
import { getPrompts } from '../services/promptService';
import { EASE_PREMIUM } from '../lib/motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.055 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.62, ease: EASE_PREMIUM } },
};

const CategoriesPage = () => {
  const [selectedCat, setSelectedCat] = useState(null);
  const [sortBy, setSortBy] = useState('popular');

  const [categories, setCategories] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPrompts, setTotalPrompts] = useState(0);

  // Fetch categories from backend
  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.categories || []))
      .catch(() => {});
  }, []);

  // Fetch prompts when category or sort changes
  const fetchPrompts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = { limit: 100 };
      if (selectedCat) params.category = selectedCat;
      if (sortBy === 'popular') params.sort = '-copies';
      if (sortBy === 'newest') params.sort = '-createdAt';
      if (sortBy === 'liked') params.sort = '-likes';

      const res = await getPrompts(params);
      setPrompts(res.prompts || []);
      setTotalPrompts(res.pagination?.total ?? res.prompts?.length ?? 0);
    } catch (err) {
      console.error('Failed to load prompts', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCat, sortBy]);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  const selectedCatObj = categories.find((c) => c.name === selectedCat);

  return (
    <div className="min-h-screen pt-24 pb-24">
      <div className="section-contain">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.68, ease: EASE_PREMIUM }}
          className="mb-16"
        >
          <h1
            className="font-display font-bold tracking-tightest text-5xl sm:text-6xl mb-3"
            style={{ color: 'rgb(var(--text-primary))' }}
          >
            Browse Categories
          </h1>
          <p className="text-lg" style={{ color: 'rgba(var(--text-primary) / 0.6)' }}>
            {categories.length} categories • {totalPrompts} prompts
          </p>
        </motion.div>

        {/* Categories grid */}
        {categories.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-14"
          >
            {categories.map((cat, i) => (
              <motion.div
                key={cat._id}
                variants={itemVariants}
                onClick={() => setSelectedCat(selectedCat === cat.name ? null : cat.name)}
                className={`cursor-pointer transition-all ${
                  selectedCat === cat.name ? 'ring-2 ring-primary-500 rounded-2xl' : ''
                }`}
              >
                <CategoryCard category={cat} index={i} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Filter bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex items-center justify-between gap-4 mb-8 flex-wrap"
        >
          <div className="flex items-center gap-2">
            <Filter
              size={16}
              className="opacity-50"
              style={{ color: 'rgb(var(--text-primary))' }}
            />
            <span
              className="text-sm font-medium"
              style={{ color: 'rgba(var(--text-primary) / 0.7)' }}
            >
              {selectedCat
                ? `${selectedCatObj?.name || selectedCat} — ${prompts.length} prompts`
                : `All prompts — ${prompts.length} results`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal
              size={16}
              className="opacity-50"
              style={{ color: 'rgb(var(--text-primary))' }}
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border rounded-xl px-3 py-2 text-sm outline-none"
              style={{
                backgroundColor: 'rgba(var(--text-primary) / 0.05)',
                borderColor: 'rgba(var(--border-color) / 0.1)',
                color: 'rgb(var(--text-primary))',
              }}
            >
              <option value="popular" style={{ color: '#000' }}>Most Popular</option>
              <option value="newest" style={{ color: '#000' }}>Newest</option>
              <option value="liked" style={{ color: '#000' }}>Most Liked</option>
            </select>
          </div>
        </motion.div>

        {/* Prompts grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-primary/5 animate-pulse" style={{ height: 260 }} />
            ))}
          </div>
        ) : (
          <motion.div
            key={`${selectedCat}-${sortBy}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {prompts.map((prompt, i) => (
              <motion.div key={prompt._id || prompt.id} variants={itemVariants}>
                <PromptCard prompt={prompt} index={i} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
