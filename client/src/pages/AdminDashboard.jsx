import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Upload, List, Tag, BarChart3, Users, Settings,
  TrendingUp, Copy, Eye, Zap, ArrowUpRight, MoreVertical, ChevronRight, Menu, X
} from 'lucide-react';
import { PROMPTS, ADMIN_STATS } from '../data/mockData';

const SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'upload', label: 'Upload Prompt', icon: Upload },
  { id: 'prompts', label: 'Manage Prompts', icon: List },
  { id: 'categories', label: 'Categories', icon: Tag },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const StatCard = ({ label, value, change, icon, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="glass-card p-6"
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <span className="text-xs text-green-400 font-semibold flex items-center gap-0.5">
        <ArrowUpRight size={12} />
        {change}%
      </span>
    </div>
    <div className="font-display font-bold text-2xl text-white mb-1">{value}</div>
    <div className="text-white/40 text-sm">{label}</div>
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
  const [active, setActive] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const weeklyData = [4200, 5800, 4900, 7200, 8100, 6700, 9800];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

  const stats = [
    { label: 'Total Prompts', value: '24,891', change: 12.3, icon: <Zap size={18} className="text-white" />, color: 'bg-primary-500/20' },
    { label: 'Total Users', value: '128,430', change: 23.1, icon: <Users size={18} className="text-white" />, color: 'bg-secondary-500/20' },
    { label: 'Total Copies', value: '982,341', change: 34.2, icon: <Copy size={18} className="text-white" />, color: 'bg-accent-500/20' },
    { label: 'Monthly Visits', value: '2.89M', change: 18.7, icon: <Eye size={18} className="text-white" />, color: 'bg-green-500/20' },
  ];

  const Sidebar = () => (
    <div className="h-full flex flex-col py-6">
      <div className="px-4 mb-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #9333ea, #06b6d4)' }}>
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-sm text-white">PromptVault</div>
            <div className="text-xs text-white/30">Admin Panel</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => { setActive(item.id); setSidebarOpen(false); }}
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

  return (
    <div className="min-h-screen flex" style={{ background: '#080810' }}>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-60 flex-shrink-0 border-r border-white/5" style={{ background: 'rgba(10,10,20,0.8)' }}>
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            className="fixed left-0 top-0 bottom-0 w-60 z-50 lg:hidden border-r border-white/5"
            style={{ background: '#0a0a14' }}
          >
            <div className="absolute top-4 right-4">
              <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-xl hover:bg-white/5 text-white/40">
                <X size={18} />
              </button>
            </div>
            <Sidebar />
          </motion.aside>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-30 border-b border-white/5 px-6 py-4 flex items-center justify-between"
          style={{ background: 'rgba(8,8,16,0.95)', backdropFilter: 'blur(20px)' }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-white/5 text-white/60">
              <Menu size={20} />
            </button>
            <div>
              <h1 className="font-display font-bold text-lg text-white capitalize">
                {SIDEBAR_ITEMS.find(i => i.id === active)?.label}
              </h1>
              <p className="text-xs text-white/30">PromptVault Admin</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-green-400 font-semibold px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
              ● Live
            </span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #9333ea, #06b6d4)' }}>A</div>
          </div>
        </div>

        <div className="p-6 max-w-6xl">
          {active === 'dashboard' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((stat, i) => (
                  <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                    <StatCard {...stat} />
                  </motion.div>
                ))}
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                {/* Traffic chart */}
                <div className="lg:col-span-2 glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-white">Weekly Traffic</h3>
                    <span className="badge-green badge text-xs" style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }}>+34.2%</span>
                  </div>
                  <MiniBarChart data={weeklyData} />
                  <div className="flex justify-between mt-2">
                    {months.map(m => <span key={m} className="text-xs text-white/20">{m}</span>)}
                  </div>
                </div>

                {/* Quick stats */}
                <div className="glass-card p-6">
                  <h3 className="font-semibold text-white mb-4">Today</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'New Prompts', value: '127', color: 'text-primary-400' },
                      { label: 'New Users', value: '843', color: 'text-secondary-400' },
                      { label: 'Copies Made', value: '3,241', color: 'text-accent-400' },
                      { label: 'Revenue Est.', value: '$1,840', color: 'text-yellow-400' },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span className="text-white/50 text-sm">{item.label}</span>
                        <span className={`font-bold text-sm ${item.color}`}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent prompts table */}
              <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-white/5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white">Recent Uploads</h3>
                    <button className="text-xs text-primary-400 hover:text-primary-300 transition-colors">View All</button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5">
                        {['Prompt', 'Category', 'Type', 'Copies', 'Likes', 'Date', ''].map(h => (
                          <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-white/30 uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {PROMPTS.slice(0, 6).map((prompt) => (
                        <tr key={prompt.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={prompt.image} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                              <span className="text-sm text-white/80 font-medium line-clamp-1 max-w-[160px]">{prompt.title}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="badge-purple badge text-xs">{prompt.categoryName}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`badge text-xs ${prompt.type === 'video' ? 'badge-pink' : 'badge-cyan'}`}>
                              {prompt.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-white/60">{prompt.copies.toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-white/60">{prompt.likes.toLocaleString()}</td>
                          <td className="px-6 py-4 text-xs text-white/30">{prompt.createdAt}</td>
                          <td className="px-6 py-4">
                            <button className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white transition-all">
                              <MoreVertical size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {active === 'upload' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl">
              <p className="text-white/50 mb-8">Upload a new prompt to the platform</p>
              <div className="space-y-6">
                {/* Drag drop zone */}
                <div className="border-2 border-dashed border-white/15 rounded-2xl p-12 text-center hover:border-primary-500/40 transition-colors cursor-pointer group">
                  <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-500/20 transition-colors">
                    <Upload size={22} className="text-primary-400" />
                  </div>
                  <p className="font-semibold text-white text-sm mb-1">Drag & drop preview image or video</p>
                  <p className="text-xs text-white/30">PNG, JPG, MP4 up to 100MB</p>
                </div>

                {/* Form fields */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-widest mb-2 block">Prompt Title</label>
                    <input className="input-field" placeholder="e.g. Cyberpunk Neon City at Night" />
                  </div>
                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-widest mb-2 block">Prompt Text</label>
                    <textarea className="input-field min-h-[120px] resize-y font-mono text-sm" placeholder="Enter the full prompt text..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-white/50 uppercase tracking-widest mb-2 block">Category</label>
                      <select className="input-field">
                        <option>Cinematic</option>
                        <option>Anime</option>
                        <option>Fashion</option>
                        <option>Gaming</option>
                        <option>AI Videos</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-white/50 uppercase tracking-widest mb-2 block">Type</label>
                      <select className="input-field">
                        <option>Image Prompt</option>
                        <option>Video Prompt</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-widest mb-2 block">Tags (comma separated)</label>
                    <input className="input-field" placeholder="cyberpunk, neon, cinematic, rain" />
                  </div>
                  <div>
                    <label className="text-xs text-white/50 uppercase tracking-widest mb-2 block">AI Model</label>
                    <select className="input-field">
                      <option>Midjourney v6.1</option>
                      <option>DALL-E 3</option>
                      <option>Stable Diffusion XL</option>
                      <option>Veo 2</option>
                      <option>Kling AI v1.6</option>
                      <option>Runway Gen-3</option>
                    </select>
                  </div>
                  <button className="btn-primary w-full justify-center py-4 text-base">
                    <Upload size={18} /> Publish Prompt
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {active !== 'dashboard' && active !== 'upload' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-32 text-center">
              <div className="text-6xl mb-4">🚧</div>
              <h3 className="font-display font-bold text-2xl text-white mb-2">{SIDEBAR_ITEMS.find(i => i.id === active)?.label}</h3>
              <p className="text-white/40">This admin section is coming soon.</p>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
