import { useEffect, useRef } from 'react';

export function isEdgeBackGesture(start, end) {
  if (!start || !end) return false;
  const dx = end.clientX - start.x;
  const dy = Math.abs(end.clientY - start.y);
  return start.edge >= 0 && start.edge <= 40 && dx >= 80 && dx > dy * 2;
}

// Invisible left-edge back gesture for full-screen embedded Skills/6Pack.
// Vertical scrolling, controls, dialogs and active workouts retain their gestures.
export function useEdgeBack(onBack) {
  const ref = useRef(null);
  const callback = useRef(onBack);
  callback.current = onBack;
  useEffect(() => {
    const element = ref.current;
    let start = null;
    let running = false;
    const blocked = () => running || element.querySelector('[data-no-swipe="true"], .skills-runner, dialog[open]');
    const onRunner = event => { running = Boolean(event.detail); start = null; };
    const begin = event => {
      start = null;
      if (event.touches.length !== 1 || blocked()) return;
      if (event.target.closest('input, textarea, select, button, a, video, iframe, [role="slider"], [data-no-swipe="true"]')) return;
      const touch = event.touches[0];
      const edge = touch.clientX - element.getBoundingClientRect().left;
      if (edge < 0 || edge > 40) return;
      start = { x: touch.clientX, y: touch.clientY, edge };
    };
    const cancel = () => { start = null; };
    const move = event => {
      if (!start) return;
      if (event.touches.length !== 1) return cancel();
      const touch = event.touches[0];
      const dx = touch.clientX - start.x;
      const dy = Math.abs(touch.clientY - start.y);
      if (dy > 12 && dy >= Math.abs(dx)) return cancel();
      if (dx > 12 && dx > dy * 2 && event.cancelable) event.preventDefault();
    };
    const end = event => {
      const origin = start;
      start = null;
      if (!blocked() && isEdgeBackGesture(origin, event.changedTouches[0])) {
        if (event.cancelable) event.preventDefault();
        callback.current();
      }
    };
    element.addEventListener('touchstart', begin, { passive: true });
    element.addEventListener('touchmove', move, { passive: false });
    element.addEventListener('touchend', end, { passive: false });
    element.addEventListener('touchcancel', cancel);
    window.addEventListener('skills-runner', onRunner);
    return () => {
      element.removeEventListener('touchstart', begin);
      element.removeEventListener('touchmove', move);
      element.removeEventListener('touchend', end);
      element.removeEventListener('touchcancel', cancel);
      window.removeEventListener('skills-runner', onRunner);
    };
  }, []);
  return ref;
}
