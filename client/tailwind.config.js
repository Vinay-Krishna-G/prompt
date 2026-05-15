function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${variableName}), ${opacityValue})`;
    }
    return `rgb(var(${variableName}))`;
  };
}

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: withOpacity('--bg-primary'),
          50: withOpacity('--bg-primary'),
          100: withOpacity('--bg-surface'),
          200: withOpacity('--bg-elevated'),
          300: withOpacity('--text-primary'),
          400: 'rgba(var(--text-primary) / 0.1)',
          500: 'rgba(var(--text-primary) / 0.2)',
        },
        background: withOpacity('--bg-primary'),
        surface: withOpacity('--bg-surface'),
        elevated: withOpacity('--bg-elevated'),
        primary: withOpacity('--text-primary'),
        muted: withOpacity('--text-muted'),
        subtle: 'rgba(var(--border-color) / 0.1)',
      },
      fontFamily: {
        sans: ['Geist', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Geist', 'Outfit', 'SF Pro Display', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Geist Mono', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        tightest: '-.05em',
        tighter: '-.03em',
        tight: '-.015em',
      },
      backgroundImage: {
        'mesh-gradient': 'radial-gradient(at 40% 20%, rgba(var(--accent), 0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(var(--accent), 0.1) 0px, transparent 50%)',
        'subtle-glow': 'radial-gradient(circle at 50% -20%, rgba(var(--accent), 0.15), transparent 70%)',
        'ambient-light': 'linear-gradient(to bottom, rgba(var(--text-primary), 0.02), transparent)',
      },
      boxShadow: {
        'soft-elevation': '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)',
        'premium-hover': '0 18px 36px -14px rgba(0, 0, 0, 0.4)',
        'inner-light': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
      },
      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      animation: {
        'slow-ambient': 'ambientPulse 12s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards',
      },
      keyframes: {
        ambientPulse: {
          '0%, 100%': { opacity: 0.4 },
          '50%': { opacity: 0.7 },
        },
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
