import { createContext, useContext, useState, useEffect } from 'react';

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
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

  const login = (userData) => {
    setIsLoggedIn(true);
    setUser(userData || { name: 'Demo User', email: 'demo@promptvault.ai', avatar: 'DU' });
    setCopiedCount(0);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <AppContext.Provider value={{
      savedPrompts, likedPrompts, recentlyViewed,
      copiedCount, isLoggedIn, user, searchQuery,
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
