import { motion } from 'framer-motion';
import { TrendingUp, Flame } from 'lucide-react';
import PromptCard from '../components/PromptCard';
import { PROMPTS, TRENDING_TAGS } from '../data/mockData';
import { EASE_PREMIUM } from '../lib/motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.055 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.62, ease: EASE_PREMIUM } },
};

const TrendingPage = () => {
  const sorted = [...PROMPTS].sort((a, b) => b.copies - a.copies);

  return (
    <div className="min-h-screen pt-24 pb-24">
      <div className="section-contain">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.68, ease: EASE_PREMIUM }}
          className="text-center mb-16"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 border"
            style={{
              background: 'rgba(249,115,22,0.05)',
              borderColor: 'rgba(249,115,22,0.2)',
            }}
          >
            <Flame size={14} className="text-orange-500" />
            <span className="text-[12px] font-semibold text-orange-600 tracking-wide uppercase">
              This Week's Hottest
            </span>
          </div>
          <h1
            className="font-display font-bold tracking-tightest text-5xl sm:text-6xl mb-4"
            style={{ color: 'rgb(var(--text-primary))' }}
          >
            Trending Prompts
          </h1>
          <p
            className="text-lg max-w-xl mx-auto"
            style={{ color: 'rgba(var(--text-primary) / 0.6)' }}
          >
            The most copied and liked AI prompts from the last 7 days
          </p>
        </motion.div>

        {/* Top 3 featured */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: EASE_PREMIUM, delay: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16"
        >
          {sorted.slice(0, 3).map((prompt, i) => (
            <div key={prompt.id} className="relative">
              {/* Rank badge */}
              <div
                className="absolute -top-3 -left-3 z-10 w-10 h-10 rounded-full flex items-center justify-center text-xl font-black"
                style={{
                  background:
                    i === 0
                      ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                      : i === 1
                        ? 'linear-gradient(135deg, #e5e7eb, #9ca3af)'
                        : 'linear-gradient(135deg, #d97706, #92400e)',
                  boxShadow:
                    i === 0
                      ? '0 10px 28px -8px rgba(251,191,36,0.25)'
                      : '0 8px 24px -10px rgba(0,0,0,0.35)',
                }}
              >
                {i + 1}
              </div>
              <PromptCard prompt={prompt} index={i} />
            </div>
          ))}
        </motion.div>

        {/* Trending tags */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap gap-2 mb-12"
        >
          {TRENDING_TAGS.map((tag, i) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: EASE_PREMIUM, delay: 0.2 + i * 0.025 }}
              className="tag cursor-pointer"
            >
              #{tag}
            </motion.span>
          ))}
        </motion.div>

        {/* All trending */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={18} className="opacity-60" style={{ color: 'rgb(var(--accent))' }} />
            <h2
              className="font-display font-bold text-xl"
              style={{ color: 'rgb(var(--text-primary))' }}
            >
              All Trending Prompts
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sorted.map((prompt, i) => (
              <motion.div key={prompt.id} variants={itemVariants}>
                <PromptCard prompt={prompt} index={i} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TrendingPage;
