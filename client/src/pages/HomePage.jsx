import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Disc, Command, Search } from 'lucide-react';
import Masonry from 'react-masonry-css';
import PromptCard from '../components/PromptCard';
import Loader from '../components/Loader';
import { getPrompts } from '../services/promptService';
import { useApp } from '../context/AppContext';

const fadeInUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const AmbientBg = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
    <div
      className="absolute inset-0 opacity-[0.14] mix-blend-overlay pointer-events-none"
      style={{
        backgroundImage: `url("https://www.transparenttextures.com/patterns/stardust.png")`,
      }}
      aria-hidden
    />
    {/* Quiet top light */}
    <div className="absolute inset-0 bg-subtle-glow" />
    {/* Barely visible mesh pulse */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] opacity-30 bg-mesh-gradient blur-3xl mix-blend-screen" />
  </div>
);

const HomePage = () => {
  const { setCommandPaletteOpen } = useApp();
  const [prompts, setPrompts] = useState([]);
  const [trendingPrompts, setTrendingPrompts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const masonryBreakpoints = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1,
  };

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setIsLoading(true);
        const [promptsData, trendingData] = await Promise.all([
          getPrompts({ limit: 20 }),
          getPrompts({ trending: true, limit: 4 }),
        ]);
        setPrompts(promptsData.prompts);
        setTrendingPrompts(trendingData.prompts);
      } catch (err) {
        console.error('Failed to load prompts', err);
        setError('Failed to load assets. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  if (isLoading) return <Loader fullScreen />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-6">
        <div>
          <Disc size={32} className="mx-auto text-red-500/50 mb-4" />
          <h2 className="text-xl font-medium mb-2">{error}</h2>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-gray-500 hover:text-primary transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Ambient Environment */}
      <AmbientBg />

      {/* ===== HERO SECTION ===== */}
      <section className="pt-32 pb-28 md:pt-48 md:pb-40 text-center px-6 overflow-hidden">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-4xl mx-auto flex flex-col items-center"
        >
          <motion.div variants={fadeInUp} className="mb-6">
            <span className="badge-minimal inline-flex items-center gap-2 px-3 py-1 rounded-full tracking-wide text-[12px]">
              <Disc size={10} className="opacity-70" />
              The Cinematic AI Standard
            </span>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="heading-cinematic text-[44px] sm:text-[56px] md:text-[72px] leading-[1.05] tracking-tightest font-semibold mb-6"
          >
            Design concepts <br />
            <span className="text-gray-500">without constraints.</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-body-soft text-[16px] sm:text-lg max-w-[560px] mb-10 opacity-80"
          >
            Discover premium prompt templates for visual engineers. Curated outputs from Midjourney,
            Sora, & Runway.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center gap-3">
            <Link to="/categories" className="btn-premium group">
              Browse Vault{' '}
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {/* Fake refined search button */}
            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              className="btn-premium-outline group"
            >
              <Search size={14} className="opacity-60" />
              Quick Search
              <kbd className="hidden sm:inline-flex items-center ml-2 gap-0.5 text-[10px] font-sans border border-primary/10 bg-primary/5 rounded px-1.5 opacity-40">
                <Command size={9} /> K
              </kbd>
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* ===== FEATURED TRAY ===== */}
      <section className="pb-28 md:pb-32">
        <div className="section-contain">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="flex justify-between items-end mb-10 pb-5"
              style={{ borderBottom: '1px solid rgba(var(--border-color) / 0.05)' }}
            >
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Latest Curation
                </h2>
                <p className="text-xl font-semibold heading-cinematic">Trending Prompts</p>
              </div>
              <Link
                to="/trending"
                className="text-sm flex items-center gap-1.5 group"
                style={{ color: 'rgba(var(--text-primary) / 0.6)' }}
              >
                View Library{' '}
                <ArrowRight
                  size={13}
                  className="opacity-40 group-hover:opacity-100 transition-all"
                />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-7">
              {trendingPrompts.length > 0 ? (
                trendingPrompts.map((prompt, idx) => (
                  <PromptCard key={prompt._id || prompt.id} prompt={prompt} index={idx} />
                ))
              ) : (
                <div className="col-span-full py-10 text-center text-gray-500 text-sm">
                  No trending prompts available.
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== MINIMALIST GRID DISPLAY ===== */}
      <section className="py-16 bg-dark-100 border-y border-primary/[0.02] dark:border-primary/[0.02] light:border-background/[0.02]">
        <div className="section-contain">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center gap-12 flex-wrap opacity-40 grayscale hover:grayscale-0 transition-all duration-700"
          >
            {['Midjourney', 'Veo 2', 'Runway Gen-3', 'Kling AI', 'DALL-E 3'].map((p) => (
              <span
                key={p}
                className="text-[13px] font-mono uppercase tracking-[0.2em] font-medium whitespace-nowrap"
              >
                {p}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== MAIN MASONRY FEED ===== */}
      <section className="py-28 md:py-36">
        <div className="section-contain">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mb-14"
          >
            <div className="flex items-baseline gap-4">
              <h3 className="text-2xl font-semibold tracking-tight heading-cinematic">
                Explore Assets
              </h3>
              <div
                className="h-[1px] flex-1"
                style={{ backgroundColor: 'rgba(var(--border-color) / 0.05)' }}
              />
            </div>
          </motion.div>

          {prompts.length > 0 ? (
            <Masonry
              breakpointCols={masonryBreakpoints}
              className="flex -ml-7 w-auto"
              columnClassName="pl-7 bg-clip-padding"
            >
              {prompts.map((p, i) => (
                <div key={p._id || p.id} className="mb-8">
                  <PromptCard prompt={p} index={i % 4} />
                </div>
              ))}
            </Masonry>
          ) : (
            <div className="py-20 text-center text-gray-500 text-sm">
              No prompts found in the vault.
            </div>
          )}
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-36 md:py-40 text-center relative overflow-hidden border-t border-primary/[0.03]">
        <div className="absolute inset-0 bg-ambient-light pointer-events-none" />
        <div className="section-contain relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-xl mx-auto"
          >
            <Disc size={32} className="mx-auto text-gray-600 mb-6 stroke-[1]" />
            <h2 className="heading-cinematic text-3xl sm:text-4xl mb-4 leading-tight">
              Begin creating today.
            </h2>
            <p className="text-gray-500 mb-8 text-base font-light">
              Join designers pushing the envelope of visual media.
            </p>
            <Link to="/register" className="btn-premium py-3 px-8 shadow-2xl">
              Create Free Account
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
