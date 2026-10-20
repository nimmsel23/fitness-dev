import { MUSCLE_GEOMETRY } from './muscleGeometry.js';

export function muscleHighlights(exercise) {
  const regions = {};
  for (const muscle of exercise.secondaryMuscles || []) {
    for (const id of muscle.regions) regions[id] = 1;
  }
  for (const muscle of exercise.primaryMuscles || []) {
    for (const id of muscle.regions) regions[id] = 2;
  }
  return regions;
}

export default function ExerciseMuscles({ exercise }) {
  const regions = muscleHighlights(exercise);
  const primary = exercise.primaryMuscles || [];
  const secondary = exercise.secondaryMuscles || [];
  const views = ['FRONT'];
  if ([...primary, ...secondary].some(muscle => muscle.view === 'BACK')) views.push('BACK');
  return (
    <section className="px-4 py-3" aria-label="Beanspruchte Muskeln">
      <h2 className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#e2001a' }}>Muskeln</h2>
      <div className="flex items-start gap-4">
        <div className="flex shrink-0 gap-2" aria-hidden="true">
          {views.map(view => <svg key={view} viewBox={view === 'FRONT' ? '0 0 35 93' : '37 0 35 93'} className="h-52 w-20">
            {MUSCLE_GEOMETRY.filter(part => part.view === view).map(part => <path key={part.id} d={part.path} fill={regions[part.id] === 2 ? '#e2001a' : regions[part.id] === 1 ? '#f59e0b' : '#353535'} stroke="#111" strokeWidth="0.12" />)}
          </svg>)}
        </div>
        <div className="min-w-0 space-y-3 text-sm">
          <div><h3 className="font-bold" style={{ color: '#ff4359' }}>Hauptmuskeln</h3>
            {primary.length ? <ul>{primary.map(muscle => <li key={muscle.id} className="mt-1">{muscle.name}<span className="block text-xs" style={{ color: 'var(--dim)' }}>{muscle.latinName}</span></li>)}</ul> : <p>Noch nicht hinterlegt.</p>}
          </div>
          {secondary.length > 0 && <div><h3 className="font-bold" style={{ color: '#f59e0b' }}>Unterstützend</h3><ul>{secondary.map(muscle => <li key={muscle.id} className="mt-1">{muscle.name}</li>)}</ul></div>}
        </div>
      </div>
      <p className="mt-2 text-xs" style={{ color: 'var(--dim)' }}>Rot: Hauptmuskeln · Orange: unterstützend. Tief liegende Muskeln werden über ihrer Körperregion markiert.</p>
    </section>
  );
}
