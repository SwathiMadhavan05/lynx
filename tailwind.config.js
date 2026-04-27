/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0a0f1e', // User specified background
          800: '#111827', // Lighter shade for panels
        },
        alert: {
          500: '#e53935', // User specified red accent
        }
      },
      fontFamily: {
        nordique: ['Nordique', 'system-ui', 'sans-serif'],
        sans: ['Nordique', 'system-ui', 'sans-serif'], // Set default sans to Nordique
      }
    },
  },
  plugins: [],
}
