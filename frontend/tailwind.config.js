/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#fefef9',
          100: '#faf9f0',
          200: '#f5f3e7',
        },
        mint: {
          50: '#f0faf6',
          100: '#d6f5e8',
          200: '#a8e8cc',
          300: '#6dd4a8',
          400: '#3dbf88',
          500: '#22a872',
        },
        sky: {
          50: '#f0f8ff',
          100: '#ddf0ff',
          200: '#b3dcff',
          300: '#7ec3ff',
          400: '#4aa8ff',
          500: '#2090f0',
        },
        peach: {
          50: '#fff8f5',
          100: '#ffeede',
          200: '#ffd4b3',
          300: '#ffb07a',
          400: '#ff8c4a',
          500: '#f57030',
        },
        lavender: {
          50: '#f8f5ff',
          100: '#ede8ff',
          200: '#d4c7ff',
          300: '#b29dff',
          400: '#9070ff',
          500: '#7450f0',
        }
      },
      fontFamily: {
        hebrew: ['Assistant', 'Rubik', 'Heebo', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 12px rgba(0,0,0,0.06)',
        card: '0 4px 20px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.12)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      }
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
