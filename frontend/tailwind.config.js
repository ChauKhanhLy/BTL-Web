/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
       borderRadius: {
      'xl': '1rem',
      '2xl': '1.25rem',
      }
    },
  },
  plugins: [],
}

