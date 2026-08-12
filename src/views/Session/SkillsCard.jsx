import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Lock, Check, Circle, Play, Pause, Flag, Trophy, ArrowUp, ArrowDown, Activity } from 'lucide-react';

const SKILLS_STORAGE_KEY = 'fitness-skills-progress-v1';

// Skills + Progressionen 1:1 nach Thenics-App-Struktur (Nutzer-Recherche
// 2026-08-12, Play Store + Reddit r/bodyweightfitness Community-Reihenfolge).
// tier: 'free' | 'pro' — rein informativ (unsere App hat kein Bezahlmodell,
// beide Tiers sind hier gleichermaßen nutzbar).
// category: 'push' | 'pull' | 'core' — eigene Einordnung für die UI-Gliederung,
// nicht aus der App selbst übernommen.
const SKILLS = [
  { id: 'muscle-up', name: 'Muscle-Up', tier: 'free', category: 'pull', progressions: ['Klimmzüge', 'Explosive Klimmzüge', 'Chest-to-Bar Pull-Ups', 'Bar Dips', 'Muscle-Up Negative', 'Muscle-Up'] },
  { id: 'planche', name: 'Planche', tier: 'free', category: 'push', progressions: ['Plank', 'Planche Lean', 'Frog Stand', 'Tuck Planche', 'Advanced Tuck Planche', 'Straddle Planche', 'Full Planche'] },
  { id: 'front-lever', name: 'Front Lever', tier: 'free', category: 'pull', progressions: ['Scapula Pulls', 'Tuck Front Lever', 'Advanced Tuck Front Lever', 'One Leg Front Lever', 'Straddle Front Lever', 'Full Front Lever'] },
  { id: 'back-lever', name: 'Back Lever', tier: 'free', category: 'pull', progressions: ['Skin the Cat', 'Tuck Back Lever', 'Advanced Tuck Back Lever', 'Straddle Back Lever', 'Full Back Lever'] },
  { id: 'handstand-pushup', name: 'Handstand Push-Up', tier: 'free', category: 'push', progressions: ['Pike Push-Ups', 'Elevated Pike Push-Ups', 'Wall Handstand Push-Ups', 'Freestanding Handstand Push-Ups'] },
  { id: 'v-sit', name: 'V-Sit', tier: 'free', category: 'core', progressions: ['Tuck L-Sit', 'L-Sit', 'Straddle L-Sit', 'V-Sit'] },
  { id: 'pistol-squat', name: 'Pistol Squat', tier: 'free', category: 'core', progressions: ['Assisted Squats', 'Deep Squats', 'Step-Ups', 'Negative Pistol Squats', 'Full Pistol Squat'] },
  { id: 'human-flag', name: 'Human Flag', tier: 'pro', category: 'core', progressions: ['Support Holds', 'Vertical Flag', 'Tuck Human Flag', 'Straddle Human Flag', 'Full Human Flag'] },
  { id: 'one-arm-pullup', name: 'One Arm Pull-Up', tier: 'pro', category: 'pull', progressions: ['Archer Pull-Ups', 'Weighted Pull-Ups', 'One Arm Negative Pull-Ups', 'Assisted One Arm Pull-Up'] },
  { id: 'dragon-flag', name: 'Dragon Flag', tier: 'pro', category: 'core', progressions: ['Candlestick', 'Dragon Flag Negatives', 'Tuck Dragon Flag', 'Full Dragon Flag'] },
  { id: 'hefesto', name: 'Hefesto', tier: 'pro', category: 'pull', progressions: ['Korean Dips', 'Back Lever Pull-Ups', 'Hefesto Negatives', 'Full Hefesto'] },
  { id: 'one-arm-handstand', name: 'One Arm Handstand', tier: 'pro', category: 'push', progressions: ['Handstand Balance', 'Handstand Shifting', 'Finger Support Handstand', 'One Arm Handstand'] },
  { id: 'one-arm-pushup', name: 'One Arm Push-Up', tier: 'pro', category: 'push', progressions: ['Incline One Arm Push-Up', 'Archer Push-Ups', 'One Arm Push-Up'] },
  { id: 'shrimp-squat', name: 'Shrimp Squat', tier: 'pro', category: 'core', progressions: ['Airborne Squat', 'Shrimp Squat (einarmig halten)', 'Full Shrimp Squat'] },
];

const CATEGORY_META = {
  push: { label: 'Druck-Skills (Push)', Icon: ArrowUp },
  pull: { label: 'Zug-Skills (Pull)', Icon: ArrowDown },
  core: { label: 'Core & Legs', Icon: Activity },
};

// Eigenständiges Hash-Query-Param `skill=<id>` — bewusst nicht über App.jsx's
// zentralen parseHashRoute/buildHashRoute geführt (der kennt nur tab/subTab +
// date), um dessen Session-Routing nicht anzufassen. Segment/Query-Teil vor
// dem `?` bleibt beim Setzen unangetastet.
function getSkillIdFromHash() {
  if (typeof window === 'undefined') return null;
  const [, queryPart = ''] = window.location.hash.split('?');
  return new URLSearchParams(queryPart).get('skill');
}

function setSkillIdInHash(skillId) {
  if (typeof window === 'undefined') return;
  const [pathPart = '', queryPart = ''] = window.location.hash.replace(/^#\/?/, '').split('?');
  const params = new URLSearchParams(queryPart);
  if (skillId) params.set('skill', skillId);
  else params.delete('skill');
  const query = params.toString();
  window.history.replaceState(null, '', `#${pathPart}${query ? `?${query}` : ''}`);
}

function loadProgress() {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(SKILLS_STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function SkillRow({ skill, progress, onOpen, isLast }) {
  const stage = progress[skill.id]?.stage ?? 0;
  const done = stage >= skill.progressions.length - 1;
  return (
    <button
      onClick={() => onOpen(skill.id)}
      className="w-full flex items-center justify-between gap-3 px-1 py-3 text-left transition-colors hover:opacity-80"
      style={{ borderBottom: isLast ? 'none' : '1px solid var(--line)' }}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-fit-ink truncate">{skill.name}</span>
          {skill.tier === 'pro' && <Lock size={11} style={{ color: 'var(--dim)', opacity: 0.6 }} />}
        </div>
        <div className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--dim)' }}>
          {done ? 'Gemeistert' : `Stufe ${stage + 1}/${skill.progressions.length} · ${skill.progressions[stage]}`}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {done && <Trophy size={13} style={{ color: 'var(--accent)' }} />}
        <ChevronRight size={15} style={{ color: 'var(--dim)', opacity: 0.5 }} />
      </div>
    </button>
  );
}

function CategoryGroup({ category, skills, progress, onOpen }) {
  const meta = CATEGORY_META[category];
  return (
    <div className="mb-4">
      <div className="flex items-center gap-1.5 mb-1 px-1">
        <meta.Icon size={11} style={{ color: 'var(--dim)', opacity: 0.6 }} />
        <span className="text-[9px] font-black uppercase tracking-[0.14em]" style={{ color: 'var(--dim)', opacity: 0.6 }}>
          {meta.label}
        </span>
      </div>
      <div className="rounded-2xl px-3" style={{ background: 'var(--bg2)' }}>
        {skills.map((skill, i) => (
          <SkillRow key={skill.id} skill={skill} progress={progress} onOpen={onOpen} isLast={i === skills.length - 1} />
        ))}
      </div>
    </div>
  );
}

function SkillTierSection({ tier, label, progress, onOpen }) {
  const tierSkills = SKILLS.filter(s => s.tier === tier);
  const categories = ['push', 'pull', 'core'].filter(c => tierSkills.some(s => s.category === c));

  return (
    <div className="mb-5">
      <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 px-1" style={{ color: 'var(--accent)' }}>
        {label}
      </div>
      {categories.map(category => (
        <CategoryGroup
          key={category}
          category={category}
          skills={tierSkills.filter(s => s.category === category)}
          progress={progress}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}

function SkillListScreen({ progress, onOpen }) {
  return (
    <div>
      <SkillTierSection tier="free" label="Kostenlose Skills" progress={progress} onOpen={onOpen} />
      <SkillTierSection tier="pro" label="Pro Skills" progress={progress} onOpen={onOpen} />
    </div>
  );
}

function formatMasteredAt(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

// Zehntelsekunden — Skill-Holds (Front Lever, Planche, L-Sit …) sind oft
// unter 10s, da zählt die Nachkommastelle.
function formatHoldTime(ms) {
  const totalTenths = Math.floor(Math.max(0, ms) / 100);
  return `${Math.floor(totalTenths / 10)}.${totalTenths % 10}s`;
}

// Eingebetteter Hold-Timer je Skill-Stufe — geloggte Attempts landen direkt
// in der Skill-Progress-Struktur (progress[skillId].holds), gefiltert nach
// aktueller Stufe angezeigt. Eigenständige, freie Stoppuhr bleibt daneben in
// WorkoutTimerCard.jsx bestehen, das hier ist bewusst an den Skill gebunden.
function SkillHoldTimer({ stageName, holdsForStage, onLog }) {
  const [running, setRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (!running) return undefined;
    const interval = window.setInterval(() => setElapsedMs(ms => ms + 100), 100);
    return () => window.clearInterval(interval);
  }, [running]);

  function toggle() {
    setRunning(r => !r);
  }

  function logHold() {
    if (elapsedMs <= 0) return;
    onLog(elapsedMs);
    setElapsedMs(0);
    setRunning(false);
  }

  const bestMs = holdsForStage.length ? Math.max(...holdsForStage.map(h => h.duration)) : null;

  return (
    <div className="rounded-2xl p-4 mb-4" style={{ background: 'var(--bg2)', border: '1px solid var(--line)' }}>
      <div className="text-[10px] font-black uppercase tracking-[0.15em] mb-2" style={{ color: 'var(--dim)' }}>
        Hold-Timer · {stageName}
      </div>
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="text-3xl font-black tabular-nums text-fit-ink">{formatHoldTime(elapsedMs)}</div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--accent)', color: '#000' }}
          >
            {running ? <Pause size={15} strokeWidth={3} /> : <Play size={15} strokeWidth={3} />}
          </button>
          <button
            onClick={logHold}
            disabled={elapsedMs <= 0}
            className="w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-30"
            style={{ background: 'var(--card)', border: '1px solid var(--line)', color: 'var(--ink)' }}
          >
            <Flag size={14} strokeWidth={2.7} />
          </button>
        </div>
      </div>

      {holdsForStage.length > 0 && (
        <div className="flex flex-col gap-1">
          {holdsForStage.slice().reverse().slice(0, 5).map((h, i) => {
            const isBest = h.duration === bestMs;
            return (
              <div key={h.at} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg" style={{ background: isBest ? 'var(--accent-glow, rgba(200,255,0,0.1))' : 'var(--card)' }}>
                <div className="flex items-center gap-1.5">
                  {isBest && <Trophy size={11} style={{ color: 'var(--accent)' }} />}
                  <span className="text-[10px] font-bold" style={{ color: 'var(--dim)' }}>
                    Versuch {holdsForStage.length - i}
                  </span>
                </div>
                <span className="text-xs font-black tabular-nums" style={{ color: isBest ? 'var(--accent)' : 'var(--ink)' }}>
                  {formatHoldTime(h.duration)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SkillDetailScreen({ skill, stage, history, holds, onBack, onMaster, onLogHold }) {
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

      <SkillHoldTimer
        stageName={current}
        holdsForStage={holds.filter(h => h.stage === stage)}
        onLog={(duration) => onLogHold(stage, duration)}
      />

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
  const [openSkillId, setOpenSkillIdState] = useState(() => getSkillIdFromHash());

  function setOpenSkillId(id) {
    setOpenSkillIdState(id);
    setSkillIdInHash(id);
  }

  function persist(next) {
    setProgress(next);
    if (typeof window !== 'undefined') window.localStorage.setItem(SKILLS_STORAGE_KEY, JSON.stringify(next));
  }

  function master(skillId, skill) {
    const entry = progress[skillId] ?? { stage: 0, history: [], holds: [] };
    if (entry.stage >= skill.progressions.length - 1) return;
    const masteredName = skill.progressions[entry.stage];
    persist({
      ...progress,
      [skillId]: {
        ...entry,
        stage: entry.stage + 1,
        history: [...(entry.history || []), { stage: entry.stage, name: masteredName, masteredAt: new Date().toISOString() }],
      },
    });
  }

  function logHold(skillId, stage, duration) {
    const entry = progress[skillId] ?? { stage: 0, history: [], holds: [] };
    persist({
      ...progress,
      [skillId]: {
        ...entry,
        holds: [...(entry.holds || []), { stage, duration, at: new Date().toISOString() }],
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
          holds={progress[openSkill.id]?.holds ?? []}
          onBack={() => setOpenSkillId(null)}
          onMaster={() => master(openSkill.id, openSkill)}
          onLogHold={(stage, duration) => logHold(openSkill.id, stage, duration)}
        />
      ) : (
        <SkillListScreen progress={progress} onOpen={setOpenSkillId} />
      )}
    </section>
  );
}
