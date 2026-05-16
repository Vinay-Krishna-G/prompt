import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader as LoaderIcon, AlertCircle } from 'lucide-react';
import { getPromptById, updatePrompt } from '../services/promptService';
import { getCategories } from '../services/categoryService';
import { getAIModels } from '../services/aiModelService';

// Skeleton for loading state
const FieldSkeleton = () => (
  <div className="h-10 rounded-xl bg-primary/5 animate-pulse" />
);

const EditPromptPage = () => {
  const { id } = useParams(); // MongoDB _id from admin dashboard link
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [aiModels, setAiModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // Load categories + models in parallel
  useEffect(() => {
    Promise.all([getCategories(), getAIModels()])
      .then(([catRes, modelRes]) => {
        setCategories(catRes.categories || []);
        setAiModels(modelRes.aiModels || []);
      })
      .catch(console.error);
  }, []);

  // Load prompt by _id (admin route)
  useEffect(() => {
    if (!id) return;
    const fetchPrompt = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const data = await getPromptById(id);
        setFormData({
          _id: data._id,
          title: data.title ?? '',
          promptText: data.promptText ?? '',
          description: data.description ?? '',
          category: data.category ?? '',
          type: data.type ?? 'image',
          tags: (data.tags ?? []).join(', '),
          customizationNotes: data.customizationNotes ?? '',
          aiModel: data.aiModel ?? '',
          isTrending: data.isTrending ?? false,
          previewImage: data.previewImage ?? '',
          previewVideo: data.previewVideo ?? '',
          dominantColor: data.dominantColor ?? '#0a0f1c',
          config: {
            aspectRatio: data.config?.aspectRatio ?? '',
            chaos: data.config?.chaos ?? '',
            quality: data.config?.quality ?? '',
            style: data.config?.style ?? '',
          },
        });
      } catch (err) {
        console.error('Failed to load prompt', err);
        setLoadError('Prompt not found or you do not have permission to edit it.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPrompt();
  }, [id]);

  const set = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));
  const setConfig = (key, value) =>
    setFormData((prev) => ({ ...prev, config: { ...prev.config, [key]: value } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData) return;
    try {
      setIsSaving(true);
      const payload = {
        title: formData.title,
        promptText: formData.promptText,
        description: formData.description || undefined,
        category: formData.category,
        type: formData.type,
        tags: formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        aiModel: formData.aiModel,
        customizationNotes: formData.customizationNotes || undefined,
        isTrending: formData.isTrending,
        previewImage: formData.previewImage || undefined,
        previewVideo: formData.previewVideo || undefined,
        dominantColor: formData.dominantColor || undefined,
        config: {
          aspectRatio: formData.config.aspectRatio || undefined,
          chaos: formData.config.chaos || undefined,
          quality: formData.config.quality || undefined,
          style: formData.config.style || undefined,
        },
      };

      await updatePrompt(formData._id, payload);
      navigate('/admin');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update prompt');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
          <div className="mb-8 flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-2 text-muted hover:text-primary transition-colors">
              <ArrowLeft size={18} /> Back to Dashboard
            </Link>
            <div className="h-6 w-32 rounded bg-primary/5 animate-pulse" />
          </div>
          <div className="glass-card p-8 space-y-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-24 rounded bg-primary/5 animate-pulse" />
                <FieldSkeleton />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (loadError || !formData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <AlertCircle size={40} className="mx-auto text-red-400/60 mb-4" />
          <h2 className="text-lg font-semibold text-primary mb-2">Unable to Load Prompt</h2>
          <p className="text-muted text-sm mb-6">{loadError || 'An unexpected error occurred.'}</p>
          <Link to="/admin" className="btn-primary py-2.5 px-6 inline-flex items-center gap-2">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // ── Edit form ──
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
        <div className="mb-8 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2 text-muted hover:text-primary transition-colors">
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>
          <h1 className="text-xl font-display font-bold text-primary">Edit Prompt</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Title */}
            <div>
              <label className="text-xs text-muted uppercase tracking-widest mb-2 block">Prompt Title *</label>
              <input
                required
                value={formData.title}
                onChange={(e) => set('title', e.target.value)}
                className="input-minimal"
                placeholder="e.g. Ultra Realistic Cinematic Portrait"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs text-muted uppercase tracking-widest mb-2 block">
                Description <span className="normal-case opacity-50">(optional – shown on detail page)</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => set('description', e.target.value)}
                className="input-minimal min-h-[80px] resize-y text-sm"
                placeholder="Brief description of what this prompt creates..."
              />
            </div>

            {/* Customization Notes */}
            <div>
              <label className="text-xs text-muted uppercase tracking-widest mb-2 block">
                Customization Notes <span className="normal-case opacity-50">(optional)</span>
              </label>
              <textarea
                value={formData.customizationNotes}
                onChange={(e) => set('customizationNotes', e.target.value)}
                className="input-minimal min-h-[80px] resize-y text-sm"
                placeholder="Example: &#10;- Change gender&#10;- North Indian style&#10;- Anime version&#10;- Add cinematic rain"
              />
            </div>

            {/* Prompt Text */}
            <div>
              <label className="text-xs text-muted uppercase tracking-widest mb-2 block">Prompt Text *</label>
              <textarea
                required
                value={formData.promptText}
                onChange={(e) => set('promptText', e.target.value)}
                className="input-minimal min-h-[140px] resize-y font-mono text-sm"
                placeholder="The full prompt text that users will copy..."
              />
            </div>

            {/* Category + Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted uppercase tracking-widest mb-2 block">Category *</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => set('category', e.target.value)}
                  className="input-minimal"
                >
                  {categories.length === 0 ? (
                    <option value={formData.category}>{formData.category || 'Loading...'}</option>
                  ) : (
                    categories.map((c) => (
                      <option key={c._id} value={c.name}>{c.name}</option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted uppercase tracking-widest mb-2 block">Type *</label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => set('type', e.target.value)}
                  className="input-minimal"
                >
                  <option value="image">Image Prompt</option>
                  <option value="video">Video Prompt</option>
                </select>
              </div>
            </div>

            {/* AI Model + Trending */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted uppercase tracking-widest mb-2 block">AI Model *</label>
                <select
                  required
                  value={formData.aiModel}
                  onChange={(e) => set('aiModel', e.target.value)}
                  className="input-minimal"
                >
                  {aiModels.length === 0 ? (
                    <option value={formData.aiModel}>{formData.aiModel || 'Loading...'}</option>
                  ) : (
                    aiModels.map((m) => (
                      <option key={m._id} value={m.name}>{m.name}</option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted uppercase tracking-widest mb-2 block">Status</label>
                <label className="flex items-center gap-3 mt-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isTrending}
                    onChange={(e) => set('isTrending', e.target.checked)}
                    className="w-5 h-5 rounded border-primary/20 bg-primary/5"
                  />
                  <span className="text-sm text-primary">Mark as Trending</span>
                </label>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="text-xs text-muted uppercase tracking-widest mb-2 block">
                Tags <span className="normal-case opacity-50">(comma separated)</span>
              </label>
              <input
                value={formData.tags}
                onChange={(e) => set('tags', e.target.value)}
                className="input-minimal"
                placeholder="cinematic, portrait, neon, photography"
              />
            </div>

            {/* Preview URLs */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-xs text-muted uppercase tracking-widest mb-2 block">
                  Preview Image URL <span className="normal-case opacity-50">(Cloudinary)</span>
                </label>
                <input
                  value={formData.previewImage}
                  onChange={(e) => set('previewImage', e.target.value)}
                  className="input-minimal text-sm"
                  placeholder="https://res.cloudinary.com/..."
                />
              </div>
              {formData.type === 'video' && (
                <div>
                  <label className="text-xs text-muted uppercase tracking-widest mb-2 block">
                    Preview Video URL <span className="normal-case opacity-50">(Cloudinary)</span>
                  </label>
                  <input
                    value={formData.previewVideo}
                    onChange={(e) => set('previewVideo', e.target.value)}
                    className="input-minimal text-sm"
                    placeholder="https://res.cloudinary.com/..."
                  />
                </div>
              )}
            </div>

            {/* Config parameters */}
            <div>
              <label className="text-xs text-muted uppercase tracking-widest mb-3 block">
                Generation Config <span className="normal-case opacity-50">(all optional)</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'aspectRatio', label: 'Aspect Ratio', placeholder: 'e.g. 16:9' },
                  { key: 'chaos', label: 'Chaos', placeholder: 'e.g. Low, Medium, High' },
                  { key: 'quality', label: 'Quality', placeholder: 'e.g. Max, Standard' },
                  { key: 'style', label: 'Style', placeholder: 'e.g. Raw, Cinematic' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="text-[11px] text-muted uppercase tracking-wider mb-1.5 block">{label}</label>
                    <input
                      value={formData.config[key]}
                      onChange={(e) => setConfig(key, e.target.value)}
                      className="input-minimal text-sm"
                      placeholder={placeholder}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Dominant color */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-xs text-muted uppercase tracking-widest mb-2 block">
                  Dominant Color <span className="normal-case opacity-50">(for ambient glow)</span>
                </label>
                <input
                  value={formData.dominantColor}
                  onChange={(e) => set('dominantColor', e.target.value)}
                  className="input-minimal text-sm"
                  placeholder="#0a0f1c"
                />
              </div>
              <div
                className="w-10 h-10 rounded-xl border border-primary/10 flex-shrink-0 mt-6"
                style={{ backgroundColor: formData.dominantColor || '#0a0f1c' }}
              />
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-primary/5 flex items-center justify-between">
              <Link to="/admin" className="text-sm text-muted hover:text-primary transition-colors">
                Cancel
              </Link>
              <button type="submit" disabled={isSaving} className="btn-primary py-3 px-8">
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <LoaderIcon size={16} className="animate-spin" /> Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save size={16} /> Save Changes
                  </span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EditPromptPage;
