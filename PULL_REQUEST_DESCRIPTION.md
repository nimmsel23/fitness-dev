# Pull request checklist

- [x] Focus management
- [x] ARIA attributes
- [x] Keyboard interactions (Escape, Tab trap)
- [x] Body scroll lock
- [x] Backdrop click behavior
- [x] prefers-reduced-motion respected

---

This PR introduces a new accessible React Modal component at `src/components/Modal/Modal.jsx` with accompanying styles.

Why
- Existing modal usage in the app is inconsistent and lacks accessible features. This component centralizes the behavior and improves keyboard and screen reader support.

What changed
- Added Modal.jsx and Modal.css
- Modal traps focus, restores it on close, blocks body scroll, and supports backdrop closing.

How to test
1. Run the app and open the modal via a button.
2. Verify focus moves into the modal and is restored when closed.
3. Press Escape to close the modal.
4. Try Tab / Shift+Tab to ensure focus is trapped.
5. Check behavior with reduced motion and on mobile.

Notes
- If you'd like, I can follow up by migrating existing modal calls to this new component.
