import { useEffect } from 'react';

/**
 * useEscapeKey — schließt ein Modal/Overlay/Sheet per ESC-Taste.
 * Warum ein gemeinsamer Hook statt Copy-Paste: mehrere Modals brauchten
 * exakt dasselbe keydown-Muster (Escape → onClose), vorher an mehreren
 * Stellen einzeln von Hand geschrieben (AuthGateModal, ExerciseSearchOverlay,
 * HabitJournalModal, Modal/Modal.jsx) — neue Modals sollen das nicht erneut
 * duplizieren. Bewusst NICHT in bereits bestehende Modals mit eigenem
 * Escape-Handling reingepresst (kein Zwangs-Refactor bestehenden Codes).
 *
 * @param {() => void} onEscape - Callback, wenn Escape gedrückt wird
 * @param {boolean} active - Listener nur registrieren wenn true (z.B. offen)
 */
export function useEscapeKey(onEscape, active = true) {
  useEffect(() => {
    if (!active) return undefined;

    function handleKeyDown(event) {
      if (event.key === 'Escape') onEscape?.();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [active, onEscape]);
}
