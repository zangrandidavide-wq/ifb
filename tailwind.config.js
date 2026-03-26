/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./*.html", 
    "./*.js"
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#7f13ec",
        "primary-dark": "#5e0eb3",
        "secondary": "#FFD700",
        "background-light": "#f7f6f8",
        "background-dark": "#191022",
        "sand": "#fdfbf7",
        "sand-dark": "#231b2e",
      },
      fontFamily: {
        "display": ["Lexend", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "1rem", "lg": "2rem", "xl": "3rem", "full": "9999px"
      },
      keyframes: {
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-down': 'fade-in-down 0.3s ease-out both',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}