/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#4F46E5", // Indigo-600
        primaryLight: "#818CF8", // Indigo-400
        secondary: "#14B8A6", // Teal-500
        secondaryLight: "#5EEAD4", // Teal-300
        accent: "#F43F5E", // Rose-500
        success: "#10B981", // Emerald-500
        warning: "#F59E0B", // Amber-500
        danger: "#EF4444", // Red-500
        background: "#FFFFFF", // White
        card: "#FFFFFF",
        textPrimary: "#0F172A", // Slate-900
        textSecondary: "#64748B", // Slate-500
        border: "#E2E8F0", // Slate-200
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
