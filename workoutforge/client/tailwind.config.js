/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        forge: {
          bg:      "#0f172a",
          panel:   "#1e293b",
          border:  "#334155",
          ink:     "#f1f5f9",
          muted:   "#94a3b8",
          accent:  "#3b82f6",
          green:   "#22c55e",
          orange:  "#f97316",
          red:     "#ef4444",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
