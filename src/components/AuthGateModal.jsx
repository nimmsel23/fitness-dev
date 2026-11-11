import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

// Game-Boy-DMG-Palette — bewusst inline, weil sie außerhalb des
// Tailwind-Token-Systems (fit-*) als eigenständiger Retro-Look lebt.
const GB = {
  body: '#c8c4bb',
  bodyEdge: '#9d9990',
  bodyShade: '#b5b1a8',
  bezel: '#4d4d58',
  bezelEdge: '#3a3a44',
  bezelLabel: '#c9c9d2',
  screen: '#9bbc0f',
  screenEdge: '#7d9a0d',
  ink: '#0f380f',
  inkMid: '#306230',
  placeholder: '#5c7a12',
  btn: '#a12d5d',
  btnEdge: '#7e2144',
  pad: '#2d2d33',
  pill: '#8d8878',
  pillEdge: '#6b675e',
};

// LCD-Blinken (Cursor/Statuszeile) — keyframes lokal zur Komponente.
const BLINK_CSS = `
@keyframes gb-blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
.gb-blink { animation: gb-blink 1.2s steps(1) infinite; }
@keyframes gb-boot { from { transform: translateY(6px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.gb-boot { animation: gb-boot .35s ease-out both; }
.gb-input::placeholder { color: ${GB.placeholder}; font-weight: 400; }
`;

export default function AuthGateModal({
  open,
  onClose,
  authEmail,
  setAuthEmail,
  authPassword,
  setAuthPassword,
  authError,
  authRegistering,
  setAuthRegistering,
  onSubmit,
  onGoogleSignIn,
}) {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  // D-Pad hoch/runter = Fokus zwischen den Feldern bewegen (wie am Gerät).
  const focusField = (dir) => {
    const active = document.activeElement;
    if (dir === 'down' || (dir === 'up' && active === passwordRef.current)) {
      passwordRef.current?.focus();
    } else {
      emailRef.current?.focus();
    }
  };

  const inputClass =
    'gb-input w-full bg-transparent border-2 rounded-[3px] px-2.5 py-2 text-[12px] font-bold font-mono tracking-wider outline-none';
  const inputStyle = {
    borderColor: GB.inkMid,
    color: GB.ink,
    caretColor: GB.ink,
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-fit-scrim px-4 py-8 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
      role="presentation"
    >
      <style>{BLINK_CSS}</style>

      {/* Konsole: alles (Screen + Controls) hängt in EINEM Formular,
          damit A = physischer Submit-Button sein kann. */}
      <form
        onSubmit={(event) => { event.preventDefault(); onSubmit?.(event); }}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-gate-title"
        className="gb-boot relative w-full max-w-[400px] shrink-0 rounded-[18px] rounded-br-[38px] p-5 pt-4 select-none my-auto"
        style={{
          background: `linear-gradient(160deg, ${GB.body} 0%, ${GB.bodyShade} 100%)`,
          border: `2px solid ${GB.bodyEdge}`,
          boxShadow: `inset 0 2px 0 rgba(255,255,255,.35), inset 0 -3px 6px rgba(0,0,0,.12), 0 24px 48px -12px rgba(0,0,0,.55)`,
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Login-Overlay schließen"
          className="absolute right-3.5 top-3.5 z-10 rounded-[6px] p-1.5 transition-transform active:scale-90"
          style={{ background: GB.bodyShade, border: `2px solid ${GB.bodyEdge}`, color: '#6b675e' }}
        >
          <X size={13} strokeWidth={3} />
        </button>

        {/* ── Screen-Gehäuse mit Bezel ─────────────────────────────── */}
        <div
          className="rounded-[10px] rounded-tr-[22px] p-2.5 pb-3"
          style={{
            background: `linear-gradient(180deg, ${GB.bezelEdge}, ${GB.bezel})`,
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,.5)',
          }}
        >
          {/* Bezel-Beschriftung + Battery-LED */}
          <div className="flex items-end justify-between px-1 pb-1.5">
            <div
              className="text-[9px] font-black tracking-[0.28em] leading-none"
              style={{ color: GB.bezelLabel }}
            >
              <span style={{ color: '#8f9bb3' }}>VitalOS</span>{' '}
              <span style={{ color: '#e05252' }}>FITNESS</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[7px] font-black tracking-[0.2em]" style={{ color: GB.bezelLabel }}>
                BATTERY
              </span>
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: '#e05252', boxShadow: '0 0 6px #e05252' }}
              />
            </div>
          </div>

          {/* ── LCD-Screen: das eigentliche Formular ───────────────── */}
          <div
            className="rounded-[4px] p-4 space-y-3"
            style={{
              background: `linear-gradient(175deg, ${GB.screen} 0%, #8fae0e 100%)`,
              border: `2px solid ${GB.screenEdge}`,
              boxShadow: `inset 0 0 14px rgba(15,56,15,.35), inset 2px 2px 0 rgba(255,255,255,.25)`,
            }}
          >
            <div className="flex items-center justify-between" aria-hidden="true">
              <span className="text-[10px] font-black font-mono tracking-widest" style={{ color: GB.ink }}>
                {authRegistering ? 'NEUER SPIELSTAND' : 'SPIEL LADEN'}
              </span>
              <span className="text-[10px] font-mono gb-blink" style={{ color: GB.inkMid }}>
                ▮
              </span>
            </div>

            <h2
              id="auth-gate-title"
              className="text-[15px] leading-tight font-black font-mono tracking-wider"
              style={{ color: GB.ink, textShadow: `1px 1px 0 ${GB.screenEdge}` }}
            >
              {authRegistering ? 'ACCOUNT ERSTELLEN' : 'LOGIN'}
            </h2>

            <label className="block space-y-1">
              <span className="text-[9px] font-black font-mono tracking-[0.2em]" style={{ color: GB.inkMid }}>
                EMAIL
              </span>
              <input
                ref={emailRef}
                type="email"
                placeholder="spieler@vitalos.at"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                required
                autoComplete="email"
                className={inputClass}
                style={inputStyle}
              />
            </label>

            <label className="block space-y-1">
              <span className="text-[9px] font-black font-mono tracking-[0.2em]" style={{ color: GB.inkMid }}>
                PASSWORT
              </span>
              <input
                ref={passwordRef}
                type="password"
                placeholder="●●●●●●●●"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                required
                autoComplete="current-password"
                className={inputClass}
                style={inputStyle}
              />
            </label>

            {authError && (
              <p
                className="text-[10px] font-bold font-mono text-center leading-snug gb-blink"
                style={{ color: '#7a1f2b' }}
                role="alert"
              >
                ! {authError}
              </p>
            )}

            <p className="text-[9px] font-mono leading-snug" style={{ color: GB.inkMid }}>
              Demo-Modus aktiv · Login optional. Cloud-Sync (Firestore) wird
              nach dem Anmelden auf diesem Gerät aktiviert.
            </p>

            <button
              type="button"
              onClick={onGoogleSignIn}
              className="w-full flex items-center justify-center gap-2 border-2 rounded-[3px] px-3 py-2 text-[10px] font-black font-mono tracking-[0.18em] transition-transform active:translate-y-[1px]"
              style={{ borderColor: GB.inkMid, color: GB.ink, background: 'rgba(15,56,15,.08)' }}
            >
              GOOGLE LOGIN
            </button>
          </div>
        </div>

        {/* ── Controls: D-Pad + A/B ────────────────────────────────── */}
        <div className="mt-4 flex items-center justify-between px-1">
          {/* D-Pad */}
          <div className="relative h-[74px] w-[74px]" role="group" aria-label="Eingabe-Navigation">
            <div className="absolute inset-0 rounded-[10px] rotate-45" style={{ background: GB.pad, boxShadow: 'inset 0 0 6px rgba(0,0,0,.6)' }} />
            {[
              { pos: 'top-0 left-1/2 -translate-x-1/2', label: '▲', dir: 'up', aria: 'Fokus vorheriges Feld' },
              { pos: 'bottom-0 left-1/2 -translate-x-1/2', label: '▼', dir: 'down', aria: 'Fokus nächstes Feld' },
              { pos: 'left-0 top-1/2 -translate-y-1/2', label: '◀', dir: 'up', aria: 'Fokus vorheriges Feld' },
              { pos: 'right-0 top-1/2 -translate-y-1/2', label: '▶', dir: 'down', aria: 'Fokus nächstes Feld' },
            ].map(({ pos, label, dir, aria }) => (
              <button
                key={label}
                type="button"
                aria-label={aria}
                onClick={() => focusField(dir)}
                className={`absolute ${pos} h-[22px] w-[22px] -translate-y-1/2 flex items-center justify-center text-[8px] active:scale-90`}
                style={{ color: '#5a5a63' }}
              >
                <span className="translate-y-[3px]" style={{ color: '#55555e' }}>{label}</span>
              </button>
            ))}
          </div>

          {/* A/B — wie am Original um 25° geneigt, A = Submit */}
          <div className="flex items-center gap-3.5 -rotate-25 origin-center">
            <div className="flex flex-col items-center gap-1">
              <button
                type="button"
                onClick={() => setAuthRegistering(!authRegistering)}
                aria-label={authRegistering ? 'Zum Login wechseln' : 'Account erstellen'}
                className="h-11 w-11 rounded-full text-[13px] font-black transition-transform active:translate-y-[2px]"
                style={{
                  background: `radial-gradient(circle at 35% 30%, #c04f76, ${GB.btn} 60%, ${GB.btnEdge})`,
                  color: '#f3d7e0',
                  boxShadow: `0 3px 0 ${GB.btnEdge}, inset 0 1px 2px rgba(255,255,255,.35)`,
                }}
              >
                B
              </button>
              <span className="text-[8px] font-black tracking-[0.2em]" style={{ color: '#6b675e' }}>
                {authRegistering ? 'ANMELDEN' : 'NEU'}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <button
                type="submit"
                aria-label={authRegistering ? 'Account erstellen' : 'Anmelden'}
                className="h-11 w-11 rounded-full text-[13px] font-black transition-transform active:translate-y-[2px]"
                style={{
                  background: `radial-gradient(circle at 35% 30%, #c04f76, ${GB.btn} 60%, ${GB.btnEdge})`,
                  color: '#f3d7e0',
                  boxShadow: `0 3px 0 ${GB.btnEdge}, inset 0 1px 2px rgba(255,255,255,.35)`,
                }}
              >
                A
              </button>
              <span className="text-[8px] font-black tracking-[0.2em]" style={{ color: '#6b675e' }}>
                {authRegistering ? 'ERSTELLEN' : 'START'}
              </span>
            </div>
          </div>
        </div>

        {/* ── START/SELECT + Lautsprecher ──────────────────────────── */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-4 -rotate-25">
            {[
              { label: 'SELECT', action: () => setAuthRegistering(!authRegistering), aria: 'Zwischen Login und Registrierung wechseln' },
              { label: 'START', action: null, aria: 'Anmelden', submit: true },
            ].map(({ label, action, aria, submit }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <button
                  {...(submit ? { type: 'submit' } : { type: 'button', onClick: action })}
                  aria-label={aria}
                  className="h-2.5 w-12 rounded-full transition-transform active:translate-y-[1px]"
                  style={{
                    background: `linear-gradient(180deg, #a09b8f, ${GB.pill})`,
                    boxShadow: `0 2px 0 ${GB.pillEdge}`,
                  }}
                />
                <span className="text-[8px] font-black tracking-[0.24em]" style={{ color: '#6b675e' }}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Lautsprecher-Schlitze */}
          <div className="flex flex-col items-end gap-[5px] pr-1" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-[3px] w-[26px] rounded-full"
                style={{ background: GB.bodyShade, boxShadow: `inset 0 1px 1px rgba(0,0,0,.35)` }}
              />
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
