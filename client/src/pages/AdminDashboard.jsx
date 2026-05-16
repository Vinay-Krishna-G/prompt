import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Upload,
  List,
  Tag,
  BarChart3,
  Users,
  Settings,
  TrendingUp,
  Copy,
  Eye,
  Zap,
  ArrowUpRight,
  MoreVertical,
  ChevronRight,
  Menu,
  X,
  Trash2,
  Edit2,
  Heart,
  Palette,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getPrompts, deletePrompt, createPrompt, uploadAsset, getDashboardStats } from '../services/promptService';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/categoryService';
import { getAIModels, createAIModel, deleteAIModel } from '../services/aiModelService';
import { getAllUsers, updateUserRole } from '../services/userService';

const SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { type: 'label', label: 'VISUALS' },
  { id: 'upload_visual', label: 'Upload Visual', icon: Upload },
  { id: 'manage_visuals', label: 'Manage Visuals', icon: List },
  { type: 'label', label: 'WORKFLOWS' },
  { id: 'upload_workflow', label: 'Upload Workflow', icon: Upload },
  { id: 'manage_workflows', label: 'Manage Workflows', icon: List },
  { type: 'label', label: 'SYSTEM' },
  { id: 'categories', label: 'Categories', icon: Tag },
  { id: 'aimodels', label: 'AI Models', icon: Zap },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const Sidebar = ({ active, setActive, setSidebarOpen }) => (
  <div className="h-full flex flex-col py-6">
    <div className="px-4 mb-8">
      <Link to="/" className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #9333ea, #06b6d4)' }}
        >
          <Zap size={16} className="text-primary" />
        </div>
        <div>
          <div className="font-display font-bold text-sm text-primary">PromptVault</div>
          <div className="text-xs text-primary/30">Admin Panel</div>
        </div>
      </Link>
    </div>

    <nav className="flex-1 px-3 space-y-1">
      {SIDEBAR_ITEMS.map((item, idx) => {
        if (item.type === 'label') {
          return (
            <div key={`label-${idx}`} className="px-4 pt-6 pb-2">
              <span className="text-[10px] font-bold tracking-[0.2em] text-primary/20 uppercase">
                {item.label}
              </span>
            </div>
          );
        }
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => {
              setActive(item.id);
              setSidebarOpen(false);
            }}
            className={`sidebar-item w-full ${active === item.id ? 'active' : ''}`}
          >
            <Icon size={17} />
            {item.label}
            {active === item.id && <ChevronRight size={14} className="ml-auto text-primary-400" />}
          </button>
        );
      })}
    </nav>

    <div className="px-3 mt-4">
      <Link to="/" className="sidebar-item block text-center">
        ← Back to Site
      </Link>
    </div>
  </div>
);

const StatCard = ({ label, value, change, icon, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="glass-card p-6"
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
      <span className="text-xs text-green-400 font-semibold flex items-center gap-0.5">
        <ArrowUpRight size={12} />
        {change}%
      </span>
    </div>
    <div className="font-display font-bold text-2xl text-primary mb-1">{value}</div>
    <div className="text-primary/40 text-sm">{label}</div>
  </motion.div>
);

// Mini bar chart visualization
const MiniBarChart = ({ data }) => {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-sm transition-all"
          style={{
            height: `${(v / max) * 100}%`,
            background: `linear-gradient(to top, rgba(147,51,234,0.8), rgba(6,182,212,0.8))`,
            opacity: i === data.length - 1 ? 1 : 0.4 + (i / data.length) * 0.6,
          }}
        />
      ))}
    </div>
  );
};

const AdminDashboard = () => {
  const { user } = useApp();
  const [active, setActive] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [recentVisuals, setRecentVisuals] = useState([]);
  const [recentWorkflows, setRecentWorkflows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [aiModels, setAiModels] = useState([]);
  const [users, setUsers] = useState([]);
  const [dashStats, setDashStats] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('');
  const [newCategoryImage, setNewCategoryImage] = useState('');
  const [editingCategory, setEditingCategory] = useState(null); // { _id, name, icon, image }
  const [newAIModelName, setNewAIModelName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    promptText: '',
    description: '',
    category: '',
    type: 'image',
    tags: '',
    customizationNotes: '',
    promptType: 'visual',
    workflowCategory: '',
    workflowTools: '',
    aiModel: 'Midjourney v6.1',
    config: {
      aspectRatio: '',
      chaos: '',
      quality: '',
      style: '',
    },
  });
  const [mediaFile, setMediaFile] = useState(null);

  const [allPrompts, setAllPrompts] = useState([]);
  const [promptsPage, setPromptsPage] = useState(1);
  const [promptsTotalPages, setPromptsTotalPages] = useState(1);

  const fetchPromptsList = async (page = 1, type = 'visual') => {
    try {
      setIsLoading(true);
      const res = await getPrompts({ limit: 20, page, promptType: type });
      setAllPrompts(res.prompts);
      setPromptsPage(res.pagination.page);
      setPromptsTotalPages(res.pagination.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsersList = async () => {
    try {
      setIsLoading(true);
      const res = await getAllUsers();
      setUsers(res.users);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.categories);
      if (res.categories.length > 0 && !formData.category) {
        setFormData((prev) => ({ ...prev, category: res.categories[0].name }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAIModels = async () => {
    try {
      const res = await getAIModels();
      setAiModels(res.aiModels || []);
      if (res.aiModels?.length > 0 && formData.aiModel === 'Midjourney v6.1') {
        setFormData((prev) => ({ ...prev, aiModel: res.aiModels[0].name }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecent = async () => {
    try {
      setIsLoading(true);
      const [visualsRes, workflowsRes, stats] = await Promise.all([
        getPrompts({ limit: 6, promptType: 'visual', sort: '-createdAt' }),
        getPrompts({ limit: 6, promptType: 'workflow', sort: '-createdAt' }),
        getDashboardStats().catch(() => null),
      ]);
      setRecentVisuals(visualsRes.prompts);
      setRecentWorkflows(workflowsRes.prompts);
      if (stats) setDashStats(stats);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchAIModels();
  }, []);

  useEffect(() => {
    if (active === 'dashboard') {
      fetchRecent();
    } else if (active === 'manage_visuals') {
      fetchPromptsList(1, 'visual');
    } else if (active === 'manage_workflows') {
      fetchPromptsList(1, 'workflow');
    } else if (active === 'upload_visual') {
      setFormData(prev => ({ ...prev, promptType: 'visual' }));
    } else if (active === 'upload_workflow') {
      setFormData(prev => ({ ...prev, promptType: 'workflow' }));
    } else if (active === 'users') {
      fetchUsersList();
    }
  }, [active]);

  const handleDelete = async (id, isAllList = false) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await deletePrompt(id);
      if (isAllList) {
        setAllPrompts((prev) => prev.filter((p) => p._id !== id && p.id !== id));
      } else {
        setRecentVisuals((prev) => prev.filter((p) => p._id !== id && p.id !== id));
        setRecentWorkflows((prev) => prev.filter((p) => p._id !== id && p.id !== id));
      }
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName) return;
    try {
      await createCategory({
        name: newCategoryName,
        icon: newCategoryIcon || undefined,
        image: newCategoryImage || undefined,
      });
      setNewCategoryName('');
      setNewCategoryIcon('');
      setNewCategoryImage('');
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create category');
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editingCategory) return;
    try {
      await updateCategory(editingCategory._id, {
        name: editingCategory.name,
        icon: editingCategory.icon || undefined,
        image: editingCategory.image || undefined,
      });
      setEditingCategory(null);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update category');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await deleteCategory(id);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete category');
    }
  };

  const handleCreateAIModel = async (e) => {
    e.preventDefault();
    if (!newAIModelName) return;
    try {
      await createAIModel({ name: newAIModelName });
      setNewAIModelName('');
      fetchAIModels();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create AI model');
    }
  };

  const handleDeleteAIModel = async (id) => {
    if (!window.confirm('Delete this AI model?')) return;
    try {
      await deleteAIModel(id);
      fetchAIModels();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete AI model');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Change user role to ${newRole}?`)) return;
    try {
      await updateUserRole(userId, newRole);
      fetchUsersList();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to change role');
    }
  };

  const handleUploadChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setMediaFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isVisual = formData.promptType === 'visual';
    if (isVisual && !mediaFile) return alert('Please upload a preview image/video');

    try {
      setIsUploading(true);
      let assetUrl = '';
      let isVideo = false;

      if (mediaFile) {
        const assetRes = await uploadAsset(mediaFile);
        assetUrl = assetRes.url;
        isVideo = assetRes.resourceType === 'video';
      }

      const newPrompt = {
        title: formData.title,
        promptText: formData.promptText,
        description: formData.description || undefined,
        category: isVisual ? formData.category : undefined,
        type: isVisual ? formData.type : 'image',
        tags: formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        customizationNotes: formData.customizationNotes || undefined,
        promptType: formData.promptType,
        workflowCategory: !isVisual ? formData.workflowCategory : undefined,
        workflowTools: !isVisual ? formData.workflowTools.split(',').map(t => t.trim()).filter(Boolean) : undefined,
        aiModel: isVisual ? formData.aiModel : undefined,
        previewImage: assetUrl ? (isVideo ? assetUrl.replace(/\.[^/.]+$/, '.jpg') : assetUrl) : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
        previewVideo: isVideo ? assetUrl : undefined,
        config: isVisual ? {
          aspectRatio: formData.config.aspectRatio || undefined,
          chaos: formData.config.chaos || undefined,
          quality: formData.config.quality || undefined,
          style: formData.config.style || undefined,
        } : undefined,
      };

      await createPrompt(newPrompt);
      alert(`${isVisual ? 'Visual' : 'Workflow'} published successfully!`);
      // Reset form...
      setFormData({
        title: '',
        promptText: '',
        description: '',
        category: categories[0]?.name || '',
        type: 'image',
        tags: '',
        customizationNotes: '',
        promptType: 'visual',
        workflowCategory: '',
        workflowTools: '',
        aiModel: aiModels[0]?.name || 'Midjourney v6.1',
        config: {
          aspectRatio: '',
          chaos: '',
          quality: '',
          style: '',
        },
      });
      setMediaFile(null);
      setActive('dashboard');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to publish');
    } finally {
      setIsUploading(false);
    }
  };

  const weeklyData = [4200, 5800, 4900, 7200, 8100, 6700, 9800];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

  const stats = [
    {
      label: 'Visual Prompts',
      value: dashStats ? (dashStats.totalVisuals || 0).toLocaleString() : '—',
      change: 0,
      icon: <Palette size={18} className="text-primary" />,
      color: 'bg-indigo-500/20',
    },
    {
      label: 'Workflow Systems',
      value: dashStats ? (dashStats.totalWorkflows || 0).toLocaleString() : '—',
      change: 0,
      icon: <Zap size={18} className="text-primary" />,
      color: 'bg-emerald-500/20',
    },
    {
      label: 'Total Views',
      value: dashStats ? (dashStats.totalViews || 0).toLocaleString() : '—',
      change: 0,
      icon: <Eye size={18} className="text-primary" />,
      color: 'bg-secondary-500/20',
    },
    {
      label: 'Platform Likes',
      value: dashStats ? (dashStats.totalLikes || 0).toLocaleString() : '—',
      change: 0,
      icon: <Heart size={18} className="text-primary" />,
      color: 'bg-pink-500/20',
    },
  ];
  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-60 flex-shrink-0 border-r border-primary/5 bg-surface/80 backdrop-blur-xl">
        <Sidebar active={active} setActive={setActive} setSidebarOpen={setSidebarOpen} />
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            className="fixed left-0 top-0 bottom-0 w-60 z-50 lg:hidden border-r border-primary/5 bg-surface"
          >
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-xl hover:bg-primary/5 text-primary/40"
              >
                <X size={18} />
              </button>
            </div>
            <Sidebar active={active} setActive={setActive} setSidebarOpen={setSidebarOpen} />
          </motion.aside>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-30 border-b border-primary/5 px-6 py-4 flex items-center justify-between bg-background/95 backdrop-blur-[20px]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-primary/5 text-primary/60"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="font-display font-bold text-lg text-primary capitalize">
                {SIDEBAR_ITEMS.find((i) => i.id === active)?.label}
              </h1>
              <p className="text-xs text-primary/30">PromptVault Admin</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-green-400 font-semibold px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
              ● Live
            </span>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-background"
              style={{ background: 'linear-gradient(135deg, #9333ea, #06b6d4)' }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
          </div>
        </div>

        <div className="p-6 max-w-6xl">
          {active === 'dashboard' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <StatCard {...stat} />
                  </motion.div>
                ))}
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                {/* Traffic chart */}
                <div className="lg:col-span-2 glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-primary">Platform Traffic</h3>
                    <span
                      className="badge-green badge text-xs"
                      style={{
                        background: 'rgba(34,197,94,0.1)',
                        color: '#4ade80',
                        border: '1px solid rgba(34,197,94,0.2)',
                      }}
                    >
                      +34.2%
                    </span>
                  </div>
                  <MiniBarChart data={weeklyData} />
                  <div className="flex justify-between mt-2">
                    {months.map((m) => (
                      <span key={m} className="text-xs text-primary/20">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Quick stats */}
                <div className="glass-card p-6">
                  <h3 className="font-semibold text-primary mb-4">Content Breakdown</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Visual Prompts', value: dashStats?.totalVisuals || 0, color: 'text-indigo-400' },
                      { label: 'Workflow Systems', value: dashStats?.totalWorkflows || 0, color: 'text-emerald-400' },
                      { label: 'Total Copies', value: dashStats?.totalCopies?.toLocaleString() || 0, color: 'text-amber-400' },
                      { label: 'Total Likes', value: dashStats?.totalLikes?.toLocaleString() || 0, color: 'text-rose-400' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span className="text-primary/50 text-sm">{item.label}</span>
                        <span className={`font-bold text-sm ${item.color}`}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Visuals */}
                <div className="glass-card overflow-hidden">
                  <div className="p-6 border-b border-primary/5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-primary">Recent Visuals</h3>
                      <button
                        onClick={() => setActive('manage_visuals')}
                        className="text-xs text-primary/60 hover:text-primary transition-colors"
                      >
                        View All
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-primary/5">
                          {['Visual', 'Views', 'Copies', ''].map((h) => (
                            <th
                              key={h}
                              className="text-left px-6 py-3 text-[10px] font-semibold text-primary/30 uppercase tracking-widest"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {isLoading ? (
                          <tr><td colSpan="3" className="px-6 py-4 text-center text-xs opacity-50">Loading...</td></tr>
                        ) : (
                          recentVisuals.map((prompt) => (
                            <tr key={prompt._id} className="border-b border-primary/5 hover:bg-primary/2 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <img src={prompt.previewImage} alt="" className="w-8 h-8 rounded-lg object-cover" />
                                  <span className="text-xs text-primary/80 font-medium line-clamp-1">{prompt.title}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-xs text-primary/60">{(prompt.views || 0).toLocaleString()}</td>
                              <td className="px-6 py-4 text-xs text-primary/60">{(prompt.copies || 0).toLocaleString()}</td>
                              <td className="px-6 py-4 text-right">
                                <button onClick={() => handleDelete(prompt._id)} className="text-primary/20 hover:text-red-400 transition-colors">
                                  <Trash2 size={12} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recent Workflows */}
                <div className="glass-card overflow-hidden">
                  <div className="p-6 border-b border-primary/5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-primary">Recent Workflows</h3>
                      <button
                        onClick={() => setActive('manage_workflows')}
                        className="text-xs text-primary/60 hover:text-primary transition-colors"
                      >
                        View All
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-primary/5">
                          {['System', 'Views', 'Category', ''].map((h) => (
                            <th
                              key={h}
                              className="text-left px-6 py-3 text-[10px] font-semibold text-primary/30 uppercase tracking-widest"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {isLoading ? (
                          <tr><td colSpan="3" className="px-6 py-4 text-center text-xs opacity-50">Loading...</td></tr>
                        ) : (
                          recentWorkflows.map((prompt) => (
                            <tr key={prompt._id} className="border-b border-primary/5 hover:bg-primary/2 transition-colors">
                              <td className="px-6 py-4">
                                <span className="text-xs text-primary/80 font-medium line-clamp-1">{prompt.title}</span>
                              </td>
                              <td className="px-6 py-4 text-xs text-primary/60">{(prompt.views || 0).toLocaleString()}</td>
                              <td className="px-6 py-4">
                                <span className="text-[10px] font-bold text-primary/40 uppercase tracking-wider">{prompt.workflowCategory}</span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button onClick={() => handleDelete(prompt._id)} className="text-primary/20 hover:text-red-400 transition-colors">
                                  <Trash2 size={12} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {active === 'manage_visuals' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-display font-bold text-primary">Manage Visuals</h2>
                  <p className="text-primary/50 text-sm">View, edit, or delete AI image/video templates</p>
                </div>
                <button
                  onClick={() => setActive('upload_visual')}
                  className="btn-primary py-2 px-4 text-sm"
                >
                  <Upload size={14} /> Upload Visual
                </button>
              </div>

              <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-primary/5">
                        {['Visual', 'Category', 'Type', 'Views', 'Copies', 'Likes', 'Date', ''].map((h) => (
                          <th
                            key={h}
                            className="text-left px-6 py-3 text-xs font-semibold text-primary/30 uppercase tracking-widest"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr><td colSpan="7" className="px-6 py-4 text-center text-primary/50">Loading...</td></tr>
                      ) : allPrompts.length === 0 ? (
                        <tr><td colSpan="7" className="px-6 py-4 text-center text-primary/50">No visuals found.</td></tr>
                      ) : (
                        allPrompts.map((prompt) => (
                          <tr
                            key={prompt._id || prompt.id}
                            className="border-b border-primary/5 hover:bg-primary/2 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={prompt.previewImage}
                                  alt=""
                                  className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                                />
                                <span className="text-sm text-primary/80 font-medium line-clamp-1 max-w-[200px]">
                                  {prompt.title}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="badge-purple badge text-xs">
                                {prompt.category || prompt.categoryName}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`badge text-xs ${prompt.type === 'video' ? 'badge-pink' : 'badge-cyan'}`}
                              >
                                {prompt.type}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-primary/60">
                              {(prompt.views || 0).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-sm text-primary/60">
                              {(prompt.copies || 0).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-sm text-primary/60">
                              {(prompt.likesCount || prompt.likes || 0).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-xs text-primary/30">
                              {new Date(prompt.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 flex gap-2">
                              <Link
                                to={`/admin/prompt/${prompt._id || prompt.id}/edit`}
                                className="p-1.5 rounded-lg hover:bg-primary/5 text-primary/40 hover:text-primary transition-all"
                              >
                                <Edit2 size={14} />
                              </Link>
                              <button
                                onClick={() => handleDelete(prompt._id || prompt.id, true)}
                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-primary/40 hover:text-red-400 transition-all"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {promptsTotalPages > 1 && (
                  <div className="p-4 border-t border-primary/5 flex justify-center gap-2">
                    <button
                      onClick={() => fetchPromptsList(promptsPage - 1, 'visual')}
                      disabled={promptsPage === 1}
                      className="px-3 py-1 bg-primary/5 rounded-lg text-sm text-primary/60 disabled:opacity-30"
                    >
                      Prev
                    </button>
                    <span className="px-3 py-1 text-sm text-primary/60">
                      Page {promptsPage} of {promptsTotalPages}
                    </span>
                    <button
                      onClick={() => fetchPromptsList(promptsPage + 1, 'visual')}
                      disabled={promptsPage === promptsTotalPages}
                      className="px-3 py-1 bg-primary/5 rounded-lg text-sm text-primary/60 disabled:opacity-30"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {active === 'manage_workflows' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-display font-bold text-primary">Manage Workflows</h2>
                  <p className="text-primary/50 text-sm">Organize and refine structured AI templates</p>
                </div>
                <button
                  onClick={() => setActive('upload_workflow')}
                  className="btn-primary py-2 px-4 text-sm bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                >
                  <Zap size={14} /> Upload Workflow
                </button>
              </div>

              <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-primary/5">
                        {['Workflow', 'Domain', 'Views', 'Copies', 'Likes', 'Date', ''].map((h) => (
                          <th
                            key={h}
                            className="text-left px-6 py-3 text-xs font-semibold text-primary/30 uppercase tracking-widest"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr><td colSpan="7" className="px-6 py-4 text-center text-primary/50">Loading...</td></tr>
                      ) : allPrompts.length === 0 ? (
                        <tr><td colSpan="7" className="px-6 py-4 text-center text-primary/50">No workflows found.</td></tr>
                      ) : (
                        allPrompts.map((prompt) => (
                          <tr
                            key={prompt._id || prompt.id}
                            className="border-b border-primary/5 hover:bg-primary/2 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <span className="text-sm text-primary/80 font-medium line-clamp-1 max-w-[200px]">
                                {prompt.title}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-[10px] font-bold text-primary/40 uppercase tracking-[0.15em]">
                                {prompt.workflowCategory}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1">
                                {prompt.workflowTools?.slice(0, 2).map(t => (
                                  <span key={t} className="px-1.5 py-0.5 rounded-md bg-primary/[0.03] text-[9px] text-primary/40 border border-primary/5">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-primary/60">
                              {(prompt.views || 0).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-sm text-primary/60">
                              {(prompt.copies || 0).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-sm text-primary/60">
                              {(prompt.likesCount || prompt.likes || 0).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-xs text-primary/30">
                              {new Date(prompt.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 flex gap-2">
                              <Link
                                to={`/admin/prompt/${prompt._id || prompt.id}/edit`}
                                className="p-1.5 rounded-lg hover:bg-primary/5 text-primary/40 hover:text-primary transition-all"
                              >
                                <Edit2 size={14} />
                              </Link>
                              <button
                                onClick={() => handleDelete(prompt._id || prompt.id, true)}
                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-primary/40 hover:text-red-400 transition-all"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {promptsTotalPages > 1 && (
                  <div className="p-4 border-t border-primary/5 flex justify-center gap-2">
                    <button
                      onClick={() => fetchPromptsList(promptsPage - 1, 'workflow')}
                      disabled={promptsPage === 1}
                      className="px-3 py-1 bg-primary/5 rounded-lg text-sm text-primary/60 disabled:opacity-30"
                    >
                      Prev
                    </button>
                    <span className="px-3 py-1 text-sm text-primary/60">
                      Page {promptsPage} of {promptsTotalPages}
                    </span>
                    <button
                      onClick={() => fetchPromptsList(promptsPage + 1, 'workflow')}
                      disabled={promptsPage === promptsTotalPages}
                      className="px-3 py-1 bg-primary/5 rounded-lg text-sm text-primary/60 disabled:opacity-30"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {active === 'upload_visual' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl">
              <div className="mb-10">
                <h2 className="text-2xl font-display font-bold text-primary">Upload Visual Prompt</h2>
                <p className="text-primary/50 text-sm">Publish high-fidelity AI image or video templates</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Media Upload Section */}
                <div className="glass-card p-2 rounded-[2rem] border border-primary/5">
                  <div className="relative h-64 md:h-80 border-2 border-dashed border-primary/10 rounded-[1.8rem] flex flex-col items-center justify-center hover:border-primary/20 transition-all cursor-pointer bg-primary/[0.01] overflow-hidden group">
                    <input
                      type="file"
                      required
                      onChange={handleUploadChange}
                      accept="image/*,video/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    
                    {mediaFile ? (
                      <div className="text-center px-6">
                        <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto mb-4 border border-primary/5">
                          <Eye size={24} className="text-primary/40" />
                        </div>
                        <p className="text-sm font-semibold text-primary mb-1 truncate max-w-xs">{mediaFile.name}</p>
                        <p className="text-[10px] uppercase tracking-widest text-primary/30">Ready to upload • {(mediaFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto mb-4 border border-primary/5 group-hover:scale-110 transition-transform duration-500">
                          <Upload size={24} className="text-primary/40" />
                        </div>
                        <p className="text-sm font-semibold text-primary mb-1">Select visual media</p>
                        <p className="text-[10px] uppercase tracking-widest text-primary/30">Images or Videos up to 100MB</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-bold text-primary/30 uppercase tracking-[0.2em] mb-3 block">Basic Info</label>
                      <div className="space-y-4">
                        <input
                          required
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="input-minimal bg-primary/[0.02]"
                          placeholder="Visual Title"
                        />
                        <textarea
                          required
                          value={formData.promptText}
                          onChange={(e) => setFormData({ ...formData, promptText: e.target.value })}
                          className="input-minimal bg-primary/[0.02] min-h-[140px] font-mono text-xs leading-relaxed"
                          placeholder="Full Prompt Text..."
                        />
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="input-minimal bg-primary/[0.02] min-h-[80px] text-sm"
                          placeholder="Editorial Description (Optional)"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-primary/30 uppercase tracking-[0.2em] mb-3 block">Classification</label>
                      <div className="grid grid-cols-2 gap-4">
                        <select
                          required
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="input-minimal bg-primary/[0.02]"
                        >
                          {categories.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
                        </select>
                        <select
                          required
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                          className="input-minimal bg-primary/[0.02]"
                        >
                          <option value="image">Image</option>
                          <option value="video">Video</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-bold text-primary/30 uppercase tracking-[0.2em] mb-3 block">Configuration</label>
                      <div className="space-y-4">
                        <select
                          required
                          value={formData.aiModel}
                          onChange={(e) => setFormData({ ...formData, aiModel: e.target.value })}
                          className="input-minimal bg-primary/[0.02]"
                        >
                          {aiModels.map((m) => <option key={m._id} value={m.name}>{m.name}</option>)}
                        </select>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            value={formData.config.aspectRatio}
                            onChange={(e) => setFormData({ ...formData, config: { ...formData.config, aspectRatio: e.target.value } })}
                            className="input-minimal bg-primary/[0.02] text-xs"
                            placeholder="Aspect Ratio"
                          />
                          <input
                            value={formData.config.chaos}
                            onChange={(e) => setFormData({ ...formData, config: { ...formData.config, chaos: e.target.value } })}
                            className="input-minimal bg-primary/[0.02] text-xs"
                            placeholder="Chaos"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-primary/30 uppercase tracking-[0.2em] mb-3 block">Metadata</label>
                      <div className="space-y-4">
                        <input
                          required
                          value={formData.tags}
                          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                          className="input-minimal bg-primary/[0.02]"
                          placeholder="Tags (comma separated)"
                        />
                        <textarea
                          value={formData.customizationNotes}
                          onChange={(e) => setFormData({ ...formData, customizationNotes: e.target.value })}
                          className="input-minimal bg-primary/[0.02] min-h-[100px] text-xs"
                          placeholder="Customization Ideas..."
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isUploading}
                      className="btn-primary w-full justify-center py-4 rounded-2xl shadow-xl shadow-primary/10"
                    >
                      {isUploading ? 'Publishing...' : <><Upload size={18} /> Publish Visual</>}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          )}

          {active === 'upload_workflow' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl">
              <div className="mb-10">
                <h2 className="text-2xl font-display font-bold text-primary">Upload Workflow System</h2>
                <p className="text-primary/50 text-sm">Publish structured AI utility templates for productivity</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-bold text-primary/30 uppercase tracking-[0.2em] mb-3 block">Structure</label>
                      <div className="space-y-4">
                        <input
                          required
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="input-minimal bg-primary/[0.01] border-primary/5"
                          placeholder="Workflow Title"
                        />
                        <textarea
                          required
                          value={formData.promptText}
                          onChange={(e) => setFormData({ ...formData, promptText: e.target.value })}
                          className="input-minimal bg-primary/[0.01] border-primary/5 min-h-[180px] font-mono text-[13px] leading-relaxed"
                          placeholder="Full System Prompt..."
                        />
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="input-minimal bg-primary/[0.01] border-primary/5 min-h-[100px] text-sm"
                          placeholder="Explain how this system works..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-bold text-primary/30 uppercase tracking-[0.2em] mb-3 block">Parameters</label>
                      <div className="space-y-4">
                        <select
                          required
                          value={formData.workflowCategory}
                          onChange={(e) => setFormData({ ...formData, workflowCategory: e.target.value })}
                          className="input-minimal bg-primary/[0.01] border-primary/5"
                        >
                          <option value="">Select Domain</option>
                          {['Career', 'Coding', 'Study', 'Business'].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        <input
                          required
                          value={formData.workflowTools}
                          onChange={(e) => setFormData({ ...formData, workflowTools: e.target.value })}
                          className="input-minimal bg-primary/[0.01] border-primary/5"
                          placeholder="Target Tools (e.g. ChatGPT, Claude)"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-primary/30 uppercase tracking-[0.2em] mb-3 block">Details</label>
                      <div className="space-y-4">
                        <input
                          required
                          value={formData.tags}
                          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                          className="input-minimal bg-primary/[0.01] border-primary/5"
                          placeholder="Tags (comma separated)"
                        />
                        <textarea
                          value={formData.customizationNotes}
                          onChange={(e) => setFormData({ ...formData, customizationNotes: e.target.value })}
                          className="input-minimal bg-primary/[0.01] border-primary/5 min-h-[120px] text-xs"
                          placeholder="Mention specific usage notes or variants..."
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isUploading}
                        className="btn-primary w-full justify-center py-4 rounded-2xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20"
                      >
                        {isUploading ? 'Publishing...' : <><Zap size={18} /> Publish Workflow</>}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </motion.div>
          )}

          {active === 'categories' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-display font-bold text-primary">
                    Category Management
                  </h2>
                  <p className="text-primary/50 text-sm">Create and organize prompt categories</p>
                </div>
              </div>

              <div className="glass-card p-6 mb-8">
                <form onSubmit={handleCreateCategory} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="text-xs text-primary/50 uppercase tracking-widest mb-2 block">
                        Category Name *
                      </label>
                      <input
                        required
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="input-minimal"
                        placeholder="e.g. Cyberpunk"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-primary/50 uppercase tracking-widest mb-2 block">
                        Icon (emoji) <span className="normal-case">– optional</span>
                      </label>
                      <input
                        value={newCategoryIcon}
                        onChange={(e) => setNewCategoryIcon(e.target.value)}
                        className="input-minimal"
                        placeholder="e.g. 🌟, 🎭, 📸"
                        maxLength={4}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-primary/50 uppercase tracking-widest mb-2 block">
                      Banner Image URL (Cloudinary or any public URL)
                    </label>
                    <input
                      value={newCategoryImage}
                      onChange={(e) => setNewCategoryImage(e.target.value)}
                      className="input-minimal"
                      placeholder="https://res.cloudinary.com/..."
                    />
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="btn-primary py-2.5 px-6">
                      Add Category
                    </button>
                  </div>
                </form>
              </div>

              <div className="glass-card overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-primary/5">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-primary/30 uppercase tracking-widest">Name</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-primary/30 uppercase tracking-widest">Slug</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-primary/30 uppercase tracking-widest">Prompts</th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-primary/30 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-4 text-center text-primary/50 text-sm">
                          No categories found.
                        </td>
                      </tr>
                    ) : (
                      categories.map((c) => (
                        <>
                          <tr
                            key={c._id}
                            className="border-b border-primary/5 hover:bg-primary/2 transition-colors"
                          >
                            <td className="px-6 py-4 text-sm font-medium text-primary/90">
                              {c.icon && <span className="mr-2">{c.icon}</span>}{c.name}
                            </td>
                            <td className="px-6 py-4 text-sm text-primary/50">{c.slug}</td>
                            <td className="px-6 py-4 text-sm text-primary/50">{c.promptCount ?? 0}</td>
                            <td className="px-6 py-4 text-right flex items-center justify-end gap-1">
                              <button
                                onClick={() =>
                                  setEditingCategory(
                                    editingCategory?._id === c._id
                                      ? null
                                      : { _id: c._id, name: c.name, icon: c.icon || '', image: c.image || '' },
                                  )
                                }
                                className="p-1.5 rounded-lg hover:bg-primary/10 text-primary/30 hover:text-primary transition-all"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(c._id)}
                                className="p-1.5 rounded-lg hover:bg-red-500/10 text-primary/30 hover:text-red-400 transition-all"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                          {editingCategory?._id === c._id && (
                            <tr key={`edit-${c._id}`} className="border-b border-primary/5 bg-primary/[0.02]">
                              <td colSpan="4" className="px-6 py-4">
                                <form onSubmit={handleUpdateCategory} className="space-y-3">
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="text-[11px] text-primary/40 uppercase tracking-widest mb-1.5 block">Name</label>
                                      <input
                                        required
                                        value={editingCategory.name}
                                        onChange={(e) => setEditingCategory((prev) => ({ ...prev, name: e.target.value }))}
                                        className="input-minimal text-sm"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[11px] text-primary/40 uppercase tracking-widest mb-1.5 block">Icon (optional)</label>
                                      <input
                                        value={editingCategory.icon}
                                        onChange={(e) => setEditingCategory((prev) => ({ ...prev, icon: e.target.value }))}
                                        className="input-minimal text-sm"
                                        placeholder="emoji"
                                        maxLength={4}
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-[11px] text-primary/40 uppercase tracking-widest mb-1.5 block">Banner Image URL</label>
                                    <input
                                      value={editingCategory.image}
                                      onChange={(e) => setEditingCategory((prev) => ({ ...prev, image: e.target.value }))}
                                      className="input-minimal text-sm"
                                      placeholder="https://res.cloudinary.com/..."
                                    />
                                  </div>
                                  <div className="flex gap-2 justify-end">
                                    <button
                                      type="button"
                                      onClick={() => setEditingCategory(null)}
                                      className="text-xs text-primary/50 hover:text-primary px-4 py-2 transition-colors"
                                    >
                                      Cancel
                                    </button>
                                    <button type="submit" className="btn-primary py-2 px-5 text-sm">
                                      Save Changes
                                    </button>
                                  </div>
                                </form>
                              </td>
                            </tr>
                          )}
                        </>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {active === 'aimodels' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-display font-bold text-primary">
                    AI Models Management
                  </h2>
                  <p className="text-primary/50 text-sm">Create and organize AI models</p>
                </div>
              </div>

              <div className="glass-card p-6 mb-8">
                <form onSubmit={handleCreateAIModel} className="flex items-end gap-4">
                  <div className="flex-1">
                    <label className="text-xs text-primary/50 uppercase tracking-widest mb-2 block">
                      New AI Model Name
                    </label>
                    <input
                      required
                      value={newAIModelName}
                      onChange={(e) => setNewAIModelName(e.target.value)}
                      className="input-minimal"
                      placeholder="e.g. Midjourney v6.1"
                    />
                  </div>
                  <button type="submit" className="btn-primary py-2.5 px-6 whitespace-nowrap">
                    Add Model
                  </button>
                </form>
              </div>

              <div className="glass-card overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-primary/5">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-primary/30 uppercase tracking-widest">
                        Name
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-primary/30 uppercase tracking-widest">
                        Slug
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-primary/30 uppercase tracking-widest">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {aiModels.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="px-6 py-4 text-center text-primary/50 text-sm">
                          No models found.
                        </td>
                      </tr>
                    ) : (
                      aiModels.map((m) => (
                        <tr
                          key={m._id}
                          className="border-b border-primary/5 hover:bg-primary/2 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-primary/90">
                            {m.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-primary/50">{m.slug}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDeleteAIModel(m._id)}
                              className="p-1.5 rounded-lg hover:bg-red-500/10 text-primary/30 hover:text-red-400 transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {active === 'users' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-display font-bold text-primary">User Management</h2>
                  <p className="text-primary/50 text-sm">Promote or revoke admin roles</p>
                </div>
              </div>

              <div className="glass-card overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-primary/5">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-primary/30 uppercase tracking-widest">
                        User
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-primary/30 uppercase tracking-widest">
                        Email
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-primary/30 uppercase tracking-widest">
                        Role
                      </th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-primary/30 uppercase tracking-widest">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-4 text-center text-primary/50 text-sm">
                          Loading users...
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-4 text-center text-primary/50 text-sm">
                          No users found.
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr
                          key={u.id}
                          className="border-b border-primary/5 hover:bg-primary/2 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-primary/90">
                            {u.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-primary/50">{u.email}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`badge-minimal ${u.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {u.role === 'user' ? (
                              <button
                                onClick={() => handleRoleChange(u.id, 'admin')}
                                className="text-xs text-purple-400 hover:text-purple-300 font-medium transition-colors"
                              >
                                Make Admin
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRoleChange(u.id, 'user')}
                                disabled={u.id === user?.id}
                                className="text-xs text-primary/40 hover:text-red-400 font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                Revoke
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {active !== 'dashboard' &&
            active !== 'upload' &&
            active !== 'categories' &&
            active !== 'users' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-32 text-center"
              >
                <div className="text-6xl mb-4">🚧</div>
                <h3 className="font-display font-bold text-2xl text-primary mb-2">
                  {SIDEBAR_ITEMS.find((i) => i.id === active)?.label}
                </h3>
                <p className="text-primary/40">This admin section is coming soon.</p>
              </motion.div>
            )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
