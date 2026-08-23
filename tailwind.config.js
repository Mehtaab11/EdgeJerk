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
        brand: {
          blue: '#2962ff',
          blueHover: '#1e4bd8',
          lightBlue: '#3b82f6',
        },
        tv: {
          bgDark: '#0b0e14',
          cardDark: '#131722',
          borderDark: '#1e222d',
          bgLight: '#f0f3fa',
          cardLight: '#ffffff',
          borderLight: '#e0e3eb',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
