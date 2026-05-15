import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Gift, CheckCheck, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

const RewardModal = () => {
  const { showRewardModal, setShowRewardModal, unlockCopy, pendingCopyPrompt } = useApp();
  const [step, setStep] = useState('intro'); // intro | watching | unlocked
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!showRewardModal) {
      setStep('intro');
      setCountdown(5);
    }
  }, [showRewardModal]);

  useEffect(() => {
    if (step === 'watching' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (step === 'watching' && countdown === 0) {
      setStep('unlocked');
    }
  }, [step, countdown]);

  const handleWatchAd = () => {
    setStep('watching');
  };

  const handleUnlock = () => {
    unlockCopy();
    setStep('intro');
    setCountdown(5);
  };

  if (!showRewardModal) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)' }}
        onClick={(e) => { if (e.target === e.currentTarget) setShowRewardModal(false); }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-md glass-card p-8 relative overflow-hidden"
        >
          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 blur-3xl opacity-30"
              style={{ background: 'radial-gradient(circle, #9333ea, transparent)' }} />
          </div>

          <button
            onClick={() => setShowRewardModal(false)}
            className="absolute top-4 right-4 p-2 rounded-xl hover:bg-primary/5 text-primary/40 hover:text-primary transition-all"
          >
            <X size={18} />
          </button>

          {/* INTRO STATE */}
          {step === 'intro' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'linear-gradient(135deg, #9333ea, #06b6d4)' }}>
                <Zap size={28} className="text-primary" />
              </div>
              <h2 className="font-display font-bold text-2xl text-primary mb-2">Copy Limit Reached</h2>
              <p className="text-primary/50 text-sm mb-2">
                You've used your 3 free prompt copies.
              </p>
              <p className="text-primary/70 text-sm mb-6">
                Watch a short reward to unlock <span className="text-primary-400 font-semibold">unlimited copies</span> for this session.
              </p>

              {pendingCopyPrompt && (
                <div className="mb-6 p-3 rounded-xl bg-primary/5 border border-primary/10 text-left">
                  <p className="text-xs text-primary/40 mb-1">Copying prompt:</p>
                  <p className="text-sm text-primary/80 font-medium line-clamp-2">{pendingCopyPrompt.title}</p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={handleWatchAd}
                  className="btn-primary w-full justify-center text-base py-3.5"
                >
                  <Gift size={18} />
                  Watch Reward (5 sec)
                </button>
                <button
                  onClick={() => setShowRewardModal(false)}
                  className="btn-secondary w-full justify-center"
                >
                  Cancel
                </button>
              </div>

              <p className="mt-4 text-xs text-primary/30">
                Or <a href="/register" className="text-primary-400 underline">Sign up free</a> for unlimited copies
              </p>
            </motion.div>
          )}

          {/* WATCHING STATE */}
          {step === 'watching' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              {/* Simulated ad */}
              <div className="relative rounded-2xl overflow-hidden mb-6" style={{ aspectRatio: '16/9' }}>
                <img
                  src="https://picsum.photos/seed/reward/800/450"
                  alt="Ad"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.3)' }}>
                  <div className="glass rounded-full px-4 py-2 text-sm font-semibold flex items-center gap-2">
                    <Clock size={14} className="text-primary-400" />
                    <span>Ad ends in <span className="text-primary-400 font-bold">{countdown}s</span></span>
                  </div>
                </div>
                <div className="absolute top-3 left-3 badge badge-purple text-xs">ADVERTISEMENT</div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-primary/10 rounded-full overflow-hidden mb-4">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #9333ea, #06b6d4)' }}
                  initial={{ width: '0%' }}
                  animate={{ width: `${((5 - countdown) / 5) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              <p className="text-primary/50 text-sm">
                Please wait while we load your reward...
              </p>
            </motion.div>
          )}

          {/* UNLOCKED STATE */}
          {step === 'unlocked' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15, stiffness: 300, delay: 0.1 }}
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
              >
                <CheckCheck size={36} className="text-primary" />
              </motion.div>

              <h2 className="font-display font-bold text-2xl text-primary mb-2">Reward Unlocked!</h2>
              <p className="text-primary/60 text-sm mb-6">
                Your prompt is ready to copy. Unlimited copies are now unlocked for this session.
              </p>

              <button
                onClick={handleUnlock}
                className="btn-primary w-full justify-center text-base py-3.5"
                style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 4px 15px rgba(34,197,94,0.4)' }}
              >
                <CheckCheck size={18} />
                Copy Prompt Now
              </button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RewardModal;
