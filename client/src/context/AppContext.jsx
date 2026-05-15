import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../services/authService';

const AppContext = createContext();

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

export const AppProvider = ({ children }) => {
  const [savedPrompts, setSavedPrompts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('savedPrompts') || '[]'); } catch { return []; }
  });
  const [likedPrompts, setLikedPrompts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('likedPrompts') || '[]'); } catch { return []; }
  });
  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    try { return JSON.parse(localStorage.getItem('recentlyViewed') || '[]'); } catch { return []; }
  });
  const [copiedCount, setCopiedCount] = useState(() => {
    try { return parseInt(localStorage.getItem('copiedCount') || '0'); } catch { return 0; }
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [pendingCopyPrompt, setPendingCopyPrompt] = useState(null);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('recentSearches') || '[]');
    } catch {
      return [];
    }
  });

  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token && !user) {
        try {
          const { user: fetchedUser } = await getMe();
          setUser(fetchedUser);
          localStorage.setItem('user', JSON.stringify(fetchedUser));
          setIsLoggedIn(true);
        } catch (error) {
          console.error('Auth restoration failed', error);
          logout();
        }
      } else if (!token) {
        setIsLoggedIn(false);
      }
      setIsAuthLoading(false);
    };
    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  useEffect(() => {
    localStorage.setItem('savedPrompts', JSON.stringify(savedPrompts));
  }, [savedPrompts]);

  useEffect(() => {
    localStorage.setItem('likedPrompts', JSON.stringify(likedPrompts));
  }, [likedPrompts]);

  useEffect(() => {
    localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  useEffect(() => {
    localStorage.setItem('copiedCount', copiedCount.toString());
  }, [copiedCount]);

  useEffect(() => {
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
  }, [recentSearches]);

  const addRecentSearch = (q) => {
    const t = q.trim();
    if (!t) return;
    setRecentSearches((prev) => [t, ...prev.filter((x) => x !== t)].slice(0, 8));
  };

  const toggleSave = (promptId) => {
    setSavedPrompts(prev =>
      prev.includes(promptId) ? prev.filter(id => id !== promptId) : [...prev, promptId]
    );
  };

  const toggleLike = (promptId) => {
    setLikedPrompts(prev =>
      prev.includes(promptId) ? prev.filter(id => id !== promptId) : [...prev, promptId]
    );
  };

  const addRecentlyViewed = (promptId) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(id => id !== promptId);
      return [promptId, ...filtered].slice(0, 20);
    });
  };

  const handleCopyPrompt = (prompt) => {
    // Free copies allowed = 3, then show reward modal
    if (copiedCount >= 3 && !isLoggedIn) {
      setPendingCopyPrompt(prompt);
      setShowRewardModal(true);
      return;
    }
    copyToClipboard(prompt.prompt);
    setCopiedCount(prev => prev + 1);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).catch(() => {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    });
  };

  const handleRemixPrompt = (prompt) => {
    const text = `// Remix · ${prompt.title}\n${prompt.prompt}\n\n// Direction: refine lighting, composition, and palette while preserving intent.`;
    if (copiedCount >= 3 && !isLoggedIn) {
      setPendingCopyPrompt({ ...prompt, prompt: text });
      setShowRewardModal(true);
      return;
    }
    copyToClipboard(text);
    setCopiedCount((prev) => prev + 1);
  };

  const unlockCopy = () => {
    if (pendingCopyPrompt) {
      copyToClipboard(pendingCopyPrompt.prompt);
      setPendingCopyPrompt(null);
    }
    setShowRewardModal(false);
    setCopiedCount(0);
  };

  const login = (userData, token) => {
    setIsLoggedIn(true);
    setUser(userData);
    if (token) localStorage.setItem('token', token);
    if (userData) localStorage.setItem('user', JSON.stringify(userData));
    setCopiedCount(0);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AppContext.Provider value={{
      savedPrompts, likedPrompts, recentlyViewed,
      copiedCount, isLoggedIn, isAuthLoading, user, searchQuery,
      selectedCategory, showRewardModal, pendingCopyPrompt,
      theme, toggleTheme,
      commandPaletteOpen, setCommandPaletteOpen,
      recentSearches, addRecentSearch,
      toggleSave, toggleLike, addRecentlyViewed,
      handleCopyPrompt, handleRemixPrompt, unlockCopy, login, logout,
      setSearchQuery, setSelectedCategory,
      setShowRewardModal, setPendingCopyPrompt,
    }}>
      {children}
    </AppContext.Provider>
  );
};
