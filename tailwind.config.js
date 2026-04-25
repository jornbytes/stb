/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0f7f0',
          100: '#dceedd',
          200: '#b9dcba',
          300: '#8dc48f',
          400: '#5fa663',
          500: '#3d8b42',
          600: '#2d6e32',
          700: '#1e5226',
          800: '#16401d',
          900: '#0f2e14',
          950: '#071a0b',
        },
        khaki: {
          50: '#faf8f0',
          100: '#f2edda',
          200: '#e4d9b0',
          300: '#d4c07e',
          400: '#c5a855',
          500: '#b8923a',
          600: '#9e762e',
          700: '#7f5c26',
          800: '#674a22',
          900: '#553d1f',
        },
        scout: {
          green: '#1e5226',
          darkgreen: '#0f2e14',
          gold: '#b8923a',
          tan: '#d4c07e',
          cream: '#faf8f0',
          red: '#C0272D',
          darkred: '#8b1a1e',
          lightred: '#e63b41',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Oswald', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
