import { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, SlidersHorizontal } from 'lucide-react';
import PromptCard from '../components/PromptCard';
import CategoryCard from '../components/CategoryCard';
import { CATEGORIES, PROMPTS } from '../data/mockData';
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

  const filteredPrompts = selectedCat
    ? PROMPTS.filter(p => p.category === selectedCat)
    : PROMPTS;

  const sortedPrompts = [...filteredPrompts].sort((a, b) => {
    if (sortBy === 'popular') return b.copies - a.copies;
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'liked') return b.likes - a.likes;
    return 0;
  });

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
          <h1 className="font-display font-bold tracking-tightest text-5xl sm:text-6xl mb-3" style={{ color: 'rgb(var(--text-primary))' }}>
            Browse Categories
          </h1>
          <p className="text-lg" style={{ color: 'rgba(var(--text-primary) / 0.6)' }}>14 categories • 24,891 prompts</p>
        </motion.div>

        {/* Categories grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-14"
        >
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.id}
              variants={itemVariants}
              onClick={() => setSelectedCat(selectedCat === cat.id ? null : cat.id)}
              className={`cursor-pointer transition-all ${selectedCat === cat.id ? 'ring-2 ring-primary-500 rounded-2xl' : ''}`}
            >
              <CategoryCard category={cat} index={i} />
            </motion.div>
          ))}
        </motion.div>

        {/* Filter bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex items-center justify-between gap-4 mb-8 flex-wrap"
        >
          <div className="flex items-center gap-2">
            <Filter size={16} className="opacity-50" style={{ color: 'rgb(var(--text-primary))' }} />
            <span className="text-sm font-medium" style={{ color: 'rgba(var(--text-primary) / 0.7)' }}>
              {selectedCat
                ? `${CATEGORIES.find(c => c.id === selectedCat)?.name} — ${sortedPrompts.length} prompts`
                : `All prompts — ${sortedPrompts.length} results`
              }
            </span>
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="opacity-50" style={{ color: 'rgb(var(--text-primary))' }} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border rounded-xl px-3 py-2 text-sm outline-none"
              style={{ 
                backgroundColor: 'rgba(var(--text-primary) / 0.05)',
                borderColor: 'rgba(var(--border-color) / 0.1)',
                color: 'rgb(var(--text-primary))'
              }}
            >
              <option value="popular" style={{ color: '#000' }}>Most Popular</option>
              <option value="newest" style={{ color: '#000' }}>Newest</option>
              <option value="liked" style={{ color: '#000' }}>Most Liked</option>
            </select>
          </div>
        </motion.div>

        {/* Prompts grid */}
        <motion.div
          key={`${selectedCat}-${sortBy}`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {sortedPrompts.map((prompt, i) => (
            <motion.div key={prompt.id} variants={itemVariants}>
              <PromptCard prompt={prompt} index={i} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default CategoriesPage;
