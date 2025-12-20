/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 기존 프로젝트 색상과 호환
        'safe': {
          DEFAULT: '#059669',
          light: '#34d399',
          dark: '#047857',
        },
        'warning': {
          DEFAULT: '#d97706',
          light: '#fbbf24',
          dark: '#b45309',
        },
        'danger': {
          DEFAULT: '#dc2626',
          light: '#f87171',
          dark: '#b91c1c',
        },
        'primary': {
          DEFAULT: '#2563eb',
          light: '#60a5fa',
          dark: '#1d4ed8',
        },
        'secondary': {
          DEFAULT: '#7c3aed',
          light: '#a78bfa',
          dark: '#6d28d9',
        },
        // 아이템 희귀도 색상
        'common': '#64748b',
        'rare': '#2563eb',
        'epic': '#9333ea',
        'legendary': '#d97706',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out',
        'fade-in-fast': 'fadeIn 0.3s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.3', boxShadow: '0 0 10px rgba(99, 102, 241, 0.2)' },
          '50%': { opacity: '0.5', boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

