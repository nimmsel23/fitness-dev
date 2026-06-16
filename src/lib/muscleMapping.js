// pwa/src/lib/muscleMapping.js

/**
 * Shared mapping between our Knowledge Base muscle tags
 * and the slug systems of our visualization libraries.
 */

// Mapping for react-muscle-highlighter (DetailedMuscleMap)
export const RBH_SLUGS = {
  // Chest
  'chest': 'chest', 'pecs': 'chest', 'pectoralis': 'chest', 'pectoralis major': 'chest', 'pectoralis minor': 'chest', 'serratus': 'serratus-anterior',
  '100_chest': 'chest', '101_pectoralis_major': 'chest', '102_pectoralis_major_clavicular': 'chest', '103_pectoralis_minor': 'chest', '104_serratus_anterior': 'serratus-anterior',
  // Back
  'back': 'upper-back', 'lats': 'latissimus', 'latissimus': 'latissimus', 
  'traps': 'traps', 'trapezius': 'traps', 'upper-back': 'upper-back', 'rhomboids': 'rhomboids',
  'lower-back': 'lower-back', 'erector spinae': 'lower-back', 'lumbar': 'lower-back',
  '200_back': 'upper-back', '201_latissimus_dorsi': 'latissimus', '202_trapezius_upper': 'traps', '203_trapezius_middle': 'traps', '204_trapezius_lower': 'traps', '205_rhomboids': 'rhomboids', '206_erector_spinae': 'lower-back',
  // Shoulders
  'shoulders': 'front-deltoids', 'delts': 'front-deltoids', 'deltoid': 'front-deltoids', 'front-deltoids': 'front-deltoids', 'rear-deltoids': 'back-deltoids',
  '300_shoulders': 'front-deltoids', '301_anterior_deltoid': 'front-deltoids', '302_lateral_deltoid': 'front-deltoids', '303_posterior_deltoid': 'back-deltoids',
  // Arms
  'biceps': 'biceps', 'triceps': 'triceps', 'forearms': 'forearm', 'forearm': 'forearm', 'brachialis': 'biceps',
  '400_arms': 'biceps', '401_biceps_brachii': 'biceps', '402_brachialis': 'biceps', '403_triceps_brachii': 'triceps', '404_brachioradialis': 'forearm',
  // Core
  'abs': 'abs', 'core': 'abs', 'obliques': 'obliques', 'obliquus': 'obliques', 'rectus abdominis': 'abs',
  '500_core': 'abs', '501_rectus_abdominis': 'abs', '502_obliques': 'obliques',
  // Legs/Posterior Chain
  'glutes': 'gluteal', 'gluteus': 'gluteal', 'gluteus maximus': 'gluteal', 
  'quads': 'quadriceps', 'quadriceps': 'quadriceps', 'vastus lateralis': 'quadriceps',
  'hamstrings': 'hamstring', 'hamstring': 'hamstring', 'biceps femoris': 'hamstring',
  'calves': 'calves', 'gastrocnemius': 'calves', 'soleus': 'calves',
  '600_legs': 'quadriceps', '601_gluteus_maximus': 'gluteal', '602_gluteus_medius': 'gluteal', '603_quadriceps': 'quadriceps', '604_hamstrings': 'hamstring', '700_calves': 'calves'
};

// Mapping for body-muscles library (IDs verified against dist/index.js)
// Each entry: { ids: string[], view: 'FRONT'|'BACK' }
export const BODY_MUSCLES_MAP = {
  chest:          { view: 'FRONT', ids: ['chest-upper-left','chest-upper-right','chest-lower-left','chest-lower-right'] },
  back:           { view: 'BACK',  ids: ['lats-upper-left','lats-mid-left','lats-lower-left','lats-upper-right','lats-mid-right','lats-lower-right'] },
  lats:           { view: 'BACK',  ids: ['lats-upper-left','lats-mid-left','lats-lower-left','lats-upper-right','lats-mid-right','lats-lower-right'] },
  traps:          { view: 'BACK',  ids: ['traps-upper-left','traps-mid-left','traps-lower-left','traps-upper-right','traps-mid-right','traps-lower-right'] },
  trapezius:      { view: 'BACK',  ids: ['traps-upper-left','traps-mid-left','traps-lower-left','traps-upper-right','traps-mid-right','traps-lower-right'] },
  shoulders:      { view: 'FRONT', ids: ['shoulder-front-left','shoulder-front-right','shoulder-side-left','shoulder-side-right'] },
  deltoid:        { view: 'FRONT', ids: ['shoulder-front-left','shoulder-front-right','shoulder-side-left','shoulder-side-right'] },
  'front-deltoids': { view: 'FRONT', ids: ['shoulder-front-left','shoulder-front-right'] },
  'rear-deltoids':  { view: 'BACK',  ids: ['deltoid-rear-left','deltoid-rear-right'] },
  'back-deltoids':  { view: 'BACK',  ids: ['deltoid-rear-left','deltoid-rear-right'] },
  biceps:         { view: 'FRONT', ids: ['biceps-left','biceps-right'] },
  triceps:        { view: 'BACK',  ids: ['triceps-long-left','triceps-lateral-left','triceps-long-right','triceps-lateral-right'] },
  forearm:        { view: 'FRONT', ids: ['forearm-left','forearm-right'] },
  forearms:       { view: 'FRONT', ids: ['forearm-left','forearm-right'] },
  arms:           { view: 'FRONT', ids: ['biceps-left','biceps-right','forearm-left','forearm-right'] },
  abs:            { view: 'FRONT', ids: ['abs-upper-left','abs-upper-right','abs-lower-left','abs-lower-right'] },
  core:           { view: 'FRONT', ids: ['abs-upper-left','abs-upper-right','abs-lower-left','abs-lower-right','obliques-left','obliques-right'] },
  obliques:       { view: 'FRONT', ids: ['obliques-left','obliques-right'] },
  'lower-back':   { view: 'BACK',  ids: ['lower-back-erectors-left','lower-back-erectors-right','lower-back-ql-left','lower-back-ql-right'] },
  glutes:         { view: 'BACK',  ids: ['gluteus-maximus-left','gluteus-maximus-right','gluteus-medius-left','gluteus-medius-right'] },
  gluteal:        { view: 'BACK',  ids: ['gluteus-maximus-left','gluteus-maximus-right','gluteus-medius-left','gluteus-medius-right'] },
  quads:          { view: 'FRONT', ids: ['quads-left','quads-right'] },
  quadriceps:     { view: 'FRONT', ids: ['quads-left','quads-right'] },
  hamstrings:     { view: 'BACK',  ids: ['hamstrings-medial-left','hamstrings-lateral-left','hamstrings-medial-right','hamstrings-lateral-right'] },
  hamstring:      { view: 'BACK',  ids: ['hamstrings-medial-left','hamstrings-lateral-left','hamstrings-medial-right','hamstrings-lateral-right'] },
  calves:         { view: 'BACK',  ids: ['calves-gastroc-medial-left','calves-gastroc-lateral-left','calves-gastroc-medial-right','calves-gastroc-lateral-right','calves-soleus-left','calves-soleus-right'] },
  serratus:       { view: 'FRONT', ids: ['serratus-anterior-left','serratus-anterior-right'] },
  adductors:      { view: 'FRONT', ids: ['adductors-left','adductors-right'] },
  'hip-flexors':  { view: 'FRONT', ids: ['hip-flexor-left','hip-flexor-right'] },
  '100_chest': { view: 'FRONT', ids: ['chest-upper-left','chest-upper-right','chest-lower-left','chest-lower-right'] },
  '101_pectoralis_major': { view: 'FRONT', ids: ['chest-upper-left','chest-upper-right','chest-lower-left','chest-lower-right'] },
  '200_back': { view: 'BACK', ids: ['lats-upper-left','lats-mid-left','lats-lower-left','lats-upper-right','lats-mid-right','lats-lower-right'] },
  '201_latissimus_dorsi': { view: 'BACK', ids: ['lats-upper-left','lats-mid-left','lats-lower-left','lats-upper-right','lats-mid-right','lats-lower-right'] },
  '300_shoulders': { view: 'FRONT', ids: ['shoulder-front-left','shoulder-front-right','shoulder-side-left','shoulder-side-right'] },
  '400_arms': { view: 'FRONT', ids: ['biceps-left','biceps-right','forearm-left','forearm-right'] },
  '401_biceps_brachii': { view: 'FRONT', ids: ['biceps-left','biceps-right'] },
  '403_triceps_brachii': { view: 'BACK', ids: ['triceps-long-left','triceps-lateral-left','triceps-long-right','triceps-lateral-right'] },
  '500_core': { view: 'FRONT', ids: ['abs-upper-left','abs-upper-right','abs-lower-left','abs-lower-right','obliques-left','obliques-right'] },
  '501_rectus_abdominis': { view: 'FRONT', ids: ['abs-upper-left','abs-upper-right','abs-lower-left','abs-lower-right'] },
  '600_legs': { view: 'FRONT', ids: ['quads-left','quads-right'] },
  '601_gluteus_maximus': { view: 'BACK', ids: ['gluteus-maximus-left','gluteus-maximus-right'] },
  '603_quadriceps': { view: 'FRONT', ids: ['quads-left','quads-right'] },
  '604_hamstrings': { view: 'BACK', ids: ['hamstrings-medial-left','hamstrings-lateral-left','hamstrings-medial-right','hamstrings-lateral-right'] },
  '700_calves': { view: 'BACK', ids: ['calves-gastroc-medial-left','calves-gastroc-lateral-left','calves-gastroc-medial-right','calves-gastroc-lateral-right','calves-soleus-left','calves-soleus-right'] },
};

// Legacy — flat slug map for BodyMusclesMap.jsx (AnatomyExplorer)
export const BODY_MUSCLES_SLUGS = {
  chest: 'chest-upper-left', pecs: 'chest-upper-left', pectoralis: 'chest-upper-left',
  '100_chest': 'chest-upper-left', '101_pectoralis_major': 'chest-upper-left',
  lats: 'lats-upper-left', latissimus: 'lats-upper-left', back: 'lats-upper-left',
  '200_back': 'lats-upper-left', '201_latissimus_dorsi': 'lats-upper-left',
  traps: 'traps-upper-left', trapezius: 'traps-upper-left',
  '202_trapezius_upper': 'traps-upper-left',
  shoulders: 'shoulder-front-left', deltoid: 'shoulder-front-left',
  '300_shoulders': 'shoulder-front-left', '301_anterior_deltoid': 'shoulder-front-left',
  biceps: 'biceps-left', triceps: 'triceps-long-left',
  '400_arms': 'biceps-left', '401_biceps_brachii': 'biceps-left',
  forearm: 'forearm-left', forearms: 'forearm-left',
  abs: 'abs-upper-left', core: 'abs-upper-left', obliques: 'obliques-left',
  '500_core': 'abs-upper-left', '501_rectus_abdominis': 'abs-upper-left',
  glutes: 'gluteus-maximus-left', gluteus: 'gluteus-maximus-left', gluteal: 'gluteus-maximus-left',
  '600_legs': 'gluteus-maximus-left', '601_gluteus_maximus': 'gluteus-maximus-left',
  quads: 'quads-left', quadriceps: 'quads-left',
  '603_quadriceps': 'quads-left',
  hamstrings: 'hamstrings-medial-left', hamstring: 'hamstrings-medial-left',
  '604_hamstrings': 'hamstrings-medial-left',
  calves: 'calves-gastroc-medial-left', gastrocnemius: 'calves-gastroc-medial-left',
  '700_calves': 'calves-gastroc-medial-left',
};
