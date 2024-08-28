import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'black': '#050505',
        'purple': '#1E093A',
        'blue': '#09246B',
        'lavender': '#7A00D9',
        'light-blue': '#00A6EE',
        'turquoise': '#02DBC4',
        'vapor': '#F1E9f7',
        'white': '#FFFFFF',
        'dark-gray': '#282729',
        'warning': '#F695A1'
      },
      fontFamily: {
        primary: ['var(--primary-font)'],
        mono: ['var(--mono-font)']
      },
      keyframes: {
        pulselight: {
          '0%, 100%': { opacity: '0' },
          '50%': { opacity: '.3' },
        },
        blacktovapor: {
          '0%': { backgroundColor: '#050505' },
          '100%': { backgroundColor: '#F1E9f7' },
        },
      },
      animation: {
        'pulse-light': 'pulselight 2.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'black-to-vapor': 'blacktovapor 1s ease-in-out',
      },
    }
  },
  darkMode: 'selector',
  plugins: [],
};

export default config;
