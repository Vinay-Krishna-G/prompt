import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Copy, Bookmark, BookmarkCheck, Play, CheckCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ImageWithPlaceholder from './ImageWithPlaceholder';
import { EASE_PREMIUM } from '../lib/motion';

const hoverLift = { duration: 0.62, ease: EASE_PREMIUM };

const PromptCard = ({ prompt, index = 0 }) => {
  const { savedPrompts, likedPrompts, toggleSave, handleCopyPrompt } = useApp();
  const [copied, setCopied] = useState(false);

  const isSaved = savedPrompts.includes(prompt.slug || prompt.id);
  const isLiked = likedPrompts.includes(prompt.slug || prompt.id);

  const aspectClass =
    prompt.type === 'video'
      ? 'aspect-video'
      : prompt.cardAspect === '9/16'
        ? 'aspect-[9/16]'
        : 'aspect-[4/5]';

  const dominantColor = prompt.dominantColor || 'rgb(15 23 42)';

  const onCopy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleCopyPrompt({ ...prompt, prompt: prompt.promptText || prompt.prompt });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSave(prompt.slug || prompt.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.68,
        ease: EASE_PREMIUM,
        delay: index * 0.032,
      }}
    >
      <motion.div whileHover={{ y: -3 }} transition={hoverLift} className="will-change-transform">
        <Link
          to={`/prompt/${prompt.slug || prompt.id}`}
          className="group block rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(var(--accent),0.4)]"
        >
          <div
            className="relative overflow-hidden rounded-2xl border transition-shadow duration-500 ease-premium gpu group-hover:shadow-[0_22px_56px_-20px_rgba(0,0,0,0.5)]"
            style={{
              backgroundColor: 'rgb(var(--bg-surface))',
              borderColor: 'rgba(var(--border-color) / 0.06)',
              boxShadow: '0 6px 28px -14px rgba(0,0,0,0.45)',
            }}
          >
            <div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
              }}
            />

            <div className={`relative ${aspectClass} overflow-hidden rounded-t-2xl`}>
              <ImageWithPlaceholder
                src={prompt.previewImage}
                alt={prompt.title}
                dominantColor={dominantColor}
                className="w-full h-full object-cover transform-gpu transition-transform duration-[720ms] ease-premium group-hover:scale-[1.02]"
              />

              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/35 opacity-55 group-hover:opacity-75 transition-opacity duration-500 ease-premium" />

              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-premium flex flex-col justify-between p-3">
                <div className="flex justify-between items-start">
                  <div className="flex flex-wrap gap-1">
                    {prompt.type === 'video' && (
                      <div className="flex items-center gap-1 bg-background/55 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider text-primary/90">
                        <Play size={10} className="fill-current" /> Video
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={onSave}
                    className="w-8 h-8 rounded-full bg-background/45 backdrop-blur-md flex items-center justify-center text-primary hover:bg-primary hover:text-background transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
                  >
                    {isSaved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                  </button>
                </div>

                <div className="w-full">
                  <button
                    type="button"
                    onClick={onCopy}
                    className="w-full py-2 px-4 rounded-xl bg-primary text-background text-xs font-medium flex items-center justify-center gap-2 transition-all duration-500 ease-premium translate-y-2 group-hover:translate-y-0 opacity-95 hover:opacity-100 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
                    style={{ boxShadow: '0 8px 32px -8px rgba(0,0,0,0.35)' }}
                  >
                    {copied ? <CheckCheck size={13} /> : <Copy size={13} />}
                    {copied ? 'Copied' : 'Copy Prompt'}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-baseline justify-between gap-4">
                <h3
                  className="font-medium text-[13px] leading-snug line-clamp-2 tracking-tight transition-opacity duration-300"
                  style={{ color: 'rgba(var(--text-primary) / 0.82)' }}
                >
                  {prompt.title}
                </h3>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[11px] font-normal" style={{ color: 'rgba(var(--text-primary) / 0.48)' }}>
                  {prompt.category || prompt.categoryName}
                </span>
                <span className="flex items-center gap-0.5 text-[11px]" style={{ color: 'rgba(var(--text-primary) / 0.48)' }}>
                  <Heart size={10} className={isLiked ? 'fill-red-400 text-red-400' : ''} />
                  {prompt.likes > 1000 ? `${(prompt.likes / 1000).toFixed(1)}k` : prompt.likes}
                </span>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default memo(PromptCard);
