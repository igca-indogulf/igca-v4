/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { 950: '#0B1220', 900: '#0F172A', 800: '#1E293B', 700: '#334155' },
        brand: {
          50: '#EEF4FF', 100: '#DCE8FF', 300: '#9DBBFF', 500: '#3B5BDB',
          600: '#2F49B0', 700: '#243A8C', 900: '#152363'
        },
        gold: { 400: '#D4AF6A', 500: '#BF9550' },
        surface: { 0: '#FFFFFF', 50: '#F7F8FA', 100: '#EEF1F5' }
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,0.04), 0 8px 24px -12px rgba(15,23,42,0.12)'
      }
    }
  },
  plugins: []
}
