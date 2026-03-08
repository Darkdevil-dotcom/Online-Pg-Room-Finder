/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        airbnb: {
          pink: '#FF385C',
          'pink-hover': '#E31C5F',
          black: '#222222',
          gray: '#717171',
          'gray-light': '#EBEBEB',
          'gray-bg': '#F7F7F7',
        },
      },
      fontFamily: {
        sans: ['Circular', '-apple-system', 'BlinkMacSystemFont', 'Roboto', 'Helvetica Neue', 'sans-serif'],
      },
      borderRadius: {
        'airbnb': 'var(--radius, 12px)',
        'airbnb-lg': 'var(--radius-lg, 24px)',
      },
      boxShadow: {
        'card': '0 6px 16px rgba(0,0,0,0.12)',
        'card-hover': '0 6px 20px rgba(0,0,0,0.15)',
      },
    },
  },
  plugins: [],
};
