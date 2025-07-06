/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // Se configurará desde cada app que lo use
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00ffff',
          dark: 'oklch(0.45 0.12 230)',
        },
        accent: 'oklch(0.82 0.09 210)',
        info: 'oklch(0.9 0.04 220)',
        warning: 'oklch(0.85 0.09 80)',
        danger: 'oklch(0.72 0.11 25)',
        'bg-light': 'oklch(0.98 0.005 270)',
        surface: {
          DEFAULT: 'oklch(1 0 0)',
          2: 'oklch(0.9 0.03 20)',
        },
        neutral: {
          500: 'oklch(0.6 0.01 260)',
        },
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'card': '0 4px 12px rgb(0 0 0 / 0.05)',
      },
    },
  },
  plugins: [],
};