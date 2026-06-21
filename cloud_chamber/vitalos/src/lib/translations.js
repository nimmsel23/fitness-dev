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

export function translateMuscle(muscleId, taxonomy = null, lang = 'de') {
  if (!muscleId) return '';
  
  // 1. Check taxonomy if available
  if (taxonomy && taxonomy[muscleId]) {
    const m = taxonomy[muscleId];
    if (lang === 'de' && m.label_de) return m.label_de;
    if (lang === 'en' && m.label_en) return m.label_en;
    if (lang === 'lat' && m.label_lat) return m.label_lat;
    return m.display_name || muscleId;
  }

  // 2. Fallback for group IDs
  if (GROUP_TRANSLATIONS.de[muscleId]) {
    return translateMuscleGroup(muscleId, lang);
  }

  // 3. Fallback: cleaning up slugs
  return muscleId
    .replace(/^\d+_/, '')
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
