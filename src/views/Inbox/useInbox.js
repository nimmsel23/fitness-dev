import { useState, useEffect, useCallback } from 'react';
import { getInbox, getGlobalInbox, approveInbox, deleteInbox, reenrichInbox, getAllExercises } from '@db';

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function asList(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (value === null || value === undefined || value === '') return [];
  return [String(value)];
}

function isExpert(exercise) {
  const source = String(exercise?.source || '').toLowerCase();
  const tags = Array.isArray(exercise?.tags) ? exercise.tags : [];
  return source === 'expert' || source === 'approved' || tags.includes('expert');
}

function buildExpertRefs(exercises) {
  const refs = { wger: new Set(), yuhonas: new Set(), names: new Set() };
  for (const ex of Array.isArray(exercises) ? exercises : []) {
    if (!isExpert(ex)) continue;
    if (ex.wger_id) refs.wger.add(String(ex.wger_id));
    if (ex.yuhonas_id) refs.yuhonas.add(String(ex.yuhonas_id));
    const external = ex.external_ids || {};
    for (const id of asList(external.wger)) refs.wger.add(String(id));
    for (const id of asList(external.yuhonas)) refs.yuhonas.add(String(id));
    for (const value of [
      ex.display_name, ex.german, ex.english, ex.name, ex.exercise_id, ex.id,
      ...(Array.isArray(ex.search_aliases) ? ex.search_aliases : []),
      ...(Array.isArray(ex.aliases) ? ex.aliases : []),
    ]) {
      const normalized = normalizeText(value);
      if (normalized) refs.names.add(normalized);
    }
  }
  return refs;
}

function isSupersededByExpert(entry, refs) {
  const data = entry?.exercises?.[0] || entry?.enriched || entry || {};
  if (!data || isExpert(data)) return false;
  if (data.wger_id && refs.wger.has(String(data.wger_id))) return true;
  if (data.yuhonas_id && refs.yuhonas.has(String(data.yuhonas_id))) return true;
  const external = data.external_ids || {};
  if (asList(external.wger).some((id) => refs.wger.has(String(id)))) return true;
  if (asList(external.yuhonas).some((id) => refs.yuhonas.has(String(id)))) return true;
  const names = [
    data.display_name, data.german, data.english, data.name, data.exercise_id, data.id,
  ].map(normalizeText).filter(Boolean);
  return names.some((value) => refs.names.has(value));
}

export function useInbox({ global = false } = {}) {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [actioning, setActioning] = useState(null);
  const [toast, setToast]         = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2200); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [data, allExercises] = await Promise.all([
        global ? getGlobalInbox() : getInbox(),
        getAllExercises().catch(() => []),
      ]);
      const refs = buildExpertRefs(allExercises);
      const visible = (Array.isArray(data) ? data : []).filter((entry) => !isSupersededByExpert(entry, refs));
      setExercises(visible);
    } catch {
      showToast('Inbox konnte nicht geladen werden');
    } finally {
      setLoading(false);
    }
  }, [global]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const handleInboxUpdate = () => {
      load();
    };
    window.addEventListener('fitness-inbox-updated', handleInboxUpdate);
    return () => {
      window.removeEventListener('fitness-inbox-updated', handleInboxUpdate);
    };
  }, [load]);

  async function approve(fileId) {
    setActioning(fileId);
    try {
      const ex = exercises.find(e => e.file_id === fileId);
      const userId = ex?.userId || null;
      await approveInbox(fileId, userId);
      setExercises(prev => prev.filter(ex => ex.file_id !== fileId));
      showToast('Freigegeben ✓');
    } catch {
      showToast('Fehler beim Freigeben');
    } finally {
      setActioning(null);
    }
  }

  async function reenrich(fileId) {
    setActioning(fileId);
    try {
      const ex = exercises.find(e => e.file_id === fileId);
      const userId = ex?.userId || null;
      const result = await reenrichInbox(fileId, userId, ex);
      if (result?.ok) {
        showToast('Neu angereichert ✓');
        await load();
      } else {
        showToast('Anreicherung fehlgeschlagen');
      }
    } catch {
      showToast('Anreicherung fehlgeschlagen');
    } finally {
      setActioning(null);
    }
  }

  async function remove(fileId) {
    setActioning(fileId);
    try {
      const ex = exercises.find(e => e.file_id === fileId);
      const userId = ex?.userId || null;
      await deleteInbox(fileId, userId);
      setExercises(prev => prev.filter(ex => ex.file_id !== fileId));
      showToast('Gelöscht');
    } catch {
      showToast('Fehler beim Löschen');
    } finally {
      setActioning(null);
    }
  }

  return { exercises, loading, actioning, toast, approve, remove, reenrich };
}
