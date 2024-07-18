import type { Config } from "tailwindcss";
const colors = require('tailwindcss/colors');

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-light': colors.slate[100],
        'bg-light-accent': colors.white,
        'fg-light': colors.slate[800],
        'bg-dark': colors.slate[950],
        'bg-dark-accent': colors.slate[900],
        'fg-dark': colors.slate[50],
        'primary': colors.emerald,
        'secondary': colors.sky,
        'vapor': '#f1e9f7'
      },
      fontFamily: {
        primary: ['var(--primary-font)'],
        mono: ['var(--mono-font)'],
        accent: ['var(--secondary-font)']
      },
      keyframes: {
        pulselight: {
          '0%, 100%': { opacity: '0' },
          '50%': { opacity: '.3' },
        },
      },
      animation: {
        'pulse-light': 'pulselight 2.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    }
  },
  darkMode: 'selector',
  plugins: [],
};

export default config;
