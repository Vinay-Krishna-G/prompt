import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Disc, Mail, Lock, User, ArrowRight, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EASE_PREMIUM } from '../lib/motion';

const PERKS = [
  'Unlimited prompt copies',
  'Save your favorite prompts',
  'Access all 24,000+ prompts',
  'Early access to new features',
  'Creator community access',
];

const AmbientSide = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    <img
      src="https://picsum.photos/seed/vault-register/1400/1100"
      alt=""
      className="w-full h-full object-cover saturate-[0.35] brightness-[0.28] contrast-[1.05]"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-[#050816]/55 to-transparent" />
    <div className="absolute inset-0 bg-gradient-to-r from-[#050816]/80 via-transparent to-[#050816]/40" />
    <div
      className="absolute inset-0 opacity-[0.12] mix-blend-overlay"
      style={{
        backgroundImage: `url("https://www.transparenttextures.com/patterns/stardust.png")`,
      }}
    />
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[420px] opacity-25 bg-mesh-gradient blur-3xl mix-blend-screen" />
  </div>
);

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useApp();
  const navigate = useNavigate();

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    login({ name: form.name, email: form.email, avatar: form.name[0].toUpperCase() });
    setLoading(false);
    navigate('/');
  };

  const handleGoogle = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    login({ name: 'Google User', email: 'user@gmail.com', avatar: 'G' });
    setLoading(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex bg-[#050816] text-white">
      <div className="hidden lg:flex lg:w-7/12 relative overflow-hidden items-end p-16">
        <AmbientSide />
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.12, ease: EASE_PREMIUM }}
          className="relative z-10 max-w-lg"
        >
          <Disc size={32} className="text-white/25 mb-6 stroke-[1]" />
          <h2 className="heading-cinematic text-3xl font-semibold text-white leading-tight mb-4 text-balance tracking-[-0.02em]">
            The architecture for <span className="text-gray-500">your creative future.</span>
          </h2>
          <p className="text-gray-500 font-light text-base leading-relaxed mb-10">
            Join a quiet, premium library of prompts tuned for cinematic output across leading models.
          </p>
          <ul className="space-y-3">
            {PERKS.map((perk, i) => (
              <motion.li
                key={perk}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE_PREMIUM, delay: 0.2 + i * 0.04 }}
                className="flex items-center gap-3 text-sm text-gray-400"
              >
                <span className="w-6 h-6 rounded-full border border-white/[0.1] flex items-center justify-center shrink-0 bg-white/[0.03]">
                  <Check size={12} className="text-white/70" />
                </span>
                {perk}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>

      <div className="w-full lg:w-5/12 flex flex-col justify-center px-8 sm:px-16 lg:px-20 xl:px-28 relative min-h-screen">
        <div className="absolute inset-0 bg-subtle-glow opacity-40 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[28rem] h-[28rem] bg-mesh-gradient opacity-[0.12] blur-3xl pointer-events-none" />

        <div className="max-w-sm w-full mx-auto relative z-10 py-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.68, ease: EASE_PREMIUM }}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 mb-14 opacity-85 hover:opacity-100 transition-opacity duration-300"
            >
              <Disc size={20} className="text-white stroke-[1.5]" />
              <span className="font-display font-medium text-[15px] text-white tracking-tight">Vault</span>
            </Link>

            <h1 className="heading-cinematic text-2xl font-semibold mb-2 text-white tracking-[-0.02em]">Create account</h1>
            <p className="text-gray-500 text-sm mb-10">Start with the same calm, cinematic workspace as the vault.</p>

            <button
              type="button"
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/85 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-500 ease-premium mb-6 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/25"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>

            <div className="relative flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="text-[11px] text-gray-600 uppercase tracking-widest">or email</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-[11px] text-gray-500 uppercase tracking-widest mb-2 block font-medium">
                  Full name
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    required
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-[14px] text-white placeholder-gray-600 outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all duration-300"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-gray-500 uppercase tracking-widest mb-2 block font-medium">
                  Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-[14px] text-white placeholder-gray-600 outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all duration-300"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-gray-500 uppercase tracking-widest mb-2 block font-medium">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input
                    name="password"
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min. 8 characters"
                    required
                    minLength={8}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-10 pr-11 py-3 text-[14px] text-white placeholder-gray-600 outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-gray-600 leading-relaxed">
                By signing up you agree to our{' '}
                <a href="#" className="text-gray-400 hover:text-gray-300 underline-offset-4 hover:underline transition-colors">
                  Terms
                </a>{' '}
                and{' '}
                <a href="#" className="text-gray-400 hover:text-gray-300 underline-offset-4 hover:underline transition-colors">
                  Privacy Policy
                </a>
                .
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-white text-black font-medium text-sm rounded-xl flex items-center justify-center gap-2 shadow-soft-elevation hover:bg-gray-100 transition-all duration-500 ease-premium disabled:opacity-50 mt-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/30"
              >
                {loading ? (
                  <Disc className="animate-spin" size={16} aria-label="Loading" />
                ) : (
                  <>
                    Create account <ArrowRight size={15} className="opacity-45" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-[13px] text-gray-600 mt-10">
              Already have an account?{' '}
              <Link to="/login" className="text-gray-400 hover:text-white transition-colors underline-offset-4 hover:underline">
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
