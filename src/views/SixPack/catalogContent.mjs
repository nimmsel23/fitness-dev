// Shared by standalone and Fitness generators. IDs/regions come from the KB.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import yaml from 'js-yaml';

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

export function exerciseContent(exercise, muscles) {
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
  return {
    ...(video && !exercise.video_url ? { videoUrl: video.url, videoSource: video.source, videoAuthor: video.author } : {}),
    primaryMuscles: (exercise.primary_muscles || []).map(describe),
    secondaryMuscles: (exercise.secondary_muscles || []).map(describe),
    stabilizers: (exercise.stabilizers || []).map(describe),
  };
}
