// Shared by standalone and Fitness generators. IDs/regions come from the KB.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

// Eigene Clips: public/videos/<exercise_id>.mp4|webm. Liegt eine Datei dort, ersetzt sie die
// fremde Demo aus catalog/exercise-videos.yml (ein explizites video_url am Eintrag bleibt vorrangig).
// ?v=<Hash> macht die URL pro Dateiinhalt eindeutig, damit ein ersetzter Clip nicht aus dem
// Video-Cache (Cache Storage, Schlüssel = URL) oder dem Browser-Cache veraltet ausgespielt wird.
const CLIP_EXTENSIONS = ['mp4', 'webm'];
const DEFAULT_CLIPS_DIR = join(dirname(fileURLToPath(import.meta.url)), 'public/videos');

export function ownClipUrl(id, clipsDir = DEFAULT_CLIPS_DIR) {
  for (const ext of CLIP_EXTENSIONS) {
    const file = join(clipsDir, `${id}.${ext}`);
    if (!existsSync(file)) continue;
    const hash = createHash('sha1').update(readFileSync(file)).digest('hex').slice(0, 8);
    return `./videos/${id}.${ext}?v=${hash}`;
  }
  return null;
}

export function loadMuscles(directory) {
  const records = {};
  if (!existsSync(directory)) return records;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) Object.assign(records, loadMuscles(path));
    else if (entry.name.endsWith('.yml')) {
      const record = yaml.load(readFileSync(path, 'utf8'));
      if (record?.id) records[record.id] = record;
    }
  }
  return records;
}

const videos = yaml.load(readFileSync(new URL('./catalog/exercise-videos.yml', import.meta.url), 'utf8')) || {};

export function exerciseContent(exercise, muscles, clipsDir) {
  const describe = id => {
    const record = muscles[id];
    return {
      id, name: record?.label_de || record?.display_name || id.replace(/^\d+_/, '').replaceAll('_', ' '),
      latinName: record?.label_lat || '',
      view: record?.viz?.body_muscles?.view || null,
      regions: record?.viz?.body_muscles?.ids || [],
    };
  };
  const video = videos[exercise.id];
  const ownClip = exercise.video_url ? null : ownClipUrl(exercise.id, clipsDir);
  return {
    ...(ownClip ? { videoUrl: ownClip } : video && !exercise.video_url ? { videoUrl: video.url, videoSource: video.source, videoAuthor: video.author } : {}),
    primaryMuscles: (exercise.primary_muscles || []).map(describe),
    secondaryMuscles: (exercise.secondary_muscles || []).map(describe),
    stabilizers: (exercise.stabilizers || []).map(describe),
  };
}
