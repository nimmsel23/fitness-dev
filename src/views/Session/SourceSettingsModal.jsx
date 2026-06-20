import { useState } from 'react';
import TabSettingsModal from '../../components/TabSettingsModal.jsx';

const SOURCES = [
  { key: 'wger',    label: 'wger',         desc: '~800 Übungen · Standard',       experimental: false },
  { key: 'yuhonas', label: 'yuhonas',       desc: '~800 Übungen · Bilder & GIFs',  experimental: false },
  { key: 'coach',   label: 'Coach Catalog', desc: 'Kuratiert · Anatomie-Detail',   experimental: true  },
];
const DEFAULTS = { wger: true, yuhonas: true, coach: false };
const STORAGE_KEY = 'fitness-sessionSources';

export default function SourceSettingsModal({ onClose }) {
  const [sources, setSources] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
  });

  function toggle(key) {
    const next = { ...DEFAULTS, ...sources, [key]: !isActive(key) };
    setSources(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function isActive(key) {
    return sources[key] !== undefined ? sources[key] : DEFAULTS[key];
  }

  return (
    <TabSettingsModal title="Training · Einstellungen" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-fit-dim/50 mb-5">Übungsquellen</p>
        {SOURCES.map(({ key, label, desc, experimental }) => {
          const active = isActive(key);
          return (
            <button
              key={key}
              onClick={() => toggle(key)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                active ? 'border-fit-accent/40 bg-fit-accent/5' : 'border-fit-line bg-fit-bg2 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-fit-ink">{label}</span>
                  {experimental && (
                    <span className="text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-fit-orange/20 text-fit-orange border border-fit-orange/30">Lab</span>
                  )}
                </div>
                <div className="text-[9px] font-bold text-fit-dim/50 mt-0.5">{desc}</div>
              </div>
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                active ? 'border-fit-accent bg-fit-accent' : 'border-fit-line/50'
              }`}>
                {active && <div className="w-2 h-2 bg-black rounded-sm" />}
              </div>
            </button>
          );
        })}
      </div>
    </TabSettingsModal>
  );
}
