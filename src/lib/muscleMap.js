import { useEffect, useState } from 'react';

import { getStaticMuscleViz } from './kb/muscles.js';

const cache = getStaticMuscleViz();

export function useMuscleMap() {
  const [map, setMap] = useState(cache);
  useEffect(() => {
    setMap(cache);
  }, []);
  return map;
}

export function getMuscleMapSync() {
  return cache;
}
