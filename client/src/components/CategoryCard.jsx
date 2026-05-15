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
  const icon = category.icon;
  const gradientFallback = PLACEHOLDER_GRADIENT[index % PLACEHOLDER_GRADIENT.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: index * 0.01 }}
      className="group"
    >
      <Link
        to={`/categories/${slug}`}
        className="block relative overflow-hidden rounded-xl border bg-dark-100 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20"
        style={{ borderColor: 'rgba(var(--text-primary) / 0.05)' }}
      >
        {/* Horizontal Container (2.2:1 Aspect) */}
        <div
          className="relative aspect-[2.2/1] w-full overflow-hidden bg-dark-200 flex items-center"
          style={!bannerSrc ? { background: gradientFallback } : {}}
        >
          {bannerSrc && (
            <img
              src={bannerSrc}
              alt={category.name}
              className="absolute inset-0 w-full h-full object-cover saturate-[0.7] contrast-[1.1] duration-1000 ease-premium group-hover:scale-110 group-hover:saturate-100 transition-all"
            />
          )}

          {/* Editorial Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-dark-50/90 via-dark-50/40 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-70" />
          
          {/* Content Container */}
          <div className="relative z-10 px-4 flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              {icon && (
                <span className="text-lg drop-shadow-md">{icon}</span>
              )}
              <h3 className="text-[14px] font-bold text-primary tracking-tight group-hover:text-primary-400 transition-colors drop-shadow-sm">
                {category.name}
              </h3>
            </div>
            
            {/* Subtle Hover-only count */}
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-2 group-hover:translate-x-0">
               <span className="text-[10px] font-mono text-primary/40 uppercase tracking-tighter bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10 backdrop-blur-sm">
                {itemCount}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CategoryCard;
