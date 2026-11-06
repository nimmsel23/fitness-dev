const path = require("path");
const fs = require("fs");

// Gleiche Auflösung wie in vite.config.js: Fitness-Quellen liegen je nach
// Checkout als ../fitness-app (vitalos-Submodule) oder ../fitness-dev (Home-Root).
const FITNESS_DEV = path.resolve(__dirname, '../..');

// Farb-Tokens (fit-*, forge-*) kommen aus der Fitness-App, damit Learn standalone
// exakt dieselben CSS-Variablen-Utilities bekommt wie eingebettet — keine Kopie, kein Drift.
const fitnessTheme = require(path.join(FITNESS_DEV, "tailwind.config.cjs")).theme.extend;

// Tailwind 3 kann auf `var(--x)`-Farben keinen Alpha-Modifier anwenden — Klassen wie
// `bg-fit-accent/10` oder `border-fit-line/50` würden sonst gar nicht erzeugt. Jede
// Variable wird deshalb als Farbfunktion mit color-mix() geliefert.
const withAlpha = (value) => ({ opacityValue }) =>
  opacityValue === undefined || Number(opacityValue) === 1
    ? value
    : `color-mix(in srgb, ${value} ${Number(opacityValue) * 100}%, transparent)`;

const alphaColors = (colors) =>
  Object.fromEntries(
    Object.entries(colors).map(([key, val]) => [
      key,
      typeof val === "string" ? withAlpha(val) : alphaColors(val),
    ])
  );

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    path.join(FITNESS_DEV, "src/views/Learn/**/*.{js,jsx}"),
    "./index.html",
    "./src/**/*.{js,jsx}",
    // Geteilte Komponenten (PlanBuilder, AnatomyDetailModal, …) werden aus der Fitness-App
    // importiert — ohne diese Globs purged Tailwind ihre Utility-Klassen.
    path.join(FITNESS_DEV, "src/components/**/*.{js,jsx}"),
  ],
  theme: {
    extend: {
      colors: alphaColors(fitnessTheme.colors),
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
