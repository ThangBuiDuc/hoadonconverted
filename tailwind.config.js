/** @type {import('tailwindcss').Config} */
const { heroui } = require("@heroui/theme");
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/components/(spinner|input|button|modal).js",
  ],
  theme: {},
  plugins: [heroui()],
};
