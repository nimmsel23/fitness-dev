import { useEffect, useRef, useState } from 'react';
import BackHeader from './BackHeader.jsx';
import ExerciseMuscles from './ExerciseMuscles.jsx';
import { loadVideoUrls, videoDescriptor } from './exerciseMedia.js';

export default function ExerciseDetailScreen({ exercise, coaching, item, onBack, backLabel = 'Learn' }) {
  const heading = useRef(null);
  useEffect(() => { heading.current?.scrollIntoView({ block: 'start' }); heading.current?.focus({ preventScroll: true }); }, []);
  const [overrides] = useState(loadVideoUrls);
  const [videoError, setVideoError] = useState(false);
  if (!exercise) return null;
  const selectedVideo = overrides[exercise.name] ?? item?.videoUrl ?? exercise.videoUrl ?? '';
  const video = videoDescriptor(selectedVideo);
  const videoUrl = video?.src;
  return (
    <div ref={heading} tabIndex={-1} onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); onBack(); } }}>
      <BackHeader label={exercise.name} onBack={onBack} backLabel={backLabel} />
      <div className="px-4 pt-3 flex gap-2 flex-wrap text-xs font-bold" style={{ color: 'var(--dim)' }}>
        <span>{exercise.focusLabel}</span>
        {item?.seconds && <span>· {item.seconds} Sekunden im Workout</span>}
        {(coaching?.equipment || []).map(eq => <span key={eq}>· {eq}</span>)}
      </div>
      {item?.notes && <p className="px-4 pt-2 text-sm">{item.notes}</p>}
      <ExerciseMuscles exercise={exercise} />
      <section className="px-4 py-3" aria-label="Übungsvideo">
        <h2 className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#e2001a' }}>Video</h2>
        {videoUrl && !videoError ? video.kind === 'embed' ? <iframe key={videoUrl} src={videoUrl} title={`Übungsvideo: ${exercise.name}`} className="w-full aspect-video rounded-xl border-0 bg-black" loading="lazy" allow="encrypted-media; fullscreen; picture-in-picture" allowFullScreen /> : <video key={videoUrl} src={videoUrl} controls muted playsInline loop preload="metadata" className="w-full aspect-video rounded-xl bg-black object-contain" onError={() => setVideoError(true)} /> : <p className="rounded-xl p-4 text-sm" style={{ background: '#1a1a1a', color: 'var(--dim)' }}>{videoError ? 'Das Video konnte nicht geladen werden.' : 'Für diese Übung ist noch kein Video hinterlegt.'}</p>}
        {exercise.videoSource && selectedVideo === exercise.videoUrl && <a className="block mt-2 text-xs underline" style={{ color: 'var(--dim)' }} href={exercise.videoSource} target="_blank" rel="noopener noreferrer">Videoquelle: {exercise.videoAuthor || 'Original ansehen'}</a>}
        {(!videoUrl || videoError) && <a className="block mt-2 text-sm underline" href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${exercise.name} exercise demonstration ATHLEAN-X`)}`} target="_blank" rel="noopener noreferrer">Übungsvideo suchen</a>}
      </section>
      <section className="px-4 py-3" aria-label="Ausführung">
        <h2 className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#e2001a' }}>Ausführung</h2>
        {coaching?.coachingNotes?.length ? <ol className="space-y-2 list-decimal pl-5">{coaching.coachingNotes.map((note, i) => <li key={i} className="text-sm pl-1">{note}</li>)}</ol> : <p className="text-sm" style={{ color: 'var(--dim)' }}>Noch keine Anleitung hinterlegt.</p>}
      </section>
      {coaching?.commonErrors?.length > 0 && <section className="px-4 py-3 pb-6"><h2 className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#e2001a' }}>Häufige Fehler</h2><ul className="space-y-2">{coaching.commonErrors.map((error, i) => <li key={i} className="text-sm rounded-xl p-3" style={{ background: '#1a1a1a', color: 'var(--dim)' }}>{error}</li>)}</ul></section>}
    </div>
  );
}
