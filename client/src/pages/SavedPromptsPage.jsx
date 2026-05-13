import { motion } from 'framer-motion';
import { Bookmark, Clock, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import PromptCard from '../components/PromptCard';
import { PROMPTS } from '../data/mockData';
import { useApp } from '../context/AppContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const SavedPromptsPage = () => {
  const { savedPrompts, likedPrompts, recentlyViewed, isLoggedIn, user } = useApp();

  const saved = PROMPTS.filter(p => savedPrompts.includes(p.id));
  const liked = PROMPTS.filter(p => likedPrompts.includes(p.id));
  const recent = PROMPTS.filter(p => recentlyViewed.includes(p.id)).slice(0, 8);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-10 glass-card max-w-md mx-4"
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #9333ea, #06b6d4)' }}>
            <Bookmark size={28} className="text-white" />
          </div>
          <h2 className="font-display font-bold text-2xl text-white mb-2">Login Required</h2>
          <p className="text-white/50 text-sm mb-6">Create a free account to save prompts and access your library.</p>
          <div className="flex gap-3 justify-center">
            <Link to="/login" className="btn-secondary">Log In</Link>
            <Link to="/register" className="btn-primary">Sign Up Free</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="section-contain">
        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-card p-8 mb-10 flex flex-col sm:flex-row items-center gap-6"
        >
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #9333ea, #06b6d4)' }}>
            {user?.avatar || 'U'}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="font-display font-black text-3xl text-white">{user?.name}</h1>
            <p className="text-white/40 text-sm mt-1">{user?.email}</p>
            <div className="flex items-center justify-center sm:justify-start gap-6 mt-3">
              <div className="text-center">
                <div className="font-bold text-white text-xl">{saved.length}</div>
                <div className="text-xs text-white/40">Saved</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-white text-xl">{liked.length}</div>
                <div className="text-xs text-white/40">Liked</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-white text-xl">{recent.length}</div>
                <div className="text-xs text-white/40">Viewed</div>
              </div>
            </div>
          </div>
          <div className="sm:ml-auto">
            <button className="btn-secondary text-sm">Edit Profile</button>
          </div>
        </motion.div>

        {/* Saved Prompts */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mb-14"
        >
          <motion.div variants={itemVariants} className="flex items-center gap-2 mb-6">
            <Bookmark size={18} className="text-primary-400" />
            <h2 className="font-display font-bold text-2xl text-white">Saved Prompts</h2>
            <span className="badge-purple badge">{saved.length}</span>
          </motion.div>

          {saved.length === 0 ? (
            <motion.div variants={itemVariants} className="text-center py-16 glass-card">
              <Bookmark size={40} className="text-white/20 mx-auto mb-3" />
              <p className="text-white/40">No saved prompts yet. Browse and save your favorites!</p>
              <Link to="/" className="btn-primary mt-4 inline-flex">Explore Prompts</Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {saved.map((prompt, i) => (
                <motion.div key={prompt.id} variants={itemVariants}>
                  <PromptCard prompt={prompt} index={i} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* Liked Prompts */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="mb-14"
        >
          <motion.div variants={itemVariants} className="flex items-center gap-2 mb-6">
            <Heart size={18} className="text-red-400" />
            <h2 className="font-display font-bold text-2xl text-white">Liked Prompts</h2>
            <span className="badge badge-pink">{liked.length}</span>
          </motion.div>

          {liked.length === 0 ? (
            <motion.div variants={itemVariants} className="text-center py-16 glass-card">
              <Heart size={40} className="text-white/20 mx-auto mb-3" />
              <p className="text-white/40">No liked prompts yet. Like prompts you find inspiring!</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {liked.map((prompt, i) => (
                <motion.div key={prompt.id} variants={itemVariants}>
                  <PromptCard prompt={prompt} index={i} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* Recently Viewed */}
        {recent.length > 0 && (
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="flex items-center gap-2 mb-6">
              <Clock size={18} className="text-secondary-400" />
              <h2 className="font-display font-bold text-2xl text-white">Recently Viewed</h2>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {recent.map((prompt, i) => (
                <motion.div key={prompt.id} variants={itemVariants}>
                  <PromptCard prompt={prompt} index={i} />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
};

export default SavedPromptsPage;
