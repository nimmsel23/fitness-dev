export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: 'var(--accent)',
        dim: 'var(--dim)',
      }
    },
  },
  plugins: [],
}
