import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Disc } from 'lucide-react';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import RewardModal from './components/RewardModal';
import SearchCommandPalette from './components/SearchCommandPalette';
import HomePage from './pages/HomePage';
import CategoriesPage from './pages/CategoriesPage';
import PromptDetailPage from './pages/PromptDetailPage';
import VideoPromptsPage from './pages/VideoPromptsPage';
import SearchPage from './pages/SearchPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import EditPromptPage from './pages/EditPromptPage';
import SavedPromptsPage from './pages/SavedPromptsPage';
import TrendingPage from './pages/TrendingPage';
import AdminRoute from './components/AdminRoute';

// Page transition wrapper
const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 6 }}
    transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

// Footer
const Footer = () => (
  <footer className="bg-dark-50 border-t border-primary/[0.03] py-20 lg:py-28 relative overflow-hidden">
    <div className="absolute inset-0 bg-ambient-light opacity-50 pointer-events-none" />

    <div className="section-contain relative z-10">
      <div className="grid grid-cols-2 md:grid-cols-12 gap-8 lg:gap-12 mb-16">
        <div className="col-span-2 md:col-span-4">
          <div className="flex items-center gap-2 mb-4 opacity-80">
            <Disc size={20} className="text-primary stroke-[1.5]" />
            <span className="font-display font-medium text-[16px] tracking-tight text-primary">
              Vault
            </span>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xs font-light">
            The ultimate reference dataset for modern visual engineering and AI generated imagery.
          </p>
        </div>
        <div className="hidden md:block md:col-span-2" /> {/* Spacing column */}
        {[
          { title: 'Product', links: ['Browse', 'Categories', 'Video API', 'Featured'] },
          { title: 'Infrastructure', links: ['Veo 2', 'Midjourney', 'Runway Gen-3', 'Sora'] },
          { title: 'Legal', links: ['Terms', 'Privacy', 'License'] },
        ].map((col) => (
          <div key={col.title} className="col-span-1 md:col-span-2">
            <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">
              {col.title}
            </h4>
            <ul className="space-y-2.5">
              {col.links.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-gray-500 hover:text-primary text-[13px] transition-colors font-light"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-primary/[0.03]">
        <p className="text-gray-600 text-[11px] tracking-wide">© 2026 VAULT SYSTEMS INC.</p>
        <div className="flex items-center gap-6">
          <a
            href="#"
            className="text-gray-600 hover:text-gray-400 text-[11px] transition-colors uppercase tracking-widest"
          >
            Status
          </a>
          <a
            href="#"
            className="text-gray-600 hover:text-gray-400 text-[11px] transition-colors uppercase tracking-widest"
          >
            Github
          </a>
        </div>
      </div>
    </div>
  </footer>
);

// Routes wrapper that conditionally renders navbar/footer
const AppRoutes = () => {
  const location = useLocation();
  const hideNavFooter = ['/admin'].some((p) => location.pathname.startsWith(p));
  const hideNavFooterAuth = ['/login', '/register'].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col">
      {!hideNavFooter && !hideNavFooterAuth && <Navbar />}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <PageTransition>
                  <HomePage />
                </PageTransition>
              }
            />
            <Route
              path="/categories"
              element={
                <PageTransition>
                  <CategoriesPage />
                </PageTransition>
              }
            />
            <Route
              path="/categories/:id"
              element={
                <PageTransition>
                  <CategoriesPage />
                </PageTransition>
              }
            />
            <Route
              path="/prompt/:id"
              element={
                <PageTransition>
                  <PromptDetailPage />
                </PageTransition>
              }
            />
            <Route
              path="/videos"
              element={
                <PageTransition>
                  <VideoPromptsPage />
                </PageTransition>
              }
            />
            <Route
              path="/search"
              element={
                <PageTransition>
                  <SearchPage />
                </PageTransition>
              }
            />
            <Route
              path="/trending"
              element={
                <PageTransition>
                  <TrendingPage />
                </PageTransition>
              }
            />
            <Route
              path="/saved"
              element={
                <PageTransition>
                  <SavedPromptsPage />
                </PageTransition>
              }
            />
            <Route
              path="/profile"
              element={
                <PageTransition>
                  <SavedPromptsPage />
                </PageTransition>
              }
            />
            <Route
              path="/login"
              element={
                <PageTransition>
                  <LoginPage />
                </PageTransition>
              }
            />
            <Route
              path="/register"
              element={
                <PageTransition>
                  <RegisterPage />
                </PageTransition>
              }
            />
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/prompt/:id/edit" element={<EditPromptPage />} />
              <Route path="/admin/*" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </AnimatePresence>
      </main>
      {!hideNavFooter && !hideNavFooterAuth && <Footer />}
      <RewardModal />
      <SearchCommandPalette />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </Router>
  );
}

export default App;
