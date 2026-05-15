import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const PLACEHOLDER_GRADIENT = [
  'linear-gradient(135deg, #1a1a2e, #16213e)',
  'linear-gradient(135deg, #0f3460, #533483)',
  'linear-gradient(135deg, #1a1a2e, #e94560)',
  'linear-gradient(135deg, #0d1117, #238636)',
  'linear-gradient(135deg, #13111c, #7928ca)',
];

const CategoryCard = ({ category, index = 0 }) => {
  // Support both backend shape (slug, _id, image, promptCount, icon)
  // and legacy mock shape (id, image, count, icon)
  const slug = category.slug || category.id;
  const bannerSrc = category.image;
  const itemCount = category.promptCount ?? category.count ?? 0;
  const icon = category.icon || '📁';
  const gradientFallback = PLACEHOLDER_GRADIENT[index % PLACEHOLDER_GRADIENT.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: index * 0.02 }}
      className="group"
    >
      <Link
        to={`/categories/${slug}`}
        className="block relative overflow-hidden rounded-xl border shadow-soft-elevation bg-dark-100"
        style={{ borderColor: 'rgba(var(--border-color) / 0.05)' }}
      >
        {/* Background Image Stack */}
        <div
          className="relative aspect-[4/3] w-full overflow-hidden bg-dark-200"
          style={!bannerSrc ? { background: gradientFallback } : {}}
        >
          {bannerSrc && (
            <img
              src={bannerSrc}
              alt={category.name}
              className="w-full h-full object-cover saturate-50 contrast-125 duration-1000 ease-premium group-hover:scale-105 group-hover:saturate-100"
            />
          )}

          {/* Muted Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-50/90 via-dark-50/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-700" />
        </div>

        {/* Text Overlay & Details */}
        <div className="absolute inset-x-0 bottom-0 p-4 flex items-end justify-between">
          <div>
            <span className="text-[18px] opacity-80 block mb-1">{icon}</span>
            <h3 className="text-[14px] font-medium text-primary tracking-tight">{category.name}</h3>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CategoryCard;
