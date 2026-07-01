/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  safelist: [
    'lg:flex',
    'lg:hidden',
    'lg:ml-[280px]',
    'justify-around',
    'flex-col',
  ],
  theme: {
    extend: {
      colors: {
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
        },
        forge: {
          bg:     'var(--card)',
          panel:  'var(--bg2)',
          border: 'var(--line)',
          ink:    'var(--ink)',
          muted:  'var(--muted)',
          accent: 'var(--accent)',
          red:    'var(--red)',
          green:  'var(--green)',
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}
