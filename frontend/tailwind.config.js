/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable toggling dark mode via class 'dark' on html element
  theme: {
    extend: {
      colors: {
        health: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          50: '#f0fdf4', // light green accent
          600: '#0284c7', // Primary Sky Blue
          700: '#0369a1', // Deep Sky Blue
          800: '#075985',
          900: '#0c4a6e',
          accent: '#10b981', // Emerald Green
          danger: '#ef4444', // Red Alert
          warning: '#f59e0b', // Amber Warning
        },
        darkbg: {
          base: '#0f172a',    // slate-900
          card: '#1e293b',    // slate-800
          border: '#334155',  // slate-700
          text: '#f8fafc',    // slate-50
          muted: '#94a3b8'    // slate-400
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
