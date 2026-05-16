import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  Code2, 
  GraduationCap, 
  Building2, 
  ArrowRight,
  Sparkles,
  BookOpen,
  Terminal,
  BarChart3,
  AlertCircle
} from 'lucide-react';
import { EASE_PREMIUM } from '../lib/motion';
import { getPrompts } from '../services/promptService';
import WorkflowCard from '../components/WorkflowCard';
import Loader from '../components/Loader';

const CATEGORIES = [
  {
    id: 'Career',
    title: 'Career',
    subtitle: 'Resume • ATS • Interviews',
    description: 'Optimize your professional presence with prompts for high-conversion resumes and interview preparation.',
    icon: <Briefcase size={22} />,
    color: 'from-blue-500/20 to-indigo-500/20',
  },
  {
    id: 'Coding',
    title: 'Coding',
    subtitle: 'Debugging • React • Architecture',
    description: 'Accelerate your development cycle with specialized workflows for code reviews and system design.',
    icon: <Code2 size={22} />,
    color: 'from-emerald-500/20 to-teal-500/20',
  },
  {
    id: 'Study',
    title: 'Study',
    subtitle: 'Research • Learning • Notes',
    description: 'Master any subject with structured systems for note-taking, research synthesis, and rapid learning.',
    icon: <GraduationCap size={22} />,
    color: 'from-purple-500/20 to-violet-500/20',
  },
  {
    id: 'Business',
    title: 'Business',
    subtitle: 'Marketing • Strategy • Branding',
    description: 'Scale your operations with automated systems for strategic planning and brand positioning.',
    icon: <Building2 size={22} />,
    color: 'from-rose-500/20 to-orange-500/20',
  }
];

const WorkflowsPage = () => {
  const { category: categoryId } = useParams();
  const [prompts, setPrompts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchWorkflows = async () => {
      try {
        setIsLoading(true);
        const params = { promptType: 'workflow', limit: 50 };
        if (categoryId) {
          params.workflowCategory = categoryId;
        }
        const data = await getPrompts(params);
        setPrompts(data.prompts || []);
      } catch (err) {
        console.error('Failed to fetch workflows', err);
        setError('Unable to load workflow systems.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchWorkflows();
  }, [categoryId]);

  if (isLoading) return <Loader fullScreen />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 px-6 text-center">
        <div className="max-w-md">
          <AlertCircle size={40} className="mx-auto text-red-500/50 mb-4" />
          <h2 className="text-xl font-display font-bold text-primary mb-2">Something went wrong</h2>
          <p className="text-muted text-sm mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary py-2 px-6">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (categoryId) {
    const activeCategory = CATEGORIES.find(c => c.id.toLowerCase() === categoryId.toLowerCase());
    
    return (
      <div className="min-h-screen pt-32 pb-24">
        <div className="section-contain">
          <Link 
            to="/workflows" 
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors mb-10"
          >
            <ArrowRight size={14} className="rotate-180" /> Back to Workflows
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: EASE_PREMIUM }}
            className="mb-16"
          >
            <div className="flex items-center gap-4 mb-6">
               <div className={`w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary/60`}>
                 {activeCategory?.icon || <Sparkles size={22} />}
               </div>
               <div>
                 <h1 className="heading-cinematic text-4xl md:text-5xl">{activeCategory?.title || categoryId}</h1>
                 <p className="text-muted text-lg mt-1">{activeCategory?.subtitle || 'Curated Workflow Systems'}</p>
               </div>
            </div>
            
            <div className="h-px bg-primary/5 w-full" />
          </motion.div>

          {prompts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {prompts.map((p, i) => (
                <WorkflowCard key={p._id || p.id} prompt={p} index={i} />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center glass-card border-dashed border-primary/10 rounded-3xl">
              <Sparkles size={32} className="mx-auto text-primary/10 mb-4" />
              <h3 className="text-xl font-display font-bold text-primary/80 mb-2">
                {activeCategory?.title || categoryId} systems coming soon
              </h3>
              <p className="text-muted text-sm max-w-sm mx-auto leading-relaxed">
                Our editorial team is curating the most effective prompt systems for this category.
                Check back soon for new releases.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 md:pt-40">
      <div className="section-contain">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE_PREMIUM }}
          className="max-w-3xl mb-20 md:mb-28"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/[0.03] border border-primary/[0.06] mb-6">
            <Sparkles size={12} className="text-primary/50" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary/60">Utility Systems</span>
          </div>
          <h1 className="heading-cinematic text-5xl md:text-7xl mb-6">
            AI Workflows
          </h1>
          <p className="text-lg md:text-xl text-muted leading-relaxed max-w-2xl">
            Curated prompt systems designed for professional efficiency. 
            From system architecture to interview preparation, master your operations.
          </p>
        </motion.div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8 mb-24">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: EASE_PREMIUM, delay: i * 0.08 }}
            >
              <Link
                to={`/workflows/${cat.id}`}
                className="group relative block h-full p-8 rounded-3xl border border-primary/[0.05] bg-primary/[0.01] hover:bg-primary/[0.02] transition-all duration-500 ease-premium overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1"
              >
                {/* Subtle Gradient Glow */}
                <div 
                  className={`absolute -right-20 -top-20 w-64 h-64 blur-[100px] opacity-0 group-hover:opacity-10 transition-opacity duration-700 bg-gradient-to-br ${cat.color}`} 
                />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary/40 group-hover:text-primary transition-colors duration-500">
                      {cat.icon}
                    </div>
                    <div className="opacity-0 group-hover:opacity-40 transition-opacity duration-500 translate-x-2 group-hover:translate-x-0">
                      <ArrowRight size={20} />
                    </div>
                  </div>

                  <h3 className="text-2xl font-display font-bold text-primary mb-1">
                    {cat.title}
                  </h3>
                  <p className="text-[11px] uppercase tracking-[0.15em] font-bold text-primary/30 mb-4 group-hover:text-primary/50 transition-colors">
                    {cat.subtitle}
                  </p>
                  <p className="text-muted text-[15px] leading-relaxed line-clamp-2 opacity-70 group-hover:opacity-90 transition-opacity">
                    {cat.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Latest Workflows List */}
        {prompts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-32"
          >
             <div className="flex items-center justify-between mb-10 border-b border-primary/5 pb-6">
                <h2 className="text-2xl font-display font-bold text-primary">Latest Systems</h2>
                <div className="h-px flex-1 bg-primary/5 ml-8" />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {prompts.slice(0, 6).map((p, i) => (
                  <WorkflowCard key={p._id || p.id} prompt={p} index={i} />
                ))}
             </div>
          </motion.div>
        )}

        {/* Info Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-32 p-12 rounded-3xl border border-primary/[0.04] bg-primary/[0.01] text-center"
        >
          <div className="flex justify-center gap-12 flex-wrap opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700">
            <div className="flex items-center gap-2">
               <BookOpen size={18} />
               <span className="text-sm font-medium tracking-wide">Structured Learning</span>
            </div>
            <div className="flex items-center gap-2">
               <Terminal size={18} />
               <span className="text-sm font-medium tracking-wide">Developer Tools</span>
            </div>
            <div className="flex items-center gap-2">
               <BarChart3 size={18} />
               <span className="text-sm font-medium tracking-wide">Business Systems</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WorkflowsPage;
