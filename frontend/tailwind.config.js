/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        dark: { 950: '#030305', 900: '#050508', 800: '#0a0a12', 700: '#0f0f1a', 600: '#141420', 500: '#1a1a2e', 400: '#1e1e35' },
        brand: { purple: '#a855f7', blue: '#3b82f6', cyan: '#06b6d4', green: '#10b981', pink: '#ec4899', amber: '#f59e0b', orange: '#f97316', red: '#ef4444' },
      },
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        glowPulse: { '0%': { boxShadow: '0 0 5px rgba(168,85,247,0.3)' }, '100%': { boxShadow: '0 0 25px rgba(168,85,247,0.7), 0 0 50px rgba(168,85,247,0.2)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        slideUp: { '0%': { opacity: 0, transform: 'translateY(12px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
      },
      boxShadow: {
        'glow-purple': '0 0 20px rgba(168,85,247,0.35)',
        'glow-blue': '0 0 20px rgba(59,130,246,0.35)',
        'glow-green': '0 0 20px rgba(16,185,129,0.35)',
        'glow-red': '0 0 20px rgba(239,68,68,0.35)',
        'glass': '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        'card': '0 4px 24px rgba(0,0,0,0.3)',
      },
      backdropBlur: { xs: '2px', sm: '4px' },
    },
  },
  plugins: [],
}
