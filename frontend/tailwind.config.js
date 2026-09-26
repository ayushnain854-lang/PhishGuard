/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#080c14",
          card: "#0f172a",
          cardhover: "#1e293b",
          teal: "#06b6d4",
          blue: "#3b82f6",
          amber: "#f59e0b",
          red: "#ef4444",
          green: "#10b981",
          accent: "#4f46e5"
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'cyan-glow': '0 0 15px rgba(6, 182, 212, 0.15)',
        'blue-glow': '0 0 15px rgba(59, 130, 246, 0.15)',
        'red-glow': '0 0 15px rgba(239, 68, 68, 0.2)',
      }
    },
  },
  plugins: [],
}
