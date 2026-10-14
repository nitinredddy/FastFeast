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
    },
  },
  plugins: [],
}