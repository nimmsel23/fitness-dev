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

// Mapping for body-muscles (AnatomyExplorer / Learn Tab)
export const BODY_MUSCLES_SLUGS = {
  'trapezius': 'trapezius', 'traps': 'trapezius',
  'latissimus': 'latissimus_dorsi', 'lats': 'latissimus_dorsi',
  'pectoralis': 'pectoralis_major', 'chest': 'pectoralis_major',
  'deltoid': 'anterior_deltoid', 'shoulder': 'anterior_deltoid',
  'biceps': 'biceps_brachii',
  'triceps': 'triceps_brachii',
  'quadriceps': 'quadriceps_femoris', 'quads': 'quadriceps_femoris',
  'hamstrings': 'biceps_femoris',
  'gluteus': 'gluteus_maximus', 'glutes': 'gluteus_maximus',
  'calves': 'gastrocnemius'
  // ... map more as needed to match body-muscles data/muscles folder
};
