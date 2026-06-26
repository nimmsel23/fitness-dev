// Heuristik: Sprache eines Exercise-Namens raten — wger liefert je nach Eintrag
// nur eine Übersetzung, und Nicht-EN/DE-Namen rutschen in die KB. Hier reicht
// eine grobe Erkennung, damit der User per Settings filtern kann.

const ES_DIACRITICS = /[ñ¿¡]/i;
const ES_TOKENS = /\b(jal[oó]n|sentadilla|estiramiento|extensi[oó]n|flexi[oó]n|elevaci[oó]n|empuje|tracci[oó]n|tir[oó]n|respiraci[oó]n|meditaci[oó]n|cadera|cuello|brazos?|piernas?|pecho|espalda|hombros?|biceps|gluteo|polea|m[aá]quina|de\s+(la|los|las|biceps|gluteo|piernas))\b/i;
const ES_SUFFIX = /(ci[oó]n|si[oó]n)\b/i;

const DE_DIACRITICS = /[äöüß]/i;
const DE_TOKENS = /\b(beinpresse|kniebeuge|latzug|klimmz[uü]ge?|kreuzheben|bankdr[uü]cken|schulterdr[uü]cken|frenchpress|wadenheben|wadendr[uü]cken|maschine|stange|hammer-?curls?|bizepscurl|trizepsdr[uü]cken|liegest[uü]tz|rumpfbeuge|seitheben|rudern|gestreckt|breitem?\s+griff|engem?\s+griff)\b/i;

const FR_DIACRITICS = /[çàèùâêîôû]/i;
const FR_TOKENS = /\b(tirage|développ[ée]|coul[ée]|haltères|barre|presse|debout|assis|inclin[ée])\b/i;

const IT_TOKENS = /\b(stacchi|panca|distensioni|squat\s+con|alzate\s+(laterali|frontali)|tirate)\b/i;

const PT_TOKENS = /\b(agachamento|levantamento|supino|rema(da|do)|tr[ií]ceps|b[ií]ceps|p[ée]itoral)\b/i;

export function detectLanguage(name) {
  if (!name) return 'en';
  const s = String(name);

  if (ES_DIACRITICS.test(s)) return 'es';
  if (ES_TOKENS.test(s)) return 'es';
  if (ES_SUFFIX.test(s) && !DE_DIACRITICS.test(s)) return 'es';

  if (DE_DIACRITICS.test(s)) return 'de';
  if (DE_TOKENS.test(s)) return 'de';

  if (FR_DIACRITICS.test(s)) return 'fr';
  if (FR_TOKENS.test(s)) return 'fr';

  if (IT_TOKENS.test(s)) return 'it';
  if (PT_TOKENS.test(s)) return 'pt';

  return 'en';
}

export const LANG_STORAGE_KEY = 'fitness-exerciseLanguages';
export const LANG_DEFAULTS = { en: true, de: true, es: false, fr: false, it: false, pt: false };
export const LANG_OPTIONS = [
  { key: 'en', label: 'Englisch' },
  { key: 'de', label: 'Deutsch' },
  { key: 'es', label: 'Spanisch' },
  { key: 'fr', label: 'Französisch' },
  { key: 'it', label: 'Italienisch' },
  { key: 'pt', label: 'Portugiesisch' },
];

export function loadLanguageFilter() {
  try {
    const raw = JSON.parse(localStorage.getItem(LANG_STORAGE_KEY) || '{}');
    return { ...LANG_DEFAULTS, ...raw };
  } catch {
    return { ...LANG_DEFAULTS };
  }
}

export function saveLanguageFilter(filter) {
  localStorage.setItem(LANG_STORAGE_KEY, JSON.stringify(filter));
}

export function filterByLanguage(results, filter = loadLanguageFilter()) {
  if (!Array.isArray(results)) return [];
  return results.filter(r => {
    const lang = detectLanguage(r.display_name || r.name || '');
    return filter[lang] !== false;
  });
}
