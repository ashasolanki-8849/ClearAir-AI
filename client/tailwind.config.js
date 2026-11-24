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
        dark: {
          bg: '#000000',
          card: '#0a0a0a',
          surface: '#111111',
          border: '#222222',
          muted: '#888888',
        },
        aqi: {
          good: '#10b981',        // 0-50
          satisfactory: '#34d399',// 51-100
          moderate: '#f59e0b',    // 101-200
          poor: '#f97316',        // 201-300
          verypoor: '#ef4444',    // 301-400
          severe: '#991b1b',      // 401-500+
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}
