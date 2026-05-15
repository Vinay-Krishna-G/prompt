import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Disc, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { loginUser } from '../services/authService';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useApp();
  const navigate = useNavigate();

  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { user, token } = await loginUser({ email, password });
      login(user, token);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* LEFT: The Cinematic Atmosphere */}
      <div className="hidden lg:flex lg:w-7/12 relative overflow-hidden items-end p-16">
        <div className="absolute inset-0 pointer-events-none scale-105 group">
          <img
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop"
            alt="Ambient abstract"
            className="w-full h-full object-cover saturate-0 brightness-[0.3] contrast-125 transition-transform duration-[20s] ease-linear"
            style={{ animation: 'slowAmbientZoom 60s linear infinite' }}
          />
          {/* Atmospheric layering */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background" />
          <div
            className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.08] mix-blend-overlay pointer-events-none"
            aria-hidden
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-lg"
        >
          <Disc size={32} className="text-primary/30 mb-6" />
          <h2 className="text-3xl font-display font-semibold tracking-tight text-primary leading-tight mb-4 text-balance">
            The architecture for <span className="text-gray-500">your creative future.</span>
          </h2>
          <p className="text-gray-500 font-light text-base leading-relaxed">
            Access millions of refined parameters to generate the highest definition visuals in
            existence.
          </p>
        </motion.div>
      </div>

      {/* RIGHT: The Refined Log-in Form */}
      <div className="w-full lg:w-5/12 flex flex-col justify-center px-8 sm:px-16 lg:px-20 xl:px-28 relative">
        {/* Faint Ambient Mesh for Login side */}
        <div className="absolute top-0 right-0 w-[22rem] h-[22rem] bg-mesh-gradient opacity-[0.12] blur-3xl pointer-events-none" />

        <div className="max-w-sm w-full mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 mb-16 opacity-80 hover:opacity-100 transition-opacity"
            >
              <Disc size={20} className="text-primary" />
              <span className="font-display font-medium text-[15px] text-primary tracking-tight">
                Vault
              </span>
            </Link>

            <h1 className="heading-cinematic text-2xl font-semibold mb-2 text-primary">Sign In</h1>
            <p className="text-gray-500 text-sm mb-10">Enter your system credentials.</p>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs mb-6 font-medium"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
                  Identity
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full bg-primary/[0.02] border border-primary/[0.06] rounded-lg px-4 py-3 text-[14px] text-primary placeholder-gray-700 outline-none focus:border-primary/20 focus:bg-primary/[0.04] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase">
                    Passcode
                  </label>
                  <a href="#" className="text-[11px] text-gray-600 hover:text-gray-400">
                    Reset
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-primary/[0.02] border border-primary/[0.06] rounded-lg px-4 py-3 pr-12 text-[14px] text-primary placeholder-gray-700 outline-none focus:border-primary/20 focus:bg-primary/[0.04] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-premium w-full py-3.5 mt-8">
                {loading ? (
                  <Disc className="animate-spin" size={16} />
                ) : (
                  <>
                    Authenticate <ArrowRight size={15} className="opacity-50" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-primary/[0.03] flex flex-col items-center">
              <button className="w-full py-3 rounded-lg border border-primary/[0.06] text-primary/70 text-sm flex items-center justify-center gap-3 hover:bg-primary/[0.03] hover:text-primary transition-colors duration-300">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="opacity-70"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign In with SSO
              </button>

              <p className="mt-8 text-[13px] text-gray-600">
                New engineer?{' '}
                <Link
                  to="/register"
                  className="text-gray-400 hover:text-primary underline-offset-4 hover:underline transition-all"
                >
                  Establish Identity
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @keyframes slowAmbientZoom {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
