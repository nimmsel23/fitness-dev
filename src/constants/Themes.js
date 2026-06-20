export const DARK_THEMES = [
  'nordic', 'nordic-darker', 'nordic-bluish',
  'dracula', 'dracula-purple',
  'kanagawa', 'everforest', 'oxocarbon',
  'midnight', 'matrix', 'forest', 'crimson',
  'frappe', 'macchiato', 'mocha',
  'gruvbox', 'solarized-dark',
  'ant-dark', 'materia', 'arc-dark',
  'homunculus', 'nothing',
];

export const LIGHT_THEMES = [
  'honey', 'paper', 'latte', 'solarized', 'arc', 'ant', 'alucard',
];

export const THEMES = {
  // Dark
  nordic:             { bg: '#2e3440', accent: '#88c0d0' },
  'nordic-darker':    { bg: '#1d212a', accent: '#88c0d0' },
  'nordic-bluish':    { bg: '#2e3440', accent: '#81a1c1' },
  dracula:            { bg: '#1e1f29', accent: '#bd93f9' },
  'dracula-purple':   { bg: '#1a1526', accent: '#ff79c6' },
  kanagawa:           { bg: '#1f1f28', accent: '#e46876' },
  everforest:         { bg: '#272e33', accent: '#a7c080' },
  oxocarbon:          { bg: '#161616', accent: '#78a9ff' },
  midnight:           { bg: '#0a0e1a', accent: '#4a9eff' },
  matrix:             { bg: '#000000', accent: '#00ff41' },
  forest:             { bg: '#1a2f23', accent: '#4ade80' },
  crimson:            { bg: '#1a0f12', accent: '#f43f5e' },
  frappe:             { bg: '#303446', accent: '#81c8be' },
  macchiato:          { bg: '#24273a', accent: '#8aadf4' },
  mocha:              { bg: '#1e1e2e', accent: '#cba6f7' },
  gruvbox:            { bg: '#282828', accent: '#fabd2f' },
  'solarized-dark':   { bg: '#002b36', accent: '#268bd2' },
  'ant-dark':         { bg: '#222e32', accent: '#9bbfbf' },
  materia:            { bg: '#1e1e1e', accent: '#8ab4f8' },
  'arc-dark':         { bg: '#2f3445', accent: '#5294e2' },
  homunculus:         { bg: '#1a1410', accent: '#c04040' },
  nothing:            { bg: '#000000', accent: '#ffffff' },

  // Light
  honey:              { bg: '#fdfaf0', accent: '#c87800' },
  paper:              { bg: '#f4efe6', accent: '#7c5c3a' },
  latte:              { bg: '#eff1f5', accent: '#7287fd' },
  solarized:          { bg: '#eee8d5', accent: '#268bd2' },
  arc:                { bg: '#ffffff', accent: '#5294e2' },
  ant:                { bg: '#f0f2f5', accent: '#1677ff' },
  alucard:            { bg: '#fffbeb', accent: '#644ac9' },
};

export const VALID_TABS = new Set(['dash', 'session', 'habits', 'journal', 'review', 'learn', 'settings', 'coach', 'gate']);
