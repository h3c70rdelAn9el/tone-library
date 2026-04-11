/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#0d0d0f',
          surface: '#16161a',
          card: '#1c1c22',
          border: '#2a2a35',
          accent: '#e8ff47', // electric yellow-green
          accentDim: '#b8cc2e',
          muted: '#555566',
          text: '#e8e8f0',
          subtext: '#888899',
        },
      },
      fontFamily: {
        display: ["'Barlow Condensed'", 'sans-serif'],
        body: ["'DM Sans'", 'sans-serif'],
        mono: ["'JetBrains Mono'", 'monospace'],
      },
    },
  },
  plugins: [],
};
