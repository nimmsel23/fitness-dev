/**
 * Translation utility for muscle names and groups.
 * Supports German (de), Latin (lat), and English (en).
 */

const GROUP_TRANSLATIONS = {
  de: {
    chest: 'Brust',
    back: 'Rücken',
    shoulders: 'Schultern',
    arms: 'Arme',
    core: 'Bauch',
    glutes: 'Gesäß',
    quads: 'Beinstrecker',
    hamstrings: 'Beinbeuger',
    calves: 'Waden',
    legs: 'Beine',
    trapezius: 'Nacken',
  },
  en: {
    chest: 'Chest',
    back: 'Back',
    shoulders: 'Shoulders',
    arms: 'Arms',
    core: 'Core',
    glutes: 'Glutes',
    quads: 'Quads',
    hamstrings: 'Hamstrings',
    calves: 'Calves',
    legs: 'Legs',
    trapezius: 'Traps',
  },
  lat: {
    chest: 'Thorax',
    back: 'Dorsum',
    shoulders: 'Deltoideus',
    arms: 'Membrum sup.',
    core: 'Core',
    glutes: 'Gluteus',
    quads: 'Quadriceps',
    hamstrings: 'Ischiocrurale',
    calves: 'Sura',
    legs: 'Membrum inf.',
    trapezius: 'Trapezius',
  }
};

export function translateMuscleGroup(groupId, lang = 'de') {
  const l = lang === 'lat' ? 'lat' : (lang === 'en' ? 'en' : 'de');
  return GROUP_TRANSLATIONS[l]?.[groupId] || groupId;
}

// Maps numeric muscle slug prefix → group ID
function numericSlugToGroup(id) {
  const m = String(id).match(/^(\d+)/);
  if (!m) return null;
  const n = parseInt(m[1]);
  if (n >= 100 && n < 200) return 'chest';
  if (n >= 200 && n < 300) return 'back';
  if (n >= 300 && n < 400) return 'shoulders';
  if (n >= 400 && n < 500) return 'arms';
  if (n >= 500 && n < 600) return 'core';
  if (n >= 600 && n < 700) {
    if (n <= 602) return 'glutes';
    if (n === 603) return 'quads';
    if (n === 604) return 'hamstrings';
    return 'legs';
  }
  if (n >= 700 && n < 800) return 'calves';
  return null;
}

export function translateMuscle(muscleId, taxonomy = null, lang = 'de') {
  if (!muscleId) return '';

  // 1. Taxonomy lookup (granular label)
  if (taxonomy && taxonomy[muscleId]) {
    const m = taxonomy[muscleId];
    if (lang === 'de' && m.label_de) return m.label_de;
    if (lang === 'en' && m.label_en) return m.label_en;
    if (lang === 'lat' && m.label_lat) return m.label_lat;
    return m.display_name || muscleId;
  }

  // 2. Direct group ID (chest, back, …)
  if (GROUP_TRANSLATIONS.de[muscleId]) {
    return translateMuscleGroup(muscleId, lang);
  }

  // 3. Numeric slug (201_latissimus_dorsi → back → "Rücken")
  const group = numericSlugToGroup(muscleId);
  if (group) return translateMuscleGroup(group, lang);

  // 4. Last resort: prettify the slug
  return muscleId
    .replace(/^\d+_/, '')
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
