const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 1. Swap the cold, digital grays for warm, earthy stones
        gray: colors.stone, 
        
        // 2. Swap the neon emerald greens for deep, natural teals
        emerald: colors.teal, 
        
        // 3. Swap the bright tech-blues for soft, muted sky blues
        blue: colors.sky,
      }
    },
  },
  plugins: [],
}