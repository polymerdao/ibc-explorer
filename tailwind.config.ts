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
        'fg-light': colors.slate[800],
        'content-bg-light': colors.white,
        'bg-dark': colors.slate[950],
        'fg-dark': colors.slate[50],
        'content-bg-dark': colors.gray[900],
        'primary': colors.emerald,
        'secondary': colors.sky,
      }
    },
  },
  plugins: [],
};
export default config;
