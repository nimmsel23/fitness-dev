import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Lock, Check, Circle } from 'lucide-react';

const SKILLS_STORAGE_KEY = 'fitness-skills-progress-v1';

// Skills + Progressionen 1:1 nach Thenics-App-Struktur (Nutzer-Recherche
// 2026-08-12, Play Store + Reddit r/bodyweightfitness Community-Reihenfolge).
// tier: 'free' | 'pro' — rein informativ (unsere App hat kein Bezahlmodell,
// beide Tiers sind hier gleichermaßen nutzbar).
const SKILLS = [
  { id: 'muscle-up', name: 'Muscle-Up', tier: 'free', progressions: ['Klimmzüge', 'Explosive Klimmzüge', 'Chest-to-Bar Pull-Ups', 'Bar Dips', 'Muscle-Up Negative', 'Muscle-Up'] },
  { id: 'planche', name: 'Planche', tier: 'free', progressions: ['Plank', 'Planche Lean', 'Frog Stand', 'Tuck Planche', 'Advanced Tuck Planche', 'Straddle Planche', 'Full Planche'] },
  { id: 'front-lever', name: 'Front Lever', tier: 'free', progressions: ['Scapula Pulls', 'Tuck Front Lever', 'Advanced Tuck Front Lever', 'One Leg Front Lever', 'Straddle Front Lever', 'Full Front Lever'] },
  { id: 'back-lever', name: 'Back Lever', tier: 'free', progressions: ['Skin the Cat', 'Tuck Back Lever', 'Advanced Tuck Back Lever', 'Straddle Back Lever', 'Full Back Lever'] },
  { id: 'handstand-pushup', name: 'Handstand Push-Up', tier: 'free', progressions: ['Pike Push-Ups', 'Elevated Pike Push-Ups', 'Wall Handstand Push-Ups', 'Freestanding Handstand Push-Ups'] },
  { id: 'v-sit', name: 'V-Sit', tier: 'free', progressions: ['Tuck L-Sit', 'L-Sit', 'Straddle L-Sit', 'V-Sit'] },
  { id: 'pistol-squat', name: 'Pistol Squat', tier: 'free', progressions: ['Assisted Squats', 'Deep Squats', 'Step-Ups', 'Negative Pistol Squats', 'Full Pistol Squat'] },
  { id: 'human-flag', name: 'Human Flag', tier: 'pro', progressions: ['Support Holds', 'Vertical Flag', 'Tuck Human Flag', 'Straddle Human Flag', 'Full Human Flag'] },
  { id: 'one-arm-pullup', name: 'One Arm Pull-Up', tier: 'pro', progressions: ['Archer Pull-Ups', 'Weighted Pull-Ups', 'One Arm Negative Pull-Ups', 'Assisted One Arm Pull-Up'] },
  { id: 'dragon-flag', name: 'Dragon Flag', tier: 'pro', progressions: ['Candlestick', 'Dragon Flag Negatives', 'Tuck Dragon Flag', 'Full Dragon Flag'] },
  { id: 'hefesto', name: 'Hefesto', tier: 'pro', progressions: ['Korean Dips', 'Back Lever Pull-Ups', 'Hefesto Negatives', 'Full Hefesto'] },
  { id: 'one-arm-handstand', name: 'One Arm Handstand', tier: 'pro', progressions: ['Handstand Balance', 'Handstand Shifting', 'Finger Support Handstand', 'One Arm Handstand'] },
  { id: 'one-arm-pushup', name: 'One Arm Push-Up', tier: 'pro', progressions: ['Incline One Arm Push-Up', 'Archer Push-Ups', 'One Arm Push-Up'] },
  { id: 'shrimp-squat', name: 'Shrimp Squat', tier: 'pro', progressions: ['Airborne Squat', 'Shrimp Squat (einarmig halten)', 'Full Shrimp Squat'] },
];

function loadProgress() {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(SKILLS_STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function SkillListScreen({ progress, onOpen }) {
  function SkillRow(skill) {
    const stage = progress[skill.id]?.stage ?? 0;
    const done = stage >= skill.progressions.length - 1;
    return (
      <button
        key={skill.id}
        onClick={() => onOpen(skill.id)}
        className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-colors"
        style={{ background: 'var(--bg2)', border: '1px solid var(--line)' }}
      >
        <div className="text-left">
          <div className="text-sm font-bold text-fit-ink">{skill.name}</div>
          <div className="text-[11px] mt-0.5" style={{ color: 'var(--dim)' }}>
            {done ? 'Gemeistert' : `Stufe ${stage + 1}/${skill.progressions.length}: ${skill.progressions[stage]}`}
          </div>
        </div>
        <ChevronRight size={16} style={{ color: 'var(--dim)' }} />
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {SKILLS.map(SkillRow)}
    </div>
  );
}

function formatMasteredAt(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

function SkillDetailScreen({ skill, stage, history, onBack, onMaster }) {
  const current = skill.progressions[stage];
  const next = skill.progressions[stage + 1];
  const isLast = stage >= skill.progressions.length - 1;

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 text-sm font-bold mb-5" style={{ color: 'var(--accent)' }}>
        <ChevronLeft size={18} /> Skills
      </button>

      <h3 className="text-xl font-black text-fit-ink mb-1">{skill.name}</h3>
      <div className="text-[11px] font-bold mb-5" style={{ color: 'var(--dim)' }}>
        Stufe {stage + 1} von {skill.progressions.length}
      </div>

      <div
        className="rounded-2xl px-5 py-6 mb-4 text-center"
        style={{ background: 'var(--accent-glow, rgba(0,0,0,0.05))', border: '1px solid var(--line)' }}
      >
        <div className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--accent)' }}>Jetzt</div>
        <div className="text-2xl font-black text-fit-ink mt-2">{current}</div>
      </div>

      {next && (
        <div className="text-center text-[11px] font-bold mb-5" style={{ color: 'var(--dim)', opacity: 0.8 }}>
          Als Nächstes: {next}
        </div>
      )}

      {!isLast ? (
        <button
          onClick={onMaster}
          className="w-full min-h-12 rounded-2xl flex items-center justify-center gap-2 text-sm font-black uppercase tracking-[0.16em]"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          <Check size={16} strokeWidth={3} /> Stufe gemeistert — nächste freischalten
        </button>
      ) : (
        <div className="text-center py-3 text-sm font-black" style={{ color: 'var(--accent)' }}>
          🏆 {skill.name} gemeistert
        </div>
      )}

      <div className="mt-6">
        <div className="text-[10px] font-black uppercase tracking-[0.15em] mb-2" style={{ color: 'var(--dim)' }}>Kette</div>
        <div className="flex flex-col gap-1.5">
          {skill.progressions.map((p, i) => (
            <div key={p} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'var(--bg2)', opacity: i > stage + 1 ? 0.4 : 1 }}>
              {i < stage ? <Check size={14} color="#22c55e" strokeWidth={3} />
                : i === stage ? <Circle size={14} style={{ color: 'var(--accent)' }} fill="var(--accent)" />
                : i > stage + 1 ? <Lock size={12} style={{ color: 'var(--dim)' }} />
                : <Circle size={14} style={{ color: 'var(--dim)' }} />}
              <span className="text-sm" style={{ color: i === stage ? 'var(--ink)' : 'var(--dim)', fontWeight: i === stage ? 700 : 500 }}>{p}</span>
            </div>
          ))}
        </div>
      </div>

      {history.length > 0 && (
        <div className="mt-6">
          <div className="text-[10px] font-black uppercase tracking-[0.15em] mb-2" style={{ color: 'var(--dim)' }}>Verlauf</div>
          <div className="flex flex-col gap-1.5">
            {history.slice().reverse().map((h, i) => (
              <div key={`${h.stage}-${h.masteredAt}-${i}`} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: 'var(--bg2)' }}>
                <div className="flex items-center gap-2">
                  <Check size={13} color="#22c55e" strokeWidth={3} />
                  <span className="text-sm" style={{ color: 'var(--ink)' }}>{h.name}</span>
                </div>
                <span className="text-[11px] font-mono" style={{ color: 'var(--dim)' }}>{formatMasteredAt(h.masteredAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SkillsCard() {
  const [progress, setProgress] = useState(() => loadProgress());
  const [openSkillId, setOpenSkillId] = useState(null);

  function persist(next) {
    setProgress(next);
    if (typeof window !== 'undefined') window.localStorage.setItem(SKILLS_STORAGE_KEY, JSON.stringify(next));
  }

  function master(skillId, skill) {
    const entry = progress[skillId] ?? { stage: 0, history: [] };
    if (entry.stage >= skill.progressions.length - 1) return;
    const masteredName = skill.progressions[entry.stage];
    persist({
      ...progress,
      [skillId]: {
        stage: entry.stage + 1,
        history: [...(entry.history || []), { stage: entry.stage, name: masteredName, masteredAt: new Date().toISOString() }],
      },
    });
  }

  const openSkill = openSkillId ? SKILLS.find(s => s.id === openSkillId) : null;

  // Lime-Akzent der Stoppuhr-Card gilt für den ganzen Skills-SubTab, gleiches
  // data-theme-Pattern wie SixPackPromiseCard.jsx.
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.getAttribute('data-theme');
    root.setAttribute('data-theme', 'skills');
    return () => {
      if (previous) root.setAttribute('data-theme', previous);
      else root.removeAttribute('data-theme');
    };
  }, []);

  return (
    <section
      className="rounded-[2rem] p-5 sm:p-6"
      style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))', border: '1px solid var(--line)' }}
    >
      <div className="mb-5">
        <div className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: 'var(--dim)', opacity: 0.7 }}>Calisthenics</div>
        <h3 className="text-xl sm:text-2xl font-black text-fit-ink mt-1">Skills</h3>
      </div>

      {openSkill ? (
        <SkillDetailScreen
          skill={openSkill}
          stage={progress[openSkill.id]?.stage ?? 0}
          history={progress[openSkill.id]?.history ?? []}
          onBack={() => setOpenSkillId(null)}
          onMaster={() => master(openSkill.id, openSkill)}
        />
      ) : (
        <SkillListScreen progress={progress} onOpen={setOpenSkillId} />
      )}
    </section>
  );
}
