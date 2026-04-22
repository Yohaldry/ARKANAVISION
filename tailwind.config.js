/** @type {import('tailwindcss').Config} */
export default {
  
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brandDark: "#030712",
        brandBlue: "#106AFF",
        brandOrange: "#E1702F",
      },
      // --- AÑADE ESTO ---
      backgroundImage: {
        'hero-visual': "url('/images/hero-visual.png')",
      }
    },
  },
  plugins: [],
}