/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,mjs,html}"],
  theme: {
    extend: {
      colors: {
        neon: "#39ff14",
        darkbg: "#070909",
      },
      boxShadow: {
        neon: "0 0 40px rgba(57,255,20,0.45)",
      },
    },
  },
  plugins: [],
};
