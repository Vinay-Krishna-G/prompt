import { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Terminal, Cpu, Sparkles } from 'lucide-react';
import { EASE_PREMIUM } from '../lib/motion';

const WorkflowCard = ({ prompt, index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.65, 
        ease: EASE_PREMIUM, 
        delay: index * 0.04 
      }}
      className="h-full"
    >
      <Link
        to={`/prompt/${prompt.slug || prompt.id}`}
        className="group relative flex flex-col h-full p-6 md:p-8 rounded-3xl border border-primary/[0.05] bg-primary/[0.01] hover:bg-primary/[0.02] transition-all duration-500 ease-premium overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1"
      >
        {/* Category Badge */}
        <div className="flex items-center justify-between mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary/40">
              {prompt.workflowCategory || 'Workflow'}
            </span>
          </div>
          <div className="opacity-0 group-hover:opacity-40 transition-opacity duration-500 translate-x-2 group-hover:translate-x-0">
            <ArrowRight size={18} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-xl md:text-2xl font-display font-bold text-primary mb-3 leading-tight">
            {prompt.title}
          </h3>
          <p className="text-muted text-[15px] leading-relaxed line-clamp-3 mb-6 opacity-70 group-hover:opacity-90 transition-opacity">
            {prompt.description || 'Professional prompt system designed for efficiency and high-quality output.'}
          </p>
        </div>

        {/* Tools/Tags */}
        <div className="flex flex-wrap gap-2 mt-auto pt-6 border-t border-primary/5">
          {prompt.workflowTools && prompt.workflowTools.length > 0 ? (
            prompt.workflowTools.map((tool) => (
              <span 
                key={tool}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/[0.03] border border-primary/[0.05] text-[11px] font-medium text-primary/50"
              >
                <div className="w-1 h-1 rounded-full bg-primary/20" />
                {tool}
              </span>
            ))
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/[0.03] border border-primary/[0.05] text-[11px] font-medium text-primary/50">
              <Sparkles size={10} className="opacity-40" /> Universal
            </span>
          )}
        </div>

        {/* Subtle Bottom Accent */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      </Link>
    </motion.div>
  );
};

export default memo(WorkflowCard);
