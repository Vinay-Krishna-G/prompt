import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  TrendingUp,
  Video,
  Menu,
  X,
  ChevronDown,
  User,
  BookmarkCheck,
  LogOut,
  Shield,
  Disc,
  Sun,
  Moon,
  Command,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getCategories } from '../services/categoryService';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [navCategories, setNavCategories] = useState([]);
  const location = useLocation();
  const { isLoggedIn, user, logout, theme, toggleTheme, setCommandPaletteOpen } = useApp();
  const catRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    getCategories()
      .then((res) => setNavCategories(res.categories || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (catRef.current && !catRef.current.contains(e.target)) setCategoriesOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setCategoriesOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const links = [
    { to: '/trending', label: 'Trending', icon: <TrendingUp size={14} /> },
    { to: '/videos', label: 'Video', icon: <Video size={14} /> },
  ];

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 h-14 flex items-center transition-all duration-700 ease-premium ${
        isScrolled ? 'nav-blur' : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="w-full max-w-7xl mx-auto px-6 flex items-center justify-between gap-8">
        {/* Minimal Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 opacity-90 hover:opacity-100 transition-opacity"
        >
          <Disc size={18} className="stroke-[1.5]" style={{ color: 'rgb(var(--text-primary))' }} />
          <span
            className="font-display font-semibold tracking-tight text-[15px]"
            style={{ color: 'rgb(var(--text-primary))' }}
          >
            Vault
          </span>
        </Link>

        {/* Desktop Center Nav */}
        <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {/* Elegant Dropdown Toggle */}
          <div ref={catRef} className="relative">
            <button
              onClick={() => setCategoriesOpen(!categoriesOpen)}
              className="btn-ghost-minimal gap-1 text-[13px]"
            >
              Explore
              <ChevronDown
                size={12}
                className={`opacity-50 transition-transform duration-300 ${categoriesOpen ? 'rotate-180' : ''}`}
              />
            </button>

            <AnimatePresence>
              {categoriesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 border border-primary/[0.05] rounded-xl p-1 shadow-2xl backdrop-blur-xl"
                  style={{ backgroundColor: 'rgb(var(--bg-elevated))' }}
                >
                  <div className="grid gap-0.5">
                    {navCategories.slice(0, 8).map((c) => (
                      <Link
                        key={c._id}
                        to={`/categories/${c.slug}`}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] hover:bg-primary/[0.03] transition-colors"
                        style={{ color: 'rgba(var(--text-primary) / 0.7)' }}
                      >
                        {c.icon && <span className="opacity-70 text-[14px]">{c.icon}</span>}
                        {c.name}
                      </Link>
                    ))}
                    {navCategories.length === 0 && (
                      <span className="px-3 py-2 text-[13px] text-primary/40">Loading...</span>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {links.map((link) => (
            <Link key={link.to} to={link.to} className="btn-ghost-minimal gap-1.5 text-[13px]">
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Right Search + Auth */}
        <div className="hidden md:flex items-center gap-3">
          <button
            type="button"
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center gap-2 rounded-full border pl-3 pr-2.5 py-1.5 text-[13px] transition-all duration-500 ease-premium hover:bg-[rgba(var(--text-primary)/0.05)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgba(var(--accent),0.45)]"
            style={{
              backgroundColor: 'rgba(var(--text-primary) / 0.03)',
              borderColor: 'rgba(var(--border-color) / 0.08)',
              color: 'rgba(var(--text-primary) / 0.65)',
            }}
          >
            <Search size={14} className="opacity-50" />
            <span className="hidden lg:inline opacity-80">Search</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-sans px-1.5 py-0.5 rounded-md opacity-35 border border-[rgba(var(--border-color)/0.12)]">
              <Command size={10} />K
            </kbd>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-background/[0.03] dark:hover:bg-primary/[0.05]"
            aria-label="Toggle Theme"
            style={{ color: 'rgba(var(--text-primary) / 0.7)' }}
          >
            {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          <div className="h-4 w-px bg-gray-500/20 mx-1" />

          {isLoggedIn ? (
            <div ref={userRef} className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                style={{
                  backgroundColor: 'rgba(var(--text-primary) / 0.05)',
                  border: '1px solid rgba(var(--border-color) / 0.1)',
                }}
              >
                <span
                  className="text-[11px] font-bold"
                  style={{ color: 'rgb(var(--text-primary))' }}
                >
                  {user?.avatar || 'U'}
                </span>
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute right-0 top-full mt-2 w-48 border border-primary/[0.05] rounded-xl p-1 shadow-2xl backdrop-blur-md"
                    style={{ backgroundColor: 'rgb(var(--bg-elevated))' }}
                  >
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-3 py-2 text-[13px] text-muted hover:text-primary hover:bg-primary/[0.03] rounded-lg"
                    >
                      <User size={13} /> Account
                    </Link>
                    <Link
                      to="/saved"
                      className="flex items-center gap-2 px-3 py-2 text-[13px] text-muted hover:text-primary hover:bg-primary/[0.03] rounded-lg"
                    >
                      <BookmarkCheck size={13} /> Library
                    </Link>
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 px-3 py-2 text-[13px] text-muted hover:text-primary hover:bg-primary/[0.03] rounded-lg"
                    >
                      <Shield size={13} /> Dashboard
                    </Link>
                    <div className="h-px bg-primary/[0.04] my-1" />
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-red-400 hover:bg-red-500/[0.05] rounded-lg"
                    >
                      <LogOut size={13} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-[13px] text-muted hover:text-primary px-3 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 rounded-full bg-primary text-background text-[12px] font-semibold hover:opacity-90 transition-all shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-1 text-gray-400 hover:text-primary"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Expanded Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full inset-x-0 bg-background border-b border-primary/[0.03] p-6 md:hidden flex flex-col gap-4 shadow-2xl backdrop-blur-3xl"
          >
            <button
              type="button"
              onClick={() => {
                setCommandPaletteOpen(true);
                setMenuOpen(false);
              }}
              className="flex items-center gap-3 text-lg font-medium text-primary py-2 border border-primary/[0.08] rounded-xl px-4 justify-center transition-colors hover:bg-primary/[0.04]"
            >
              <Search size={18} /> Search vault
            </button>
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-lg font-medium text-primary flex items-center gap-3"
              >
                {l.icon} {l.label}
              </Link>
            ))}
            <div className="h-px bg-primary/[0.03] my-2" />
            {!isLoggedIn ? (
              <>
                <Link to="/login" className="text-muted">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="w-full text-center py-3 bg-primary text-background font-medium rounded-xl"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <button onClick={logout} className="text-left text-red-400">
                Log Out
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
