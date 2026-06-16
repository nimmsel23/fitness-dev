export const DARK_THEMES = [
  'nordic', 'nordic-darker', 'nordic-bluish', 
  'dracula', 'dracula-purple', 
  'midnight', 'matrix', 'forest', 'crimson', 'slate', 'zinc',
  'frappe', 'macchiato', 'mocha', 'gruvbox',
  'sweet', 'sweet-purple', 'sweet-mars', 'sweet-amber-blue',
  'ant-dark', 'materia', 'solarized-dark', 'homunculus', 'nothing', 'arc-dark'
];

export const LIGHT_THEMES = [
  'honey', 'snow', 'rose', 'latte', 'mint', 'cyan', 'gold',
  'ant', 'arc', 'solarized', 'alucard'
];

export const THEMES = {
  // Dark Themes
  nordic:            { bg: '#2e3440', accent: '#88c0d0' },
  'nordic-darker':   { bg: '#1d212a', accent: '#88c0d0' },
  'nordic-bluish':   { bg: '#2e3440', accent: '#81a1c1' },
  dracula:           { bg: '#1e1f29', accent: '#bd93f9' },
  'dracula-purple':  { bg: '#1a1526', accent: '#ff79c6' },
  midnight:          { bg: '#090b10', accent: '#3b82f6' },
  matrix:            { bg: '#000000', accent: '#00ff41' },
  forest:            { bg: '#1a2f23', accent: '#4ade80' },
  crimson:           { bg: '#1a0f12', accent: '#f43f5e' },
  slate:             { bg: '#0f172a', accent: '#38bdf8' },
  zinc:              { bg: '#18181b', accent: '#a1a1aa' },
  frappe:            { bg: '#303446', accent: '#81c8be' },
  macchiato:         { bg: '#24273a', accent: '#8aadf4' },
  mocha:             { bg: '#1e1e2e', accent: '#cba6f7' },
  gruvbox:           { bg: '#282828', accent: '#fabd2f' },
  sweet:             { bg: '#101013', accent: '#ff4081' },
  'sweet-purple':    { bg: '#161925', accent: '#c50ed2' },
  'sweet-mars':      { bg: '#2b1d1f', accent: '#ff5f5f' },
  'sweet-amber-blue':{ bg: '#090b10', accent: '#e8a020' },
  'ant-dark':        { bg: '#222e32', accent: '#9bbfbf' },
  materia:           { bg: '#1e1e1e', accent: '#8ab4f8' },
  'solarized-dark':  { bg: '#002b36', accent: '#268bd2' },
  homunculus:        { bg: '#18181b', accent: '#a16262' },
  nothing:           { bg: '#000000', accent: '#ff3333' },
  'arc-dark':        { bg: '#2f3445', accent: '#5294e2' },

  // Light Themes
  honey:             { bg: '#fdfaf0', accent: '#f59e0b' },
  snow:              { bg: '#ffffff', accent: '#3b82f6' },
  rose:              { bg: '#fff1f2', accent: '#f43f5e' },
  latte:             { bg: '#eff1f5', accent: '#7287fd' },
  mint:              { bg: '#f0fff4', accent: '#10b981' },
  cyan:              { bg: '#ecfeff', accent: '#06b6d4' },
  gold:              { bg: '#fffbeb', accent: '#d97706' },
  ant:               { bg: '#f0f2f5', accent: '#1677ff' },
  arc:               { bg: '#ffffff', accent: '#5294e2' },
  solarized:         { bg: '#fdf6e3', accent: '#268bd2' },
  alucard:           { bg: '#fffbeb', accent: '#644ac9' }
};

export const VALID_TABS = new Set(['dash', 'session', 'habits', 'journal', 'review', 'learn', 'settings', 'coach', 'gate']);
