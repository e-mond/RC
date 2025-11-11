/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
   extend: {
  colors: {
    primary: "#0b6e4f",
    secondary: "#f1f3f5",
    border: "#e6e8ea",
    background: "#f8f9f9",
    card: "#ffffff",
    foreground: "#0f1724",
    input: "#ffffff",
    sectionBg: "#f5f0f0",
  },
},
  },
  plugins: [],
};
