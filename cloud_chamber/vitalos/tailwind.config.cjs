const base = require('../../tailwind.config.cjs')

module.exports = {
  ...base,
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './index.html',
  ],
}
