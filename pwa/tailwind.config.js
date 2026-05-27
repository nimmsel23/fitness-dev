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
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        bg: 'var(--bg)',
        bg2: 'var(--bg2)',
        line: 'var(--line)',
        card: 'var(--card)',
        panel: 'var(--panel)',
        green: 'var(--green)',
        red: 'var(--red)',
        orange: 'var(--orange)',
        fit: {
          bg:    'var(--bg)',
          bg2:   'var(--bg2)',
          card:  'var(--card)',
          cardh: 'var(--card-hover)',
          line:  'var(--line)',
          ink:   'var(--ink)',
          muted: 'var(--muted)',
          dim:   'var(--dim)',
          accent:'var(--accent)',
          green: 'var(--green)',
          red:   'var(--red)',
          orange:'var(--orange)',
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
}
