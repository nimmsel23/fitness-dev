import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Lock, Check, Circle, Play, Pause, Flag, Trophy, ArrowUp, ArrowDown, Activity } from 'lucide-react';

const SKILLS_STORAGE_KEY = 'fitness-skills-progress-v1';

// Skills + Progressionen 1:1 nach Thenics-App-Struktur (Nutzer-Recherche
// 2026-08-12, Play Store + Reddit r/bodyweightfitness Community-Reihenfolge).
// tier: 'free' | 'pro' — rein informativ (unsere App hat kein Bezahlmodell,
// beide Tiers sind hier gleichermaßen nutzbar).
// category: 'push' | 'pull' | 'core' — eigene Einordnung für die UI-Gliederung,
// nicht aus der App selbst übernommen.
// Jede Progressionsstufe ist entweder 'reps' (dynamisch, Wiederholungen
// zählen) oder 'hold' (isometrisch, Sekunden halten) — Klassifizierung nach
// Übungsart, keine erfundenen Werte. sets/reps/seconds sind eigene, generische
// Default-Vorgaben (3×8 bzw. 3×15s), NICHT aus der echten Thenics-App
// verifiziert — dort variieren die Vorgaben vermutlich pro Skill-Schwere.
function reps(name, sets = 3, count = 8) { return { name, type: 'reps', sets, reps: count }; }
function hold(name, sets = 3, seconds = 15) { return { name, type: 'hold', sets, seconds }; }

const SKILLS = [
  { id: 'muscle-up', name: 'Muscle-Up', tier: 'free', category: 'pull', progressions: [reps('Klimmzüge'), reps('Explosive Klimmzüge'), reps('Chest-to-Bar Pull-Ups'), reps('Bar Dips'), reps('Muscle-Up Negative', 3, 5), reps('Muscle-Up', 3, 3)] },
  { id: 'planche', name: 'Planche', tier: 'free', category: 'push', progressions: [hold('Plank'), hold('Planche Lean'), hold('Frog Stand'), hold('Tuck Planche'), hold('Advanced Tuck Planche'), hold('Straddle Planche'), hold('Full Planche')] },
  { id: 'front-lever', name: 'Front Lever', tier: 'free', category: 'pull', progressions: [reps('Scapula Pulls', 3, 10), hold('Tuck Front Lever'), hold('Advanced Tuck Front Lever'), hold('One Leg Front Lever'), hold('Straddle Front Lever'), hold('Full Front Lever')] },
  { id: 'back-lever', name: 'Back Lever', tier: 'free', category: 'pull', progressions: [reps('Skin the Cat', 3, 5), hold('Tuck Back Lever'), hold('Advanced Tuck Back Lever'), hold('Straddle Back Lever'), hold('Full Back Lever')] },
  { id: 'handstand-pushup', name: 'Handstand Push-Up', tier: 'free', category: 'push', progressions: [reps('Pike Push-Ups'), reps('Elevated Pike Push-Ups'), reps('Wall Handstand Push-Ups'), reps('Freestanding Handstand Push-Ups', 3, 5)] },
  { id: 'v-sit', name: 'V-Sit', tier: 'free', category: 'core', progressions: [hold('Tuck L-Sit'), hold('L-Sit'), hold('Straddle L-Sit'), hold('V-Sit')] },
  { id: 'pistol-squat', name: 'Pistol Squat', tier: 'free', category: 'core', progressions: [reps('Assisted Squats'), reps('Deep Squats'), reps('Step-Ups'), reps('Negative Pistol Squats'), reps('Full Pistol Squat')] },
  { id: 'human-flag', name: 'Human Flag', tier: 'pro', category: 'core', progressions: [hold('Support Holds'), hold('Vertical Flag'), hold('Tuck Human Flag'), hold('Straddle Human Flag'), hold('Full Human Flag')] },
  { id: 'one-arm-pullup', name: 'One Arm Pull-Up', tier: 'pro', category: 'pull', progressions: [reps('Archer Pull-Ups'), reps('Weighted Pull-Ups'), reps('One Arm Negative Pull-Ups', 3, 5), reps('Assisted One Arm Pull-Up', 3, 3)] },
  { id: 'dragon-flag', name: 'Dragon Flag', tier: 'pro', category: 'core', progressions: [reps('Candlestick', 3, 5), reps('Dragon Flag Negatives', 3, 5), reps('Tuck Dragon Flag', 3, 5), reps('Full Dragon Flag', 3, 3)] },
  { id: 'hefesto', name: 'Hefesto', tier: 'pro', category: 'pull', progressions: [reps('Korean Dips'), reps('Back Lever Pull-Ups', 3, 5), reps('Hefesto Negatives', 3, 3), reps('Full Hefesto', 3, 3)] },
  { id: 'one-arm-handstand', name: 'One Arm Handstand', tier: 'pro', category: 'push', progressions: [hold('Handstand Balance'), hold('Handstand Shifting'), hold('Finger Support Handstand'), hold('One Arm Handstand', 3, 5)] },
  { id: 'one-arm-pushup', name: 'One Arm Push-Up', tier: 'pro', category: 'push', progressions: [reps('Incline One Arm Push-Up'), reps('Archer Push-Ups'), reps('One Arm Push-Up', 3, 3)] },
  { id: 'shrimp-squat', name: 'Shrimp Squat', tier: 'pro', category: 'core', progressions: [reps('Airborne Squat'), hold('Shrimp Squat (einarmig halten)'), reps('Full Shrimp Squat', 3, 5)] },
];

const REST_SECONDS = 90;

const CATEGORY_META = {
  push: { Icon: ArrowUp },
  pull: { Icon: ArrowDown },
  core: { Icon: Activity },
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
        </div>
        <div className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--dim)' }}>
          {done ? 'Gemeistert' : `Stufe ${stage + 1}/${skill.progressions.length} · ${skill.progressions[stage].name}`}
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
      <div className="mb-1 px-1">
        <meta.Icon size={11} style={{ color: 'var(--dim)', opacity: 0.5 }} />
      </div>
      <div className="rounded-2xl px-3" style={{ background: 'var(--bg2)' }}>
        {skills.map((skill, i) => (
          <SkillRow key={skill.id} skill={skill} progress={progress} onOpen={onOpen} isLast={i === skills.length - 1} />
        ))}
      </div>
    </div>
  );
}

function SkillListScreen({ progress, onOpen }) {
  const categories = ['push', 'pull', 'core'].filter(c => SKILLS.some(s => s.category === c));
  return (
    <div>
      {categories.map(category => (
        <CategoryGroup
          key={category}
          category={category}
          skills={SKILLS.filter(s => s.category === category)}
          progress={progress}
          onOpen={onOpen}
        />
      ))}
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

function formatTarget(p) {
  return p.type === 'hold' ? `${p.sets}× ${p.seconds}s halten` : `${p.sets}× ${p.reps} Wdh`;
}

// ── Geführter Workout-Runner (State-Machine) ────────────────────────────────
// prep (kurzer Countdown) → work (Countdown bei "hold", manuelle Bestätigung
// bei "reps") → rest (Auto-Countdown, Screen-Tönung) → nächster Satz von
// vorn, bis alle Sätze durch sind → done. Kein manuelles Stoppen zwischen den
// Sätzen nötig — genau der Unterschied zur freien Stoppuhr darunter.
const PREP_SECONDS = 3;

function WorkoutRunner({ stageInfo, onFinish, onExit }) {
  const [phase, setPhase] = useState('prep');
  const [setIndex, setSetIndex] = useState(0);
  const [remainingMs, setRemainingMs] = useState(PREP_SECONDS * 1000);
  const [workElapsedMs, setWorkElapsedMs] = useState(0);

  const isHold = stageInfo.type === 'hold';

  useEffect(() => {
    if (phase === 'done') return undefined;
    if (phase === 'work' && !isHold) {
      const interval = window.setInterval(() => setWorkElapsedMs(ms => ms + 100), 100);
      return () => window.clearInterval(interval);
    }
    const interval = window.setInterval(() => {
      setRemainingMs(ms => {
        if (ms > 100) return ms - 100;
        advancePhase();
        return 0;
      });
    }, 100);
    return () => window.clearInterval(interval);
  }, [phase, setIndex]);

  function advancePhase() {
    if (phase === 'prep') {
      setPhase('work');
      setWorkElapsedMs(0);
      setRemainingMs(isHold ? stageInfo.seconds * 1000 : 0);
      return;
    }
    if (phase === 'work') {
      goToRest();
      return;
    }
    if (phase === 'rest') {
      const nextSet = setIndex + 1;
      if (nextSet >= stageInfo.sets) {
        setPhase('done');
        return;
      }
      setSetIndex(nextSet);
      setPhase('prep');
      setRemainingMs(PREP_SECONDS * 1000);
    }
  }

  function goToRest() {
    setPhase('rest');
    setRemainingMs(REST_SECONDS * 1000);
  }

  function completeRepsSet() {
    if (phase === 'work' && !isHold) goToRest();
  }

  useEffect(() => {
    if (phase === 'done') onFinish();
  }, [phase]);

  const phaseColor = { prep: 'var(--accent)', work: 'var(--accent)', rest: '#38bdf8', done: 'var(--accent)' }[phase];
  const phaseLabel = { prep: 'Bereit machen', work: isHold ? 'Halten' : 'Wiederholungen', rest: 'Pause', done: 'Fertig' }[phase];

  return (
    <div
      className="rounded-2xl px-5 py-8 mb-4 text-center transition-colors duration-500"
      style={{ background: phase === 'rest' ? 'rgba(56,189,248,0.1)' : 'var(--accent-glow, rgba(0,0,0,0.05))', border: `1px solid ${phase === 'rest' ? 'rgba(56,189,248,0.35)' : 'var(--line)'}` }}
    >
      {phase !== 'done' && (
        <>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: phaseColor }}>
            {phaseLabel} · Satz {setIndex + 1}/{stageInfo.sets}
          </div>
          <div className="text-lg font-black text-fit-ink mb-3">{stageInfo.name}</div>

          {phase === 'work' && !isHold ? (
            <>
              <div className="text-4xl font-black tabular-nums text-fit-ink mb-1">{stageInfo.reps}× Wdh</div>
              <div className="text-[11px] font-bold mb-4" style={{ color: 'var(--dim)' }}>Laufzeit: {formatHoldTime(workElapsedMs)}</div>
              <button
                onClick={completeRepsSet}
                className="w-full min-h-12 rounded-2xl flex items-center justify-center gap-2 text-sm font-black uppercase tracking-[0.16em]"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                <Check size={16} strokeWidth={3} /> Satz erledigt
              </button>
            </>
          ) : (
            <div className="text-5xl font-black tabular-nums text-fit-ink">{Math.ceil(remainingMs / 1000)}s</div>
          )}
        </>
      )}

      {phase === 'done' && (
        <div>
          <Trophy size={28} style={{ color: 'var(--accent)' }} className="mx-auto mb-2" />
          <div className="text-lg font-black text-fit-ink">Workout abgeschlossen</div>
          <div className="text-[11px] font-bold mt-1" style={{ color: 'var(--dim)' }}>{stageInfo.sets} Sätze {stageInfo.name}</div>
        </div>
      )}

      <button onClick={onExit} className="mt-4 text-[11px] font-bold" style={{ color: 'var(--dim)' }}>
        Abbrechen
      </button>
    </div>
  );
}

function SkillDetailScreen({ skill, stage, history, holds, sessions, onBack, onMaster, onLogHold, onLogWorkout }) {
  const stageInfo = skill.progressions[stage];
  const next = skill.progressions[stage + 1];
  const isLast = stage >= skill.progressions.length - 1;
  const [runnerActive, setRunnerActive] = useState(false);

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 text-sm font-bold mb-5" style={{ color: 'var(--accent)' }}>
        <ChevronLeft size={18} /> Skills
      </button>

      <h3 className="text-xl font-black text-fit-ink mb-1">{skill.name}</h3>
      <div className="text-[11px] font-bold mb-5" style={{ color: 'var(--dim)' }}>
        Stufe {stage + 1} von {skill.progressions.length}
      </div>

      {runnerActive ? (
        <WorkoutRunner
          stageInfo={stageInfo}
          onExit={() => setRunnerActive(false)}
          onFinish={() => onLogWorkout(stage)}
        />
      ) : (
        <div
          className="rounded-2xl px-5 py-6 mb-4 text-center"
          style={{ background: 'var(--accent-glow, rgba(0,0,0,0.05))', border: '1px solid var(--line)' }}
        >
          <div className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--accent)' }}>Jetzt</div>
          <div className="text-2xl font-black text-fit-ink mt-2">{stageInfo.name}</div>
          <div className="text-[11px] font-bold mt-1" style={{ color: 'var(--dim)' }}>{formatTarget(stageInfo)}</div>
          <button
            onClick={() => setRunnerActive(true)}
            className="w-full mt-4 min-h-12 rounded-2xl flex items-center justify-center gap-2 text-sm font-black uppercase tracking-[0.16em]"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            <Play size={16} strokeWidth={3} /> Workout starten
          </button>
          {sessions.length > 0 && (
            <div className="text-[10px] font-bold mt-3" style={{ color: 'var(--dim)', opacity: 0.7 }}>
              {sessions.length}× absolviert · zuletzt {formatMasteredAt(sessions[sessions.length - 1].at)}
            </div>
          )}
        </div>
      )}

      {next && (
        <div className="text-center text-[11px] font-bold mb-5" style={{ color: 'var(--dim)', opacity: 0.8 }}>
          Als Nächstes: {next.name}
        </div>
      )}

      <SkillHoldTimer
        stageName={stageInfo.name}
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
            <div key={p.name} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg" style={{ background: 'var(--bg2)', opacity: i > stage + 1 ? 0.4 : 1 }}>
              <div className="flex items-center gap-2">
                {i < stage ? <Check size={14} color="#22c55e" strokeWidth={3} />
                  : i === stage ? <Circle size={14} style={{ color: 'var(--accent)' }} fill="var(--accent)" />
                  : i > stage + 1 ? <Lock size={12} style={{ color: 'var(--dim)' }} />
                  : <Circle size={14} style={{ color: 'var(--dim)' }} />}
                <span className="text-sm" style={{ color: i === stage ? 'var(--ink)' : 'var(--dim)', fontWeight: i === stage ? 700 : 500 }}>{p.name}</span>
              </div>
              <span className="text-[10px] font-mono" style={{ color: 'var(--dim)', opacity: 0.7 }}>{formatTarget(p)}</span>
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
    const entry = progress[skillId] ?? { stage: 0, history: [], holds: [], sessions: [] };
    if (entry.stage >= skill.progressions.length - 1) return;
    const masteredName = skill.progressions[entry.stage].name;
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
    const entry = progress[skillId] ?? { stage: 0, history: [], holds: [], sessions: [] };
    persist({
      ...progress,
      [skillId]: {
        ...entry,
        holds: [...(entry.holds || []), { stage, duration, at: new Date().toISOString() }],
      },
    });
  }

  function logWorkout(skillId, stage) {
    const entry = progress[skillId] ?? { stage: 0, history: [], holds: [], sessions: [] };
    persist({
      ...progress,
      [skillId]: {
        ...entry,
        sessions: [...(entry.sessions || []), { stage, at: new Date().toISOString() }],
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
          sessions={progress[openSkill.id]?.sessions ?? []}
          onBack={() => setOpenSkillId(null)}
          onMaster={() => master(openSkill.id, openSkill)}
          onLogHold={(stage, duration) => logHold(openSkill.id, stage, duration)}
          onLogWorkout={(stage) => logWorkout(openSkill.id, stage)}
        />
      ) : (
        <SkillListScreen progress={progress} onOpen={setOpenSkillId} />
      )}
    </section>
  );
}
