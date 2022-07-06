/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./node_modules/flowbite/**/*.js",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Inter", "sans-serif"],
        messages: ["Monserrat", "sans-serif"],
      },
      colors: {
        primary: "#181622",
        secondary: "#13111c",
        primaryLight: "#ffffff",
        secondaryLight: "#8a8a93",
      },
    },
  },
  plugins: [require("flowbite/plugin"), require("tailwind-scrollbar")],
};
