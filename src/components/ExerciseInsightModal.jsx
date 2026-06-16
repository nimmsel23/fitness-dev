import { useState } from 'react'
import { Download, X, Copy, ChevronDown, ChevronUp } from 'lucide-react'
import { downloadText, exportFitnessData } from '@db'
import { buildExerciseCoachSheet, buildExerciseInsights } from '../lib/exerciseInsights.js'
import { translateMuscle } from '../lib/translations.js'

function MuscleAnatomySection({ muscleAnatomy, muscleLanguage = 'de', taxonomy = null }) {
  const [open, setOpen] = useState(false)
  const entries = Object.entries(muscleAnatomy || {})
  if (!entries.length) return null
  return (
    <section className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--line)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3"
        style={{ background: 'var(--card)', color: 'var(--ink)' }}
      >
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
          Muskel-Anatomie ({entries.length} Muskeln)
        </span>
        {open ? <ChevronUp size={15} style={{ color: 'var(--muted)' }} /> : <ChevronDown size={15} style={{ color: 'var(--muted)' }} />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 grid gap-3 md:grid-cols-2" style={{ background: 'var(--card)' }}>
          {entries.map(([id, m]) => (
            <div key={id} className="p-3 rounded-xl space-y-1.5" style={{ background: 'var(--bg2)', border: '1px solid var(--line)' }}>
              <div className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
                {translateMuscle(id, taxonomy, muscleLanguage)}
              </div>
              {m.origin && (
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Ursprung </span>
                  <span className="text-xs" style={{ color: 'var(--ink)' }}>{m.origin}</span>
                </div>
              )}
              {m.insertion && (
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Ansatz </span>
                  <span className="text-xs" style={{ color: 'var(--ink)' }}>{m.insertion}</span>
                </div>
              )}
              {m.innervation && (
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Innervation </span>
                  <span className="text-xs" style={{ color: 'var(--ink)' }}>{m.innervation}</span>
                </div>
              )}
              {m.function_in_exercise && (
                <div className="pt-1 text-xs leading-5" style={{ color: 'var(--muted)', borderTop: '1px solid var(--line)' }}>
                  {m.function_in_exercise}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default function ExerciseInsightModal({ exercise, onClose, muscleLanguage = 'de', taxonomy = null }) {
  if (!exercise) return null

  const insight = buildExerciseInsights(exercise)

  async function copySheet() {
    try {
      await navigator.clipboard.writeText(buildExerciseCoachSheet(exercise))
    } catch {}
  }

  async function exportSheet(kind) {
    try {
      const payload = kind === 'lesson'
        ? { kind: 'exercise_lesson', exercise_id: exercise.exercise_id || exercise.id || exercise.name, mode: 'trainer', force: true }
        : { kind: 'exercise_sheet', query: exercise.exercise_id || exercise.id || exercise.name, force: true }
      const result = await exportFitnessData(payload)
      alert(result?.path ? `Exportiert: ${result.path}` : 'Exportiert')
    } catch {
      alert('Export fehlgeschlagen')
    }
  }

  function downloadSheet() {
    const name = (insight.title || 'exercise').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    downloadText(`${name || 'exercise'}-coach-sheet.md`, buildExerciseCoachSheet(exercise), 'text/markdown;charset=utf-8')
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.68)' }} onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:w-[min(860px,92vw)] max-h-[92vh] overflow-hidden rounded-t-3xl md:rounded-3xl shadow-2xl"
        style={{ background: 'var(--panel)', border: '1px solid var(--line)' }}>
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b" style={{ borderColor: 'var(--line)' }}>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.25em]" style={{ color: 'var(--muted)' }}>
              Exercise Detail / Meaning / Coach Sheet
            </div>
            <h2 className="text-xl font-extrabold leading-tight mt-1" style={{ color: 'var(--ink)' }}>
              {insight.title}
            </h2>
            <div className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
              {insight.category} · {insight.equipment}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl" style={{ background: 'var(--card)', border: '1px solid var(--line)', color: 'var(--muted)' }}>
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(92vh-80px)] px-5 py-5 space-y-4">
          <div className="grid gap-4 md:grid-cols-[1.3fr_0.9fr]">
            <section className="p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
              <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>Was es lehrt</div>
              <p className="text-sm leading-6" style={{ color: 'var(--ink)' }}>{insight.learningGoal}</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>Bewegung</div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{insight.movement.pattern}</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>Koerperregionen</div>
                  <div className="flex flex-wrap gap-1.5">
                    {insight.regions.map(r => (
                      <span key={r} className="text-[11px] px-2 py-1 rounded-full" style={{ background: 'var(--bg2)', color: 'var(--accent)' }}>
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
              <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>Schnellzugriff</div>
              <div className="space-y-3">
                <button onClick={() => exportSheet('sheet')} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: 'rgba(94,234,212,0.12)', border: '1px solid rgba(94,234,212,0.28)', color: 'var(--accent)' }}>
                  <span className="flex items-center gap-2"><Download size={14} /> Coach Sheet exportieren</span>
                  <span style={{ color: 'var(--muted)' }}>obsidian</span>
                </button>
                <button onClick={() => exportSheet('lesson')} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: 'rgba(94,234,212,0.08)', border: '1px solid rgba(94,234,212,0.2)', color: 'var(--ink)' }}>
                  <span className="flex items-center gap-2"><Download size={14} /> Lesson exportieren</span>
                  <span style={{ color: 'var(--muted)' }}>obsidian</span>
                </button>
                <button onClick={downloadSheet} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: 'var(--bg2)', border: '1px solid var(--line)', color: 'var(--ink)' }}>
                  <span className="flex items-center gap-2"><Download size={14} /> Coach Sheet laden</span>
                  <span style={{ color: 'var(--muted)' }}>md</span>
                </button>
                <button onClick={copySheet} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: 'var(--bg2)', border: '1px solid var(--line)', color: 'var(--ink)' }}>
                  <span className="flex items-center gap-2"><Copy size={14} /> Markdown kopieren</span>
                  <span style={{ color: 'var(--muted)' }}>obsidian</span>
                </button>
              </div>
            </section>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <section className="p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
              <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>Muskeln</div>
              <div className="space-y-3">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--muted)' }}>Primaer</div>
                  <div className="flex flex-wrap gap-1.5">
                    {insight.primary.length ? insight.primary.map(m => (
                      <span key={m} className="text-[11px] px-2 py-1 rounded-full" style={{ background: 'rgba(94,234,212,0.12)', color: 'var(--accent)' }}>
                        {translateMuscle(m, taxonomy, muscleLanguage)}
                      </span>
                    )) : <span className="text-sm" style={{ color: 'var(--muted)' }}>n/a</span>}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--muted)' }}>Sekundaer</div>
                  <div className="flex flex-wrap gap-1.5">
                    {insight.secondary.length ? insight.secondary.map(m => (
                      <span key={m} className="text-[11px] px-2 py-1 rounded-full" style={{ background: 'var(--bg2)', color: 'var(--muted)' }}>
                        {translateMuscle(m, taxonomy, muscleLanguage)}
                      </span>
                    )) : <span className="text-sm" style={{ color: 'var(--muted)' }}>n/a</span>}
                  </div>
                </div>
              </div>
            </section>

            <section className="p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
              <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>Begruendung</div>
              <p className="text-sm leading-6" style={{ color: 'var(--ink)' }}>{insight.movement.lesson}</p>
              <div className="mt-4 text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>Spuerhinweis</div>
              <p className="text-sm leading-6" style={{ color: 'var(--ink)' }}>{insight.feelCues[0] || 'Saubere Spannung und klare Linie.'}</p>
            </section>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <section className="p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
              <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>Coaching Cues</div>
              <div className="flex flex-wrap gap-2">
                {insight.coachCues.map(cue => (
                  <span key={cue} className="text-sm px-3 py-2 rounded-xl" style={{ background: 'var(--bg2)', color: 'var(--ink)' }}>
                    {cue}
                  </span>
                ))}
              </div>
            </section>

            <section className="p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
              <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>Fehlerbilder</div>
              <div className="space-y-2">
                {insight.commonErrors.map(err => (
                  <div key={err.error} className="p-3 rounded-xl" style={{ background: 'var(--bg2)', border: '1px solid var(--line)' }}>
                    <div className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{err.error}</div>
                    <div className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{err.anatomicalReason}</div>
                    <div className="text-sm mt-1" style={{ color: 'var(--accent)' }}>{err.correction}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
            <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>Lernfrage</div>
            <p className="text-sm leading-6" style={{ color: 'var(--ink)' }}>{insight.quiz[0]?.question}</p>
          </section>

          <MuscleAnatomySection muscleAnatomy={exercise.lesson?.muscle_anatomy} muscleLanguage={muscleLanguage} taxonomy={taxonomy} />

          {!exercise.lesson && (
            <div className="text-center py-2 text-xs" style={{ color: 'var(--muted)' }}>
              Anatomie-Daten werden geladen…
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
