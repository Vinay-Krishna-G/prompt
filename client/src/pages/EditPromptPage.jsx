import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader as LoaderIcon } from 'lucide-react';
import { getPromptBySlug, updatePrompt } from '../services/promptService';
import { getCategories } from '../services/categoryService';
import { getAIModels } from '../services/aiModelService';

const EditPromptPage = () => {
  const { id } = useParams(); // Using ID
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [aiModels, setAiModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const [catRes, modelRes] = await Promise.all([getCategories(), getAIModels()]);
        setCategories(catRes.categories || []);
        setAiModels(modelRes.aiModels || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDependencies();
  }, []);

  useEffect(() => {
    const fetchPrompt = async () => {
      try {
        // We'll fetch by slug from the router, but wait we need by ID.
        // The getPromptBySlug endpoint works if we pass slug. Let's just pass ID in the update, but how to fetch?
        // Admin dashboard has prompt.slug or prompt.id. We can use the slug to fetch, then use its _id to update.
        const data = await getPromptBySlug(id); // assuming 'id' is actually slug in the URL
        setFormData({
          _id: data._id,
          title: data.title,
          promptText: data.promptText,
          category: data.category,
          type: data.type,
          tags: data.tags?.join(', ') || '',
          aiModel: data.aiModel,
          isTrending: data.isTrending || false,
        });
      } catch (err) {
        alert('Failed to load prompt');
        navigate('/admin');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchPrompt();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const updatedPrompt = {
        title: formData.title,
        promptText: formData.promptText,
        category: formData.category,
        type: formData.type,
        tags: formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        aiModel: formData.aiModel,
        isTrending: formData.isTrending,
      };

      await updatePrompt(formData._id, updatedPrompt);
      alert('Prompt updated successfully!');
      navigate('/admin');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update prompt');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoaderIcon className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
        <div className="mb-8 flex items-center justify-between">
          <Link
            to="/admin"
            className="flex items-center gap-2 text-muted hover:text-primary transition-colors"
          >
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
            <div>
              <label className="text-xs text-muted uppercase tracking-widest mb-2 block">
                Prompt Title
              </label>
              <input
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-minimal"
              />
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-widest mb-2 block">
                Prompt Text
              </label>
              <textarea
                required
                value={formData.promptText}
                onChange={(e) => setFormData({ ...formData, promptText: e.target.value })}
                className="input-minimal min-h-[120px] resize-y font-mono text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted uppercase tracking-widest mb-2 block">
                  Category
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-minimal"
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted uppercase tracking-widest mb-2 block">
                  Type
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="input-minimal"
                >
                  <option value="image">Image Prompt</option>
                  <option value="video">Video Prompt</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted uppercase tracking-widest mb-2 block">
                  AI Model
                </label>
                <select
                  required
                  value={formData.aiModel}
                  onChange={(e) => setFormData({ ...formData, aiModel: e.target.value })}
                  className="input-minimal"
                >
                  {aiModels.length === 0 ? (
                    <option value={formData.aiModel}>{formData.aiModel}</option>
                  ) : (
                    aiModels.map((m) => (
                      <option key={m._id} value={m.name}>
                        {m.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted uppercase tracking-widest mb-2 block">
                  Trending Status
                </label>
                <label className="flex items-center gap-3 mt-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isTrending}
                    onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                    className="w-5 h-5 rounded border-primary/20 bg-primary/5 text-purple-500 focus:ring-purple-500 focus:ring-offset-background"
                  />
                  <span className="text-sm text-primary">Mark as Trending</span>
                </label>
              </div>
            </div>

            <div>
              <label className="text-xs text-muted uppercase tracking-widest mb-2 block">
                Tags (comma separated)
              </label>
              <input
                required
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="input-minimal"
              />
            </div>

            <div className="pt-4 border-t border-primary/5 flex justify-end">
              <button type="submit" disabled={isSaving} className="btn-primary py-3 px-8">
                {isSaving ? (
                  'Saving...'
                ) : (
                  <>
                    <Save size={18} /> Save Changes
                  </>
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
