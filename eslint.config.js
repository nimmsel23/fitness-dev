import js from '@eslint/js';
import globals from 'globals';
import reactPlugin from 'eslint-plugin-react';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}', 'Skills/**/*.{js,jsx}', '6pack/**/*.{js,jsx}'],
    plugins: { react: reactPlugin },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: 'detect' } },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': 'off',
      'no-empty': 'off',             // catch {} ist in React-Code üblich
      'no-unsafe-finally': 'warn',
      'no-dupe-keys': 'error',
      'no-useless-assignment': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
  },
  {
    files: ['6pack/**/*.mjs'],
    languageOptions: { globals: { ...globals.node } },
  },
];
