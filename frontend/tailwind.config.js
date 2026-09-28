/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hotel: {
          ivory: '#F8F5EF',
          cream: '#EFE8DC',
          charcoal: '#242321',
          brown: '#5A4636',
          gold: '#B79A65',
          goldHover: '#9F824F',
          goldLight: '#F3EBDD',
          muted: '#766F66',
          dark: '#1A1918',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
