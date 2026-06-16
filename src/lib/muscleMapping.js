// pwa/src/lib/muscleMapping.js

/**
 * Shared mapping between our Knowledge Base muscle tags
 * and the slug systems of our visualization libraries.
 */

// Mapping for react-muscle-highlighter (DetailedMuscleMap)
export const RBH_SLUGS = {
  // Chest
  'chest': 'chest', 'pecs': 'chest', 'pectoralis': 'chest', 'pectoralis major': 'chest', 'pectoralis minor': 'chest', 'serratus': 'serratus-anterior',
  // Back
  'back': 'upper-back', 'lats': 'latissimus', 'latissimus': 'latissimus', 
  'traps': 'traps', 'trapezius': 'traps', 'upper-back': 'upper-back', 'rhomboids': 'rhomboids',
  'lower-back': 'lower-back', 'erector spinae': 'lower-back', 'lumbar': 'lower-back',
  // Shoulders
  'shoulders': 'front-deltoids', 'delts': 'front-deltoids', 'deltoid': 'front-deltoids', 'front-deltoids': 'front-deltoids', 'rear-deltoids': 'back-deltoids',
  // Arms
  'biceps': 'biceps', 'triceps': 'triceps', 'forearms': 'forearm', 'forearm': 'forearm', 'brachialis': 'biceps',
  // Core
  'abs': 'abs', 'core': 'abs', 'obliques': 'obliques', 'obliquus': 'obliques', 'rectus abdominis': 'abs',
  // Legs/Posterior Chain
  'glutes': 'gluteal', 'gluteus': 'gluteal', 'gluteus maximus': 'gluteal', 
  'quads': 'quadriceps', 'quadriceps': 'quadriceps', 'vastus lateralis': 'quadriceps',
  'hamstrings': 'hamstring', 'hamstring': 'hamstring', 'biceps femoris': 'hamstring',
  'calves': 'calves', 'gastrocnemius': 'calves', 'soleus': 'calves'
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
};

// Legacy — flat slug map for BodyMusclesMap.jsx (AnatomyExplorer)
export const BODY_MUSCLES_SLUGS = {
  chest: 'chest-upper-left', pecs: 'chest-upper-left', pectoralis: 'chest-upper-left',
  lats: 'lats-upper-left', latissimus: 'lats-upper-left', back: 'lats-upper-left',
  traps: 'traps-upper-left', trapezius: 'traps-upper-left',
  shoulders: 'shoulder-front-left', deltoid: 'shoulder-front-left',
  biceps: 'biceps-left', triceps: 'triceps-long-left',
  forearm: 'forearm-left', forearms: 'forearm-left',
  abs: 'abs-upper-left', core: 'abs-upper-left', obliques: 'obliques-left',
  glutes: 'gluteus-maximus-left', gluteus: 'gluteus-maximus-left', gluteal: 'gluteus-maximus-left',
  quads: 'quads-left', quadriceps: 'quads-left',
  hamstrings: 'hamstrings-medial-left', hamstring: 'hamstrings-medial-left',
  calves: 'calves-gastroc-medial-left', gastrocnemius: 'calves-gastroc-medial-left',
};
