/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        carnival: {
          yellow: '#FFD93D',
          coral:  '#FF6B6B',
          sky:    '#4ECDC4',
          purple: '#C77DFF',
          green:  '#95E1A3',
          navy:   '#1A1A2E',
          cream:  '#FFF8F0',
          orange: '#FF9F43',
        },
      },
      fontFamily: {
        sans: ['Noto Sans KR', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pop': 'pop 0.2s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        pop: {
          '0%':   { transform: 'scale(1)' },
          '50%':  { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
}
