import { motion } from 'framer-motion';

const Loader = ({ fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4 py-20 opacity-60">
      <motion.div
        className="w-10 h-10 border-[1.5px] border-gray-600 border-t-white rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <span className="text-[11px] uppercase tracking-[0.2em] font-medium text-gray-500">Loading</span>
    </div>
  );

  if (fullScreen) {
    return <div className="min-h-screen flex items-center justify-center">{content}</div>;
  }

  return content;
};

export default Loader;
