/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // CoachDash design tokens
        bg: {
          base: '#09090f',
          card: '#111118',
          elevated: '#1a1a24',
          border: '#2a2a38',
        },
        accent: {
          DEFAULT: '#7c5cfc',
          hover: '#6b4ef0',
          muted: '#7c5cfc33',
        },
        text: {
          primary: '#f0f0f8',
          secondary: '#9090a8',
          muted: '#5a5a70',
        },
        mood: {
          1: '#ef4444',
          2: '#f97316',
          3: '#eab308',
          4: '#22c55e',
          5: '#a855f7',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
