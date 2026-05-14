import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Disc, Sparkles, Ratio, Sliders, Layers, Palette, Wand2, Shuffle, ArrowLeft, Heart, Bookmark, BookmarkCheck, Copy, Play, Share2, Download, Calendar, CheckCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import PromptCard from '../components/PromptCard';
import ImageWithPlaceholder from '../components/ImageWithPlaceholder';
import Loader from '../components/Loader';
import { getPromptBySlug, getPrompts } from '../services/promptService';
import { EASE_PREMIUM } from '../lib/motion';

const defaultParams = {
  'Aspect Ratio': '16:9',
  Chaos: 'Low',
  Quality: 'Max',
  Style: 'Raw',
};

const paramIcon = (key) => {
  const k = key.toLowerCase();
  if (k.includes('aspect') || k.includes('ratio')) return Ratio;
  if (k.includes('chaos') || k.includes('stylize')) return Sliders;
  if (k.includes('quality') || k.includes('seed')) return Layers;
  if (k.includes('style') || k.includes('palette')) return Palette;
  return Sparkles;
};

const PromptDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    savedPrompts,
    likedPrompts,
    toggleSave,
    toggleLike,
    handleCopyPrompt,
    handleRemixPrompt,
    addRecentlyViewed,
  } = useApp();
  const [copied, setCopied] = useState(false);
  const [remixCopied, setRemixCopied] = useState(false);
  const [heroLoaded, setHeroLoaded] = useState(false);

  const [prompt, setPrompt] = useState(null);
  const [similarPrompts, setSimilarPrompts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        const data = await getPromptBySlug(id); // id param actually holds the slug
        setPrompt(data);
        addRecentlyViewed(data.slug || data._id);
        
        // Fetch similar (just fetching a generic list for now)
        const similarData = await getPrompts({ limit: 4 });
        setSimilarPrompts(similarData.prompts.filter(p => p._id !== data._id).slice(0, 4));
      } catch (err) {
        console.error('Failed to load prompt', err);
        setError('Failed to load prompt details.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const paramsEntries = useMemo(
    () => Object.entries(prompt?.params || defaultParams),
    [prompt?.params]
  );

  if (isLoading) return <Loader fullScreen />;
  if (error || !prompt) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <Disc size={32} className="mx-auto text-red-500/50 mb-4" />
          <h2 className="text-xl font-medium mb-2">{error || 'Prompt not found'}</h2>
          <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-white">Go Back</button>
        </div>
      </div>
    );
  }

  const isSaved = savedPrompts.includes(prompt.slug || prompt._id);
  const isLiked = likedPrompts.includes(prompt.slug || prompt._id);

  const dominantColor = prompt.dominantColor || '#0a0f1c';

  const onCopy = () => {
    handleCopyPrompt(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const onRemix = () => {
    handleRemixPrompt(prompt);
    setRemixCopied(true);
    setTimeout(() => setRemixCopied(false), 2500);
  };

  return (
    <div className="min-h-screen pt-20 pb-28 md:pt-24 md:pb-32 bg-dark-50 relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-[min(70vh,720px)] pointer-events-none z-0 overflow-hidden opacity-25">
        <img
          src={prompt.previewImage}
          alt=""
          className="w-full h-full object-cover blur-[100px] scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-dark-50/30 via-dark-50/80 to-dark-50" />
      </div>

      <div className="section-contain relative z-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn-ghost-minimal mb-10 md:mb-12 pl-0 hover:bg-transparent -ml-2 group"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform duration-500 ease-premium"
          />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-20 items-start">
          <div className="lg:col-span-7 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.72, ease: EASE_PREMIUM }}
              className="relative rounded-2xl overflow-hidden border border-white/[0.04] shadow-[0_24px_80px_-28px_rgba(0,0,0,0.55)] bg-dark-200 group"
            >
              {prompt.type === 'video' ? (
                <div className="relative aspect-video">
                  {prompt.previewVideo ? (
                    <video
                      src={prompt.previewVideo}
                      autoPlay
                      loop
                      muted
                      playsInline
                      onLoadedData={() => setHeroLoaded(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageWithPlaceholder
                      src={prompt.previewImage}
                      alt={prompt.title}
                      dominantColor={dominantColor}
                      onLoad={() => setHeroLoaded(true)}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/12 transition-colors duration-500 ease-premium pointer-events-none">
                    <div className="w-20 h-20 rounded-full bg-black/35 backdrop-blur-md border border-white/15 flex items-center justify-center text-white transition-transform duration-500 ease-premium group-hover:scale-[1.03] cursor-pointer">
                      <Play size={32} className="ml-2 fill-current" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <ImageWithPlaceholder
                    src={prompt.previewImage}
                    alt={prompt.title}
                    dominantColor={dominantColor}
                    onLoad={() => setHeroLoaded(true)}
                    className={`w-full h-auto object-cover max-h-[min(78vh,920px)] transition-transform duration-[800ms] ease-premium ${
                      heroLoaded ? 'group-hover:scale-[1.01]' : ''
                    }`}
                  />
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.65, ease: EASE_PREMIUM }}
              className="flex flex-wrap items-center gap-2 justify-between px-0.5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-wider border"
                  style={{
                    backgroundColor: 'rgba(var(--text-primary) / 0.06)',
                    borderColor: 'rgba(var(--border-color) / 0.1)',
                    color: 'rgba(var(--text-primary) / 0.85)',
                  }}
                >
                  <Disc size={11} className="opacity-50" />
                  {prompt.aiModel}
                </span>
                {prompt.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] border border-white/[0.06] text-[rgba(var(--text-primary)/0.55)]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="p-2.5 rounded-full text-gray-400 hover:bg-white/[0.06] hover:text-white transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(var(--accent),0.35)]"
                  aria-label="Share"
                >
                  <Share2 size={16} />
                </button>
                <button
                  type="button"
                  className="p-2.5 rounded-full text-gray-400 hover:bg-white/[0.06] hover:text-white transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(var(--accent),0.35)]"
                  aria-label="Download"
                >
                  <Download size={16} />
                </button>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.72, ease: EASE_PREMIUM, delay: 0.08 }}
              className="flex flex-col"
            >
              <div className="mb-10 md:mb-12 border-b border-white/[0.04] pb-10 md:pb-12">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-full bg-white/[0.05] flex items-center justify-center border border-white/[0.06] text-xs text-gray-200 font-medium overflow-hidden">
                    {prompt.creator?.avatar && prompt.creator.avatar.length > 2 ? (
                      <img src={prompt.creator.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      prompt.creator?.name ? prompt.creator.name.charAt(0).toUpperCase() : 'U'
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-200">{prompt.creator?.name || 'Unknown'}</p>
                    <p className="text-[11px] text-gray-500 uppercase tracking-widest font-medium mt-0.5">
                      {prompt.category || prompt.categoryName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleLike(prompt.slug || prompt._id)}
                      className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-red-400/90 transition-colors duration-300 px-2 py-1 rounded-lg hover:bg-white/[0.03]"
                    >
                      <Heart size={14} className={isLiked ? 'fill-red-400 text-red-400' : ''} />
                      {prompt.likes}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSave(prompt.slug || prompt._id)}
                      className="p-2.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-gray-300 hover:text-white hover:bg-white/[0.07] transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(var(--accent),0.35)]"
                      aria-label={isSaved ? 'Unsave' : 'Save'}
                    >
                      {isSaved ? <BookmarkCheck size={16} className="text-indigo-400" /> : <Bookmark size={16} />}
                    </button>
                  </div>
                </div>

                <h1 className="heading-cinematic text-3xl md:text-[2.5rem] font-semibold leading-[1.12] mb-4 tracking-[-0.02em]">
                  {prompt.title}
                </h1>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] border border-white/[0.06] text-gray-500">
                    <Calendar size={11} />
                    {new Date(prompt.createdAt).toLocaleDateString()}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] border border-white/[0.06] text-gray-500">
                    {prompt.type === 'video' ? 'Video template' : 'Image template'}
                  </span>
                </div>
                <p className="text-[15px] leading-relaxed" style={{ color: 'rgba(var(--text-primary) / 0.52)' }}>
                  High-fidelity neural generation tailored for visual engineers. Parameters below match this vault
                  entry.
                </p>
              </div>

              <div className="mb-10 md:mb-12">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 flex items-center gap-2 mb-4">
                  <Disc size={12} className="opacity-45" /> Core template
                </h3>
                <div className="relative group syntax-box-minimal bg-dark-200 text-gray-200 p-6 md:p-7 leading-relaxed border border-white/[0.05] rounded-2xl font-mono text-[13px] selection:bg-white/10">
                  <div className="mb-24 md:mb-28 select-all opacity-90 pr-2">{prompt.promptText || prompt.prompt}</div>
                  <div className="absolute bottom-4 right-4 left-4 flex flex-wrap gap-2 justify-end">
                    <button
                      type="button"
                      onClick={onRemix}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium border transition-all duration-500 ease-premium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(var(--accent),0.4)] ${
                        remixCopied
                          ? 'border-emerald-500/25 text-emerald-400 bg-emerald-500/10'
                          : 'border-white/[0.1] text-gray-200 bg-white/[0.04] hover:bg-white/[0.07] hover:border-white/[0.14]'
                      }`}
                    >
                      {remixCopied ? <CheckCheck size={15} /> : <Shuffle size={15} className="opacity-80" />}
                      {remixCopied ? 'Remix copied' : 'Remix prompt'}
                    </button>
                    <button
                      type="button"
                      onClick={onCopy}
                      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-500 ease-premium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(var(--accent),0.45)] ${
                        copied
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-white text-black hover:bg-gray-100 border border-transparent'
                      }`}
                    >
                      {copied ? <CheckCheck size={15} /> : <Copy size={15} />}
                      {copied ? 'Copied' : 'Copy prompt'}
                    </button>
                  </div>
                </div>
              </div>

              <div
                className="rounded-2xl border p-6 md:p-7"
                style={{
                  backgroundColor: 'rgba(var(--text-primary) / 0.02)',
                  borderColor: 'rgba(var(--border-color) / 0.06)',
                }}
              >
                <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 mb-5 flex items-center gap-2">
                  <Wand2 size={12} className="opacity-45" />
                  Configuration
                </h4>
                <div className="flex flex-wrap gap-2">
                  {paramsEntries.map(([key, val]) => {
                    const Icon = paramIcon(key);
                    return (
                      <span
                        key={key}
                        className="inline-flex items-center gap-2 rounded-full pl-2.5 pr-3 py-1.5 text-[12px] border border-white/[0.07] bg-white/[0.03] text-gray-300"
                      >
                        <Icon size={13} className="opacity-45 shrink-0" />
                        <span className="text-[10px] uppercase tracking-wider text-gray-500">{key}</span>
                        <span className="text-gray-200 font-medium">{val}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="mt-28 md:mt-36 border-t border-white/[0.04] pt-16 md:pt-20">
          <div className="flex items-baseline justify-between mb-12 md:mb-14 gap-6">
            <h3 className="heading-cinematic text-2xl md:text-[1.65rem] font-medium tracking-[-0.02em]">
              Similar works
            </h3>
            <div className="h-px bg-white/[0.05] flex-1 max-w-md hidden md:block" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-7">
            {similarPrompts.map((p, i) => (
                <PromptCard key={p._id || p.id} prompt={p} index={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptDetailPage;
