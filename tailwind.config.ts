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
        'bg-lt': colors.slate[100],
        'fg-lt': colors.slate[800],
        'content-bg-lt': colors.white,
        'bg-dk': colors.slate[950],
        'fg-dk': colors.slate[50],
        'content-bg-dk': colors.gray[900],
        'primary': colors.emerald,
        'secondary': colors.sky,
      }
    },
  },
  plugins: [],
};
export default config;
