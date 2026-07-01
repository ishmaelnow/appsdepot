/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        depot: {
          orange: '#F97316',
          'orange-dark': '#EA580C',
          'orange-light': '#FED7AA',
          black: '#1C1917',
          yellow: '#EAB308',
          'yellow-light': '#FEF9C3',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
