/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'genshin-gold': '#F5C842',
        'genshin-blue': '#4A90E2',
        'genshin-purple': '#8B5CF6',
        'genshin-red': '#EF4444',
        'genshin-green': '#10B981',
        'genshin-cyan': '#06B6D4',
        'genshin-orange': '#F59E0B',
        'genshin-pink': '#EC4899',
      },
      fontFamily: {
        'genshin': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
