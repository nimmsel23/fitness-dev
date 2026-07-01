const base = require('../../tailwind.config.cjs')

module.exports = {
  ...base,
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './index.html',
    // fitness-dev SSOT views (Journal, Habits, Session, Dashboard, etc.)
    '../../src/**/*.{js,jsx,ts,tsx}',
    // journal-vos (DB-Layer + views die direkt importiert werden)
    '../journal-vos/src/**/*.{js,jsx,ts,tsx}',
  ],
}
