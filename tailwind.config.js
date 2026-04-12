      // Removed duplicate subtle-pulse animation definition to fix PostCSS syntax error
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
          accent: '#e8ff47',
          accentDim: '#b8cc2e',
          muted: '#555566',
          text: '#e8e8f0',
          subtext: '#888899',
        },
      },
      fontFamily: {
        display: ["'Outfit'", 'system-ui', 'sans-serif'],
        body: ["'Plus Jakarta Sans'", 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      letterSpacing: {
        display: '-0.02em',
      },
      transitionDuration: {
        plugin: '175ms',
      },
      transitionTimingFunction: {
        plugin: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
      keyframes: {
        'tone-active-pulse': {
          '0%, 100%': {
            boxShadow:
              'inset 3px 0 0 0 rgba(232, 255, 71, 0.85), 0 0 0 0 rgba(232, 255, 71, 0.12)',
          },
          '50%': {
            boxShadow:
              'inset 3px 0 0 0 rgba(232, 255, 71, 0.95), 0 0 28px -6px rgba(232, 255, 71, 0.28)',
          },
        },
      },
      animation: {
        'tone-active-pulse': 'tone-active-pulse 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
