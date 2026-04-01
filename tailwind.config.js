/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0d1117',
          card: '#161b22',
          border: '#21262d',
        },
        accent: {
          DEFAULT: '#e6a817',
          blue: '#58a6ff',
          green: '#3fb950',
          red: '#f85149',
          purple: '#bc8cff',
        },
        text: {
          primary: '#e6edf3',
          secondary: '#8b949e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      }
    },
  },
  plugins: [],
}
