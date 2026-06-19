/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#4da6ff",
        secondary: "#ffcc00",
        accent: "#ff6699",
        success: "#33cc33",
        warning: "#ff9933",
        danger: "#ff3333",
        background: "#f0f8ff",
        card: "#ffffff",
        textPrimary: "#333333",
        textSecondary: "#666666",
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        'full': '9999px',
      },
    },
  },
  plugins: [],
}
