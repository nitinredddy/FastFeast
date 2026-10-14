/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Outfit"', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#fff7f2',
          100: '#ffede5',
          200: '#ffd9c9',
          300: '#ffbc9e',
          400: '#ff926b',
          500: '#ff5e36',
          600: '#ea431b',
          700: '#c33110',
          800: '#9d2a12',
          900: '#7f2614',
          950: '#451006',
        },
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02)',
        card: '0 4px 20px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.03)',
        cardHover: '0 12px 30px -4px rgba(15, 23, 42, 0.1), 0 4px 10px -2px rgba(15, 23, 42, 0.04)',
        glow: '0 0 25px -5px rgba(255, 94, 54, 0.35)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.04)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.25s ease-out forwards',
        pulseSubtle: 'pulseSubtle 2.5s infinite ease-in-out',
      },
    },
  },
  plugins: [],
};