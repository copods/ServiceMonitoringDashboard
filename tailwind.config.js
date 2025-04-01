/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          900: '#121212',
          800: '#1e1e1e',
          700: '#2a2a2a',
          600: '#3c3c3c',
          500: '#5a5a5a',
          400: '#b0b0b0',
        }
      }
    },
  },
  plugins: [],
}
