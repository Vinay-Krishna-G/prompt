import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Flame, Sparkles, AlertCircle } from 'lucide-react';
import PromptCard from '../components/PromptCard';
import Loader from '../components/Loader';
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

const TrendingPage = () => {
  const [prompts, setPrompts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchTrending = async () => {
      try {
        setIsLoading(true);
        const data = await getPrompts({ trending: true, limit: 30 });
        // Ensure we have prompts and sort them by likes/copies if needed
        const trendingList = data.prompts || [];
        setPrompts(trendingList);
      } catch (err) {
        console.error('Failed to fetch trending prompts', err);
        setError('Failed to load trending content.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrending();
  }, []);

  if (isLoading) return <Loader fullScreen />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 px-6 text-center">
        <div className="max-w-md">
          <AlertCircle size={40} className="mx-auto text-red-500/50 mb-4" />
          <h2 className="text-xl font-display font-bold text-primary mb-2">Something went wrong</h2>
          <p className="text-muted text-sm mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary py-2 px-6">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const topThree = prompts.slice(0, 3);
  const remaining = prompts.slice(3);

  return (
    <div className="min-h-screen pt-28 pb-24 md:pt-32">
      <div className="section-contain">
        {/* Header / Hero */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.68, ease: EASE_PREMIUM }}
          className="text-center mb-16 md:mb-20"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 border"
            style={{
              background: 'rgba(249,115,22,0.05)',
              borderColor: 'rgba(249,115,22,0.15)',
            }}
          >
            <Flame size={14} className="text-orange-500" />
            <span className="text-[11px] font-bold text-orange-500 tracking-widest uppercase">
              This Week's Hottest
            </span>
          </div>
          <h1
            className="heading-cinematic text-5xl md:text-7xl mb-6 tracking-tightest"
          >
            Trending Prompts
          </h1>
          <p
            className="text-lg md:text-xl max-w-2xl mx-auto opacity-60 leading-relaxed"
          >
            Explore the most copied and liked AI templates from the last 7 days, 
            curated by our community of visual engineers.
          </p>
        </motion.div>

        {prompts.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center glass-card border-dashed border-primary/10 rounded-3xl"
          >
            <Sparkles size={32} className="mx-auto text-primary/20 mb-4" />
            <h3 className="text-lg font-medium text-primary/80 mb-2">Finding new trends...</h3>
            <p className="text-muted text-sm max-w-xs mx-auto">
              Our algorithm is currently indexing the latest community engagement. 
              Check back soon for the newest trending prompts.
            </p>
          </motion.div>
        ) : (
          <>
            {/* Top 3 featured with Ranking Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 mb-24">
              {topThree.map((prompt, i) => (
                <div key={prompt._id || prompt.id} className="relative group">
                  {/* Rank badge - Refined for cinematic look */}
                  <div
                    className="absolute -top-4 -left-4 z-20 w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black shadow-2xl rotate-[-12deg] group-hover:rotate-0 transition-transform duration-500 ease-premium"
                    style={{
                      background:
                        i === 0
                          ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                          : i === 1
                            ? 'linear-gradient(135deg, #f1f5f9, #94a3b8)'
                            : 'linear-gradient(135deg, #d97706, #92400e)',
                      color: i === 1 ? '#0f172a' : '#fff',
                      border: '2px solid rgba(255,255,255,0.1)',
                      boxShadow: i === 0 ? '0 10px 30px -8px rgba(245,158,11,0.5)' : '0 10px 25px -10px rgba(0,0,0,0.5)'
                    }}
                  >
                    {i + 1}
                  </div>
                  <PromptCard prompt={prompt} index={i} />
                </div>
              ))}
            </div>

            {/* All trending list */}
            {remaining.length > 0 && (
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mt-20">
                <div className="flex items-center gap-3 mb-10 border-b border-primary/5 pb-6">
                  <TrendingUp size={20} className="text-primary/40" />
                  <h2 className="font-display font-bold text-2xl text-primary">
                    Rising Stars
                  </h2>
                  <div className="h-px bg-primary/5 flex-1 ml-4" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                  {remaining.map((prompt, i) => (
                    <motion.div key={prompt._id || prompt.id} variants={itemVariants}>
                      <PromptCard prompt={prompt} index={i + 3} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TrendingPage;
