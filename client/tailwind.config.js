/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'display': ['"Playfair Display"', 'serif'],
        'body': ['"Crimson Text"', 'serif'],
        'mono': ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        felt: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#166534',
          600: '#14532d',
          700: '#0d3b23',
          800: '#052e16',
          900: '#021a0d',
        },
        gold: {
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        }
      },
      animation: {
        'card-play': 'cardPlay 0.3s ease-out',
        'card-win': 'cardWin 0.5s ease-out',
        'deal': 'deal 0.4s ease-out',
        'thulla': 'thulla 0.8s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        cardPlay: {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '1' },
          '50%': { transform: 'translateY(-20px) scale(1.05)', opacity: '1' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        cardWin: {
          '0%': { transform: 'scale(1)', filter: 'brightness(1)' },
          '50%': { transform: 'scale(1.1)', filter: 'brightness(1.3)' },
          '100%': { transform: 'scale(1)', filter: 'brightness(1)' },
        },
        deal: {
          '0%': { transform: 'translateY(-100px) rotate(-10deg)', opacity: '0' },
          '100%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
        },
        thulla: {
          '0%': { transform: 'scale(1)', filter: 'hue-rotate(0deg)' },
          '25%': { transform: 'scale(1.15) rotate(-3deg)', filter: 'hue-rotate(30deg)' },
          '50%': { transform: 'scale(1.15) rotate(3deg)', filter: 'hue-rotate(-30deg)' },
          '75%': { transform: 'scale(1.1) rotate(-2deg)' },
          '100%': { transform: 'scale(1)', filter: 'hue-rotate(0deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
