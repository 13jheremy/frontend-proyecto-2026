/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}", // Ajusta la ruta según tu estructura
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#272C33',
      },
      fontFamily: {
        libertinus: ["'Libertinus Serif'", "serif"],
        alfa: ['"Alfa Slab One"', 'cursive'],
        archivoblack: ['"Archivo Black"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};




