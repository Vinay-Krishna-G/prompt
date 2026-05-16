import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Disc,
  Sparkles,
  Ratio,
  Sliders,
  Layers,
  Palette,
  Wand2,
  Shuffle,
  ArrowLeft,
  Heart,
  Bookmark,
  BookmarkCheck,
  Copy,
  Play,
  Share2,
  Download,
  Calendar,
  CheckCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import PromptCard from '../components/PromptCard';
import ImageWithPlaceholder from '../components/ImageWithPlaceholder';
import Loader from '../components/Loader';
import { getPromptBySlug, getPrompts } from '../services/promptService';
import { EASE_PREMIUM } from '../lib/motion';




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
        setSimilarPrompts(similarData.prompts.filter((p) => p._id !== data._id).slice(0, 4));
      } catch (err) {
        console.error('Failed to load prompt', err);
        setError('Failed to load prompt details.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const paramsEntries = useMemo(() => {
    const cfg = prompt?.config || {};
    const entries = [
      ['Aspect Ratio', cfg.aspectRatio],
      ['Chaos', cfg.chaos],
      ['Quality', cfg.quality],
      ['Style', cfg.style],
    ].filter(([, val]) => val && val.trim());
    return entries;
  }, [prompt?.config]);

  if (isLoading) return <Loader fullScreen />;
  if (error || !prompt) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <Disc size={32} className="mx-auto text-red-500/50 mb-4" />
          <h2 className="text-xl font-medium mb-2">{error || 'Prompt not found'}</h2>
          <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-primary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isSaved = savedPrompts.includes(prompt._id?.toString());
  const isLiked = likedPrompts.includes(prompt._id?.toString());

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
    <div className="min-h-screen pt-24 pb-28 md:pt-28 md:pb-32 bg-background relative overflow-hidden px-px">
      {/* Background Atmosphere - Refined for smoother transition */}
      <div className="absolute top-0 inset-x-0 h-[min(85vh,920px)] pointer-events-none z-0 overflow-hidden opacity-30">
        <img
          src={prompt.previewImage}
          alt=""
          className="w-full h-full object-cover blur-[110px] scale-110"
        />
        {/* Layered gradients for deep cinematic blend */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/60 to-background" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      </div>

      <div className="section-contain relative z-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn-ghost-minimal mb-8 md:mb-12 pl-0 hover:bg-transparent -ml-2 group touch-manipulation"
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
              className="relative group flex items-center justify-center min-h-[400px]"
            >
              {prompt.type === 'video' ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="relative w-fit h-fit rounded-2xl overflow-hidden border border-primary/[0.04] shadow-[0_24px_80px_-28px_rgba(0,0,0,0.55)] bg-elevated flex items-center justify-center">
                    {prompt.previewVideo ? (
                      <video
                        src={prompt.previewVideo}
                        autoPlay
                        loop
                        muted
                        playsInline
                        onLoadedData={() => setHeroLoaded(true)}
                        className="w-full h-auto max-h-[60vh] md:max-h-[min(82vh,1000px)] object-contain transition-transform duration-700 ease-premium"
                      />
                    ) : (
                      <ImageWithPlaceholder
                        src={prompt.previewImage}
                        alt={prompt.title}
                        dominantColor={dominantColor}
                        onLoad={() => setHeroLoaded(true)}
                        className="w-full h-auto max-h-[60vh] md:max-h-[min(82vh,1000px)] object-contain transition-transform duration-700 ease-premium"
                      />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-background/20 group-hover:bg-background/8 transition-colors duration-500 ease-premium pointer-events-none">
                      <div className="w-20 h-20 rounded-full bg-background/35 backdrop-blur-md border border-primary/15 flex items-center justify-center text-primary transition-transform duration-500 ease-premium group-hover:scale-[1.03] cursor-pointer">
                        <Play size={32} className="ml-2 fill-current" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative w-full flex items-center justify-center">
                  <div className="relative w-fit h-fit rounded-2xl overflow-hidden border border-primary/[0.04] shadow-[0_24px_80px_-28px_rgba(0,0,0,0.55)] bg-elevated">
                    <ImageWithPlaceholder
                      src={prompt.previewImage}
                      alt={prompt.title}
                      dominantColor={dominantColor}
                      onLoad={() => setHeroLoaded(true)}
                      className={`w-full h-auto object-contain max-h-[60vh] md:max-h-[min(82vh,1000px)] transition-transform duration-[800ms] ease-premium ${
                        heroLoaded ? 'group-hover:scale-[1.005]' : ''
                      }`}
                    />
                  </div>
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
                    className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] border border-primary/[0.06] text-[rgba(var(--text-primary)/0.55)]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="p-2.5 rounded-full text-muted hover:bg-primary/[0.06] hover:text-primary transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(var(--accent),0.35)]"
                  aria-label="Share"
                >
                  <Share2 size={16} />
                </button>
                <button
                  type="button"
                  className="p-2.5 rounded-full text-muted hover:bg-primary/[0.06] hover:text-primary transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(var(--accent),0.35)]"
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
              <div className="mb-10 md:mb-12 border-b border-primary/[0.04] pb-10 md:pb-12">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-full bg-primary/[0.05] flex items-center justify-center border border-primary/[0.06] text-xs text-primary font-medium overflow-hidden">
                    {prompt.creator?.avatar && prompt.creator.avatar.length > 2 ? (
                      <img
                        src={prompt.creator.avatar}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : prompt.creator?.name ? (
                      prompt.creator.name.charAt(0).toUpperCase()
                    ) : (
                      'U'
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-primary">
                      {prompt.creator?.name || 'Unknown'}
                    </p>
                    <p className="text-[11px] text-muted uppercase tracking-widest font-medium mt-0.5">
                      {prompt.category || prompt.categoryName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleLike(prompt._id?.toString())}
                      className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-red-400/90 transition-colors duration-300 px-2 py-1 rounded-lg hover:bg-primary/[0.03]"
                    >
                      <Heart size={14} className={isLiked ? 'fill-red-400 text-red-400' : ''} />
                      {prompt.likes}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSave(prompt._id?.toString())}
                      className="p-2.5 rounded-full bg-primary/[0.03] border border-primary/[0.06] text-primary/70 hover:text-primary hover:bg-primary/[0.07] transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(var(--accent),0.35)]"
                      aria-label={isSaved ? 'Unsave' : 'Save'}
                    >
                      {isSaved ? (
                        <BookmarkCheck size={16} className="text-indigo-400" />
                      ) : (
                        <Bookmark size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <h1 className="heading-cinematic text-3xl md:text-[2.5rem] font-semibold leading-[1.15] mb-5 tracking-[-0.02em]">
                  {prompt.title}
                </h1>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] border border-primary/[0.06] text-muted">
                    <Calendar size={11} />
                    {new Date(prompt.createdAt).toLocaleDateString()}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] border border-primary/[0.06] text-muted">
                    {prompt.type === 'video' ? 'Video template' : 'Image template'}
                  </span>
                </div>
                {prompt.description && (
                  <p
                    className="text-[15px] leading-[1.65] md:leading-relaxed"
                    style={{ color: 'rgba(var(--text-primary) / 0.52)' }}
                  >
                    {prompt.description}
                  </p>
                )}
              </div>

              <div className="mb-10 md:mb-12">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted flex items-center gap-2 mb-4">
                  <Disc size={12} className="opacity-45" /> Core template
                </h3>
                <div className="relative group syntax-box-minimal bg-elevated text-primary p-5 md:p-7 leading-[1.7] border border-primary/[0.05] rounded-2xl font-mono text-[13px] selection:bg-primary/10">
                  <div className="mb-28 md:mb-28 select-all opacity-90 pr-2">
                    {prompt.promptText || prompt.prompt}
                  </div>
                  <div className="absolute bottom-4 right-4 left-4 flex flex-col sm:flex-row gap-2 justify-end">
                    <button
                      type="button"
                      onClick={onRemix}
                      className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[13px] font-medium border transition-all duration-500 ease-premium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(var(--accent),0.4)] ${
                        remixCopied
                          ? 'border-emerald-500/25 text-emerald-400 bg-emerald-500/10'
                          : 'border-primary/[0.1] text-primary/90 bg-primary/[0.04] hover:bg-primary/[0.07] hover:border-primary/[0.14]'
                      }`}
                    >
                      {remixCopied ? (
                        <CheckCheck size={15} />
                      ) : (
                        <Shuffle size={15} className="opacity-80" />
                      )}
                      {remixCopied ? 'Remix copied' : 'Remix prompt'}
                    </button>
                    <button
                      type="button"
                      onClick={onCopy}
                      className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[13px] font-medium transition-all duration-500 ease-premium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(var(--accent),0.45)] ${
                        copied
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-primary text-background hover:opacity-90 border border-transparent'
                      }`}
                    >
                      {copied ? <CheckCheck size={15} /> : <Copy size={15} />}
                      {copied ? 'Copied' : 'Copy prompt'}
                    </button>
                  </div>
                </div>
              </div>

              {paramsEntries.length > 0 && (
                <div
                  className="rounded-2xl border p-6 md:p-7"
                  style={{
                    backgroundColor: 'rgba(var(--text-primary) / 0.02)',
                    borderColor: 'rgba(var(--border-color) / 0.06)',
                  }}
                >
                  <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted mb-5 flex items-center gap-2">
                    <Wand2 size={12} className="opacity-45" />
                    Configuration
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {paramsEntries.map(([key, val]) => {
                      const Icon = paramIcon(key);
                      return (
                        <span
                          key={key}
                          className="inline-flex items-center gap-2 rounded-full pl-2.5 pr-3 py-1.5 text-[12px] border border-primary/[0.07] bg-primary/[0.03] text-primary/70"
                        >
                          <Icon size={13} className="opacity-45 shrink-0" />
                          <span className="text-[10px] uppercase tracking-wider text-muted">{key}</span>
                          <span className="text-primary font-medium">{val}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        <div className="mt-28 md:mt-36 border-t border-primary/[0.04] pt-16 md:pt-20">
          <div className="flex items-baseline justify-between mb-12 md:mb-14 gap-6">
            <h3 className="heading-cinematic text-2xl md:text-[1.65rem] font-medium tracking-[-0.02em]">
              Similar works
            </h3>
            <div className="h-px bg-primary/[0.05] flex-1 max-w-md hidden md:block" />
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
