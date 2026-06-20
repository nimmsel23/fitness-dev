import { useState, useEffect, useCallback } from 'react';
import { getInbox, getGlobalInbox, approveInbox, deleteInbox } from '@db';

export function useInbox({ global = false } = {}) {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [actioning, setActioning] = useState(null);
  const [toast, setToast]         = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2200); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await (global ? getGlobalInbox() : getInbox());
      setExercises(Array.isArray(data) ? data : []);
    } catch {
      showToast('Inbox konnte nicht geladen werden');
    } finally {
      setLoading(false);
    }
  }, [global]);

  useEffect(() => { load(); }, [load]);

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

  return { exercises, loading, actioning, toast, approve, remove };
}
