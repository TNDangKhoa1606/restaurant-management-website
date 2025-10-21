/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'signature': ['"Dancing Script"', 'cursive'],
      },
      colors: {
        primary: {
          DEFAULT: '#cfa670',
          hover: '#e0b888',
        },
        secondary: {
          DEFAULT: '#e74c3c',
          hover: '#c0392b',
        },
        'text-light': '#ffffff',
        'text-dark': '#2c3e50',
        'text-muted': '#7f8c8d',
        'text-footer': '#a5a5a5',
        'bg-dark-1': '#111111',
        'bg-dark-2': '#1a1a1a',
        'bg-light': '#ffffff',
        'bg-light-hover': '#ecf0f1',
        info: '#3498db',
        'border-color': '#bdc3c7',
        'overlay-dark': 'rgba(0, 0, 0, 0.6)',
      },
      animation: {
        fadeIn: 'fadeIn 1.5s ease-in-out',
        fadeInUp: 'fadeInUp 1s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
    },
  },
  plugins: [],
}
