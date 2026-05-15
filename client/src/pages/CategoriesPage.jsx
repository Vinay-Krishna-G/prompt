import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  const { id: categorySlug } = useParams();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('popular');

  const [categories, setCategories] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [totalPrompts, setTotalPrompts] = useState(0);

  // 1. Fetch categories first
  useEffect(() => {
    setIsLoadingCategories(true);
    getCategories()
      .then((res) => {
        setCategories(res.categories || []);
      })
      .catch(() => {})
      .finally(() => setIsLoadingCategories(false));
  }, []);

  // 2. Sync category name based on current slug
  const selectedCatObj = categories.find((c) => c.slug === categorySlug);
  const selectedCatName = selectedCatObj?.name || null;

  // 3. Fetch prompts when category identity or sort changes
  const fetchPrompts = useCallback(async () => {
    // If a slug is in URL but categories aren't loaded, wait
    if (categorySlug && isLoadingCategories) return;
    
    // If we have a slug but it doesn't match any category name yet, 
    // it means we're still waiting for categories to map slug -> name
    if (categorySlug && !selectedCatName && !isLoadingCategories) {
       // Optional: handle invalid category slug
    }

    setIsLoading(true);
    try {
      const params = { limit: 100 };
      if (selectedCatName) params.category = selectedCatName;
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
  }, [categorySlug, selectedCatName, sortBy, isLoadingCategories]);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  return (
    <div className="min-h-screen pt-20 pb-20">
      <div className="section-contain">
        {/* Header - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: EASE_PREMIUM }}
          className="mb-8"
        >
          <h1
            className="font-display font-bold tracking-tightest text-3xl sm:text-4xl mb-2"
            style={{ color: 'rgb(var(--text-primary))' }}
          >
            Browse Categories
          </h1>
          <p className="text-sm opacity-60" style={{ color: 'rgb(var(--text-primary))' }}>
            Explore {categories.length} editorial collections • {totalPrompts} assets
          </p>
        </motion.div>

        {/* Categories grid - Much smaller and more columns */}
        {categories.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 mb-10"
          >
            {/* All Category Option - Compact */}
            <motion.div
              variants={itemVariants}
              onClick={() => navigate('/categories')}
              className={`cursor-pointer transition-all rounded-xl ${
                !categorySlug ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
              }`}
            >
              <div className="h-full rounded-xl border border-primary/5 bg-primary/5 flex items-center gap-3 px-4 py-3 hover:bg-primary/10 transition-colors aspect-[2.2/1]">
                <span className="text-xl">🌐</span>
                <span className="text-[13px] font-bold text-primary">All Vault</span>
              </div>
            </motion.div>

            {categories.map((cat, i) => (
              <motion.div
                key={cat._id}
                variants={itemVariants}
                className={`cursor-pointer transition-all rounded-xl ${
                  categorySlug === cat.slug ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
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
              {categorySlug
                ? `${selectedCatName} — ${prompts.length} prompts`
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
            key={`${categorySlug || 'all'}-${sortBy}`}
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
