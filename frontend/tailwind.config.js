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
          low: '#0ea5e9',         // soft blue
          good: '#0ea5e9',        // soft blue (no green)
          satisfactory: '#38bdf8',// sky blue
          moderate: '#eab308',    // yellow
          poor: '#f97316',        // orange
          high: '#f97316',        // orange
          verypoor: '#ef4444',    // red
          veryhigh: '#ef4444',    // red
          severe: '#dc2626',      // crimson red
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
