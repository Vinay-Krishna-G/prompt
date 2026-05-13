import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { PROMPTS } from '../data/mockData';
import { EASE_PREMIUM } from '../lib/motion';

const VIDEO_PLATFORMS = [
  { id: 'all', name: 'All Platforms', icon: '🎬' },
  { id: 'veo', name: 'Veo 2', icon: '🔵' },
  { id: 'kling', name: 'Kling AI', icon: '⚡' },
  { id: 'runway', name: 'Runway Gen-3', icon: '🚀' },
  { id: 'sora', name: 'Sora', icon: '🌀' },
];

const VideoCard = ({ prompt, index }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1], delay: index * 0.05 }}
    >
      <Link to={`/prompt/${prompt.id}`}>
        <div
          className="group relative overflow-hidden rounded-2xl cursor-pointer border shadow-sm"
          style={{
            backgroundColor: 'rgba(var(--text-primary) / 0.02)',
            borderColor: 'rgba(var(--border-color) / 0.06)',
            transition: 'all 0.35s ease',
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* Thumbnail */}
          <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
            <img
              src={prompt.image}
              alt={prompt.title}
              className="w-full h-full object-cover transition-transform duration-700 ease-premium group-hover:scale-[1.02]"
            />

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-300" />

            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                whileHover={{ scale: 1.04 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="w-14 h-14 rounded-full flex items-center justify-center border border-white/15"
                style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)' }}
              >
                <Play size={22} className="text-white ml-1 fill-white" />
              </motion.div>
            </div>

            {/* Platform badge */}
            <div className="absolute top-3 left-3">
              <span className="badge-minimal text-xs px-3 py-1">
                {prompt.aiModel}
              </span>
            </div>

            {/* Duration badge */}
            <div className="absolute bottom-3 right-3">
              <span className="px-2 py-1 rounded-lg text-xs font-semibold text-white"
                style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
                0:08
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="p-4">
            <h3 className="font-semibold text-sm mb-2 line-clamp-2" style={{ color: 'rgb(var(--text-primary))' }}>{prompt.title}</h3>
            <div className="flex flex-wrap gap-1 mb-3">
              {prompt.tags.slice(0, 3).map(tag => (
                <span key={tag} className="badge-minimal text-[10px] px-2 py-0.5 rounded-full border opacity-80">#{tag}</span>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs font-medium" style={{ color: 'rgba(var(--text-primary) / 0.5)' }}>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white/90 border border-white/10"
                  style={{ backgroundColor: 'rgba(var(--text-primary) / 0.12)' }}
                >
                  {prompt.creator.avatar.slice(0, 1)}
                </div>
                <span>{prompt.creator.name}</span>
              </div>
              <span>{(prompt.copies / 1000).toFixed(1)}k copies</span>
            </div>
          </div>

          <motion.div
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{ boxShadow: 'inset 0 0 0 1px rgba(var(--text-primary) / 0.08)' }}
          />
        </div>
      </Link>
    </motion.div>
  );
};

const VideoPromptsPage = () => {
  const [platform, setPlatform] = useState('all');
  const videoPrompts = PROMPTS.filter(p => p.type === 'video');

  const filteredVideos = platform === 'all'
    ? videoPrompts
    : videoPrompts.filter(p => p.aiModel.toLowerCase().includes(platform));

  return (
    <div className="min-h-screen pt-24 pb-24">
      <div className="section-contain">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.68, ease: EASE_PREMIUM }}
          className="mb-14"
        >
          <div className="flex items-center gap-2 mb-4">
            <Play size={18} className="text-accent-400" />
            <span className="text-sm font-semibold text-accent-400 uppercase tracking-widest">Video Prompts</span>
          </div>
          <h1 className="font-display font-bold tracking-tightest text-5xl sm:text-6xl mb-3" style={{ color: 'rgb(var(--text-primary))' }}>
            AI Video Prompts
          </h1>
          <p className="text-lg max-w-2xl" style={{ color: 'rgba(var(--text-primary) / 0.6)' }}>
            Cinematic video prompts for Veo 2, Kling AI, Runway Gen-3, Sora, and more.
            Copy and paste directly into your AI video tool.
          </p>
        </motion.div>

        {/* Platform filter pills */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.62, ease: EASE_PREMIUM, delay: 0.1 }}
          className="flex flex-wrap gap-2 mb-12"
        >
          {VIDEO_PLATFORMS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPlatform(p.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-500 ease-premium border ${
                platform === p.id ? '' : 'hover:bg-[rgba(var(--text-primary)/0.06)]'
              }`}
              style={
                platform === p.id
                  ? {
                      backgroundColor: 'rgb(var(--text-primary))',
                      color: 'rgb(var(--bg-primary))',
                      borderColor: 'transparent',
                      boxShadow: '0 12px 32px -14px rgba(0,0,0,0.45)',
                    }
                  : {
                      backgroundColor: 'rgba(var(--text-primary) / 0.04)',
                      borderColor: 'rgba(var(--border-color) / 0.08)',
                      color: 'rgba(var(--text-primary) / 0.72)',
                    }
              }
            >
              <span>{p.icon}</span>
              <span>{p.name}</span>
            </button>
          ))}
        </motion.div>

        {/* Videos grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filteredVideos.length > 0
            ? filteredVideos.map((prompt, i) => <VideoCard key={prompt.id} prompt={prompt} index={i} />)
            : videoPrompts.map((prompt, i) => <VideoCard key={prompt.id} prompt={prompt} index={i} />)
          }
        </div>

        {/* Tips section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl p-8 border shadow-sm"
          style={{ 
            backgroundColor: 'rgba(var(--text-primary) / 0.02)',
            borderColor: 'rgba(var(--border-color) / 0.05)' 
          }}
        >
          <h2 className="font-display font-bold text-2xl mb-6" style={{ color: 'rgb(var(--text-primary))' }}>Video Prompt Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '🎬', title: 'Camera Movements', desc: 'Use terms like "slow drone push-in", "tracking shot", "dolly zoom" for cinematic motion' },
              { icon: '⚡', title: 'Duration & Style', desc: 'Specify duration (4-10 seconds), fps (24fps cinematic, 60fps smooth), and aspect ratio' },
              { icon: '🎨', title: 'Lighting & Mood', desc: 'Include lighting like "golden hour", "volumetric fog", "neon reflections" for atmosphere' },
            ].map((tip) => (
              <div key={tip.title} className="flex gap-3">
                <span className="text-2xl flex-shrink-0">{tip.icon}</span>
                <div>
                  <h3 className="font-semibold text-sm mb-1" style={{ color: 'rgb(var(--text-primary))' }}>{tip.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(var(--text-primary) / 0.5)' }}>{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VideoPromptsPage;
