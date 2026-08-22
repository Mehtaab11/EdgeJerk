/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#070a12',
          card: '#0d1322',
          cardHover: '#131b2e',
          border: '#1e293b',
          borderHover: '#334155',
          muted: '#64748b',
        },
        cyber: {
          lime: '#dfff00',
          green: '#10b981',
          red: '#f43f5e',
          cyan: '#06b6d4',
          purple: '#a855f7',
          yellow: '#eab308',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(223, 255, 0, 0.15)',
        glowGreen: '0 0 20px rgba(16, 185, 129, 0.15)',
        glowRed: '0 0 20px rgba(244, 63, 94, 0.15)',
      },
    },
  },
  plugins: [],
};
