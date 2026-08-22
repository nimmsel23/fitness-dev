export const SIXPACK_EXERCISES = {
  hands_back_tucks: {
    id: 'hands_back_tucks',
    name: 'Hands Back Tucks',
    category: 'lower',
  },
  marching_planks: {
    id: 'marching_planks',
    name: 'Marching Planks',
    category: 'anti_extension',
  },
  side_plank_lifts: {
    id: 'side_plank_lifts',
    name: 'Side Plank Lifts',
    category: 'lateral_chain',
  },
  seated_ab_circles: {
    id: 'seated_ab_circles',
    name: 'Seated Ab Circles',
    category: 'rotation',
  },
  ninety_ninety_crunch: {
    id: 'ninety_ninety_crunch',
    name: '90/90 Crunch',
    category: 'upper',
  },
  russian_v_tuck_twists: {
    id: 'russian_v_tuck_twists',
    name: 'Russian "V" Tuck Twists',
    category: 'rotation',
  },
  iso_reverse_crunches: {
    id: 'iso_reverse_crunches',
    name: 'ISO Reverse Crunches',
    category: 'lower',
  },
  mountain_climbers: {
    id: 'mountain_climbers',
    name: 'Mountain Climbers',
    category: 'anti_extension',
  },
  bent_knee_windshield_wipers: {
    id: 'bent_knee_windshield_wipers',
    name: 'Bent Knee Windshield Wipers',
    category: 'rotation',
  },
  side_crunches: {
    id: 'side_crunches',
    name: 'Side Crunches',
    category: 'lateral_chain',
  },
  jackknifes: {
    id: 'jackknifes',
    name: 'Jackknifes',
    category: 'upper',
  },
  standing_ab_twists: {
    id: 'standing_ab_twists',
    name: 'Standing Ab Twists',
    category: 'rotation',
  },
  flutter_kicks: {
    id: 'flutter_kicks',
    name: 'Flutter Kicks',
    category: 'lower',
  },
  v_ups: {
    id: 'v_ups',
    name: '"V" Ups',
    category: 'upper',
  },
  tuck_planks: {
    id: 'tuck_planks',
    name: 'Tuck Planks',
    category: 'anti_extension',
  },
  scissors: {
    id: 'scissors',
    name: 'Scissors',
    category: 'lower',
  },
  upper_circle_crunches: {
    id: 'upper_circle_crunches',
    name: 'Upper Circle Crunches',
    category: 'upper',
  },
  any_ball_btb_pass: {
    id: 'any_ball_btb_pass',
    name: 'The "Any Ball" BTB Pass',
    category: 'rotation',
  },
  heels_to_the_heavens: {
    id: 'heels_to_the_heavens',
    name: 'Heels to the Heavens',
    category: 'lower',
  },
  crunch_and_twists: {
    id: 'crunch_and_twists',
    name: 'Crunch and Twists',
    category: 'rotation',
  },
  hands_free_tucks: {
    id: 'hands_free_tucks',
    name: 'Hands Free Tucks',
    category: 'lower',
  },
};

// Kategorien bleiben eine lokale fachliche Einordnung fuer Learn/Shuffle.
export const SIXPACK_CATEGORIES = [
  {
    id: 'lower',
    label: 'Lower Abs',
    exercises: ['Hands Back Tucks', 'Hands Free Tucks', 'ISO Reverse Crunches', 'Flutter Kicks', 'Scissors', 'Heels to the Heavens'],
  },
  {
    id: 'anti_extension',
    label: 'Plank / Anti-Extension',
    exercises: ['Marching Planks', 'Mountain Climbers', 'Tuck Planks'],
  },
  {
    id: 'lateral_chain',
    label: 'Obliques / Lateral Chain',
    exercises: ['Side Plank Lifts', 'Side Crunches'],
  },
  {
    id: 'rotation',
    label: 'Rotation',
    exercises: ['Seated Ab Circles', 'Russian "V" Tuck Twists', 'Bent Knee Windshield Wipers', 'Standing Ab Twists', 'The "Any Ball" BTB Pass', 'Crunch and Twists'],
  },
  {
    id: 'upper',
    label: 'Upper Abs',
    exercises: ['90/90 Crunch', 'Jackknifes', '"V" Ups', 'Upper Circle Crunches'],
  },
];

export const SIXPACK_EXERCISE_POOL = Object.values(SIXPACK_EXERCISES).map((exercise) => exercise.name);

// Verifiziert aus den Nutzer-Screenshots von Week 1.
export const VERIFIED_WEEK1_WORKOUTS = {
  1: {
    source: 'user_screenshot_week1_day1',
    totalSeconds: 315,
    items: [
      { type: 'exercise', exerciseId: 'hands_back_tucks', name: 'Hands Back Tucks', seconds: 30 },
      { type: 'exercise', exerciseId: 'marching_planks', name: 'Marching Planks', seconds: 60 },
      { type: 'exercise', exerciseId: 'side_plank_lifts', name: 'Side Plank Lifts', seconds: 30 },
      { type: 'exercise', exerciseId: 'side_plank_lifts', name: 'Side Plank Lifts', seconds: 30 },
      { type: 'rest', name: 'Rest', seconds: 45 },
      { type: 'exercise', exerciseId: 'seated_ab_circles', name: 'Seated Ab Circles', seconds: 30 },
      { type: 'exercise', exerciseId: 'seated_ab_circles', name: 'Seated Ab Circles', seconds: 30 },
      { type: 'exercise', exerciseId: 'ninety_ninety_crunch', name: '90/90 Crunch', seconds: 30 },
      { type: 'exercise', exerciseId: 'russian_v_tuck_twists', name: 'Russian "V" Tuck Twists', seconds: 30 },
    ],
  },
  2: {
    source: 'user_screenshot_week1_day2',
    totalSeconds: 315,
    items: [
      { type: 'exercise', exerciseId: 'iso_reverse_crunches', name: 'ISO Reverse Crunches', seconds: 30 },
      { type: 'exercise', exerciseId: 'mountain_climbers', name: 'Mountain Climbers', seconds: 60 },
      { type: 'exercise', exerciseId: 'bent_knee_windshield_wipers', name: 'Bent Knee Windshield Wipers', seconds: 60 },
      { type: 'rest', name: 'Rest', seconds: 45 },
      { type: 'exercise', exerciseId: 'side_crunches', name: 'Side Crunches', seconds: 30 },
      { type: 'exercise', exerciseId: 'side_crunches', name: 'Side Crunches', seconds: 30 },
      { type: 'exercise', exerciseId: 'jackknifes', name: 'Jackknifes', seconds: 30 },
      { type: 'exercise', exerciseId: 'standing_ab_twists', name: 'Standing Ab Twists', seconds: 30 },
    ],
  },
  4: {
    source: 'user_screenshot_week1_day4',
    totalSeconds: 345,
    items: [
      { type: 'exercise', exerciseId: 'flutter_kicks', name: 'Flutter Kicks', seconds: 60 },
      { type: 'exercise', exerciseId: 'v_ups', name: '"V" Ups', seconds: 30 },
      { type: 'exercise', exerciseId: 'tuck_planks', name: 'Tuck Planks (opposite side)', seconds: 30 },
      { type: 'rest', name: 'Rest', seconds: 45 },
      { type: 'exercise', exerciseId: 'scissors', name: 'Scissors', seconds: 60 },
      { type: 'exercise', exerciseId: 'upper_circle_crunches', name: 'Upper Circle Crunches', seconds: 30 },
      { type: 'exercise', exerciseId: 'upper_circle_crunches', name: 'Upper Circle Crunches', seconds: 30 },
      { type: 'exercise', exerciseId: 'any_ball_btb_pass', name: 'The "Any Ball" BTB Pass', seconds: 30 },
      { type: 'exercise', exerciseId: 'any_ball_btb_pass', name: 'The "Any Ball" BTB Pass', seconds: 30 },
    ],
  },
  5: {
    source: 'user_screenshot_week1_day5',
    totalSeconds: 345,
    items: [
      { type: 'exercise', exerciseId: 'heels_to_the_heavens', name: 'Heels to the Heavens', seconds: 30 },
      { type: 'exercise', exerciseId: 'mountain_climbers', name: 'Mountain Climbers', seconds: 30 },
      { type: 'exercise', exerciseId: 'side_plank_lifts', name: 'Side Plank Lifts', seconds: 60 },
      { type: 'exercise', exerciseId: 'side_plank_lifts', name: 'Side Plank Lifts', seconds: 60 },
      { type: 'rest', name: 'Rest', seconds: 45 },
      { type: 'exercise', exerciseId: 'side_crunches', name: 'Side Crunches', seconds: 30 },
      { type: 'exercise', exerciseId: 'side_crunches', name: 'Side Crunches', seconds: 30 },
      { type: 'exercise', exerciseId: 'crunch_and_twists', name: 'Crunch and Twists', seconds: 30 },
      { type: 'exercise', exerciseId: 'standing_ab_twists', name: 'Standing Ab Twists', seconds: 30 },
    ],
  },
  6: {
    source: 'user_screenshot_week1_day6',
    totalSeconds: 285,
    items: [
      { type: 'exercise', exerciseId: 'iso_reverse_crunches', name: 'ISO Reverse Crunches', seconds: 30 },
      { type: 'exercise', exerciseId: 'hands_free_tucks', name: 'Hands Free Tucks', seconds: 30 },
      { type: 'exercise', exerciseId: 'seated_ab_circles', name: 'Seated Ab Circles', seconds: 30 },
      { type: 'exercise', exerciseId: 'seated_ab_circles', name: 'Seated Ab Circles', seconds: 30 },
      { type: 'rest', name: 'Rest', seconds: 45 },
      { type: 'exercise', exerciseId: 'scissors', name: 'Scissors', seconds: 30 },
      { type: 'exercise', exerciseId: 'ninety_ninety_crunch', name: '90/90 Crunch', seconds: 30 },
      { type: 'exercise', exerciseId: 'upper_circle_crunches', name: 'Upper Circle Crunches', seconds: 30 },
      { type: 'exercise', exerciseId: 'upper_circle_crunches', name: 'Upper Circle Crunches', seconds: 30 },
    ],
  },
};

const CATEGORY_FOCUS = {
  lower: 'Lower Abs',
  anti_extension: 'Plank / Anti-Extension',
  lateral_chain: 'Obliques / Lateral Chain',
  rotation: 'Rotation',
  upper: 'Upper Abs',
};

export const SIXPACK_EXERCISE_DETAILS = Object.fromEntries(
  Object.entries(SIXPACK_EXERCISES).map(([id, exercise]) => [
    id,
    {
      ...exercise,
      focusLabel: CATEGORY_FOCUS[exercise.category] || 'Core',
      verifiedDays: Object.entries(VERIFIED_WEEK1_WORKOUTS)
        .filter(([, workout]) => workout.items.some((item) => item.exerciseId === id))
        .map(([day]) => Number(day)),
    },
  ]),
);

// Spiegel von kb/exercises/calisthenics/*.yml (Skill-Progressionen, kein
// vollständiges ExerciseRecord-Schema — nur id/name/tier/progressions, daher
// hier als eigene, handgepflegte Liste statt über den Exercise-Resolver).
export const SIXPACK_CALISTHENICS_SKILLS = [
  { id: 'front-lever', name: 'Front Lever', tier: 'free', progressions: ['Scapula Pulls', 'Tuck Front Lever', 'Advanced Tuck Front Lever', 'One Leg Front Lever', 'Straddle Front Lever', 'Full Front Lever'] },
  { id: 'back-lever', name: 'Back Lever', tier: 'free', progressions: ['Skin the Cat', 'Tuck Back Lever', 'Advanced Tuck Back Lever', 'Straddle Back Lever', 'Full Back Lever'] },
  { id: 'planche', name: 'Planche', tier: 'free', progressions: ['Plank', 'Planche Lean', 'Frog Stand', 'Tuck Planche', 'Advanced Tuck Planche', 'Straddle Planche', 'Full Planche'] },
  { id: 'muscle-up', name: 'Muscle-Up', tier: 'free', progressions: ['Klimmzüge', 'Explosive Klimmzüge', 'Chest-to-Bar Pull-Ups', 'Bar Dips', 'Muscle-Up Negative', 'Muscle-Up'] },
  { id: 'handstand-pushup', name: 'Handstand Push-Up', tier: 'free', progressions: ['Pike Push-Ups', 'Elevated Pike Push-Ups', 'Wall Handstand Push-Ups', 'Freestanding Handstand Push-Ups'] },
  { id: 'pistol-squat', name: 'Pistol Squat', tier: 'free', progressions: ['Assisted Squats', 'Deep Squats', 'Step-Ups', 'Negative Pistol Squats', 'Full Pistol Squat'] },
  { id: 'v-sit', name: 'V-Sit', tier: 'free', progressions: ['Tuck L-Sit', 'L-Sit', 'Straddle L-Sit', 'V-Sit'] },
  { id: 'dragon-flag', name: 'Dragon Flag', tier: 'pro', progressions: ['Candlestick', 'Dragon Flag Negatives', 'Tuck Dragon Flag', 'Full Dragon Flag'] },
  { id: 'human-flag', name: 'Human Flag', tier: 'pro', progressions: ['Support Holds', 'Vertical Flag', 'Tuck Human Flag', 'Straddle Human Flag', 'Full Human Flag'] },
  { id: 'hefesto', name: 'Hefesto', tier: 'pro', progressions: ['Korean Dips', 'Back Lever Pull-Ups', 'Hefesto Negatives', 'Full Hefesto'] },
  { id: 'one-arm-handstand', name: 'One Arm Handstand', tier: 'pro', progressions: ['Handstand Balance', 'Handstand Shifting', 'Finger Support Handstand', 'One Arm Handstand'] },
  { id: 'one-arm-pullup', name: 'One Arm Pull-Up', tier: 'pro', progressions: ['Archer Pull-Ups', 'Weighted Pull-Ups', 'One Arm Negative Pull-Ups', 'Assisted One Arm Pull-Up'] },
  { id: 'one-arm-pushup', name: 'One Arm Push-Up', tier: 'pro', progressions: ['Incline One Arm Push-Up', 'Archer Push-Ups', 'One Arm Push-Up'] },
  { id: 'shrimp-squat', name: 'Shrimp Squat', tier: 'pro', progressions: ['Airborne Squat', 'Shrimp Squat (einarmig halten)', 'Full Shrimp Squat'] },
];
