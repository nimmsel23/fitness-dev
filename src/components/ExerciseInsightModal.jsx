import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Copy, Download, Loader2, Save, X, ChevronDown, ChevronUp } from 'lucide-react'
import { downloadText, exportFitnessData, getAnatomy, saveAnatomy, saveExercise } from '@db'
import { buildExerciseCoachSheet, buildExerciseInsights } from '../lib/exerciseInsights.js'
import { translateMuscle } from '../lib/translations.js'

function linesToText(value) {
  return Array.isArray(value) ? value.join('\n') : ''
}

function textToLines(value) {
  return String(value || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function errorsToText(value) {
  if (!Array.isArray(value)) return ''
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return String(item || '').trim()
      return [
        item.error || '',
        item.anatomical_reason || item.anatomicalReason || '',
        item.correction || '',
        item.coaching_cue || item.coachingCue || '',
      ].join(' | ')
    })
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n')
}

function textToErrors(value) {
  return String(value || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [error = '', anatomical_reason = '', correction = '', coaching_cue = ''] = line.split('|').map((part) => part.trim())
      return { error, anatomical_reason, correction, coaching_cue }
    })
    .filter((item) => item.error || item.anatomical_reason || item.correction || item.coaching_cue)
}

function buildLessonDraft(exercise, lesson) {
  const record = exercise && typeof exercise === 'object' ? exercise : {}
  const source = lesson && typeof lesson === 'object' ? lesson : {}
  return {
    title: source.title || record.display_name || record.displayName || record.name || '',
    learning_goal_short: source.learning_goal?.short || '',
    learning_goal_detailed: source.learning_goal?.detailed || '',
    movement_pattern: typeof source.movement_pattern === 'string'
      ? source.movement_pattern
      : source.movement_pattern?.primary || '',
    trainer_simple: source.trainer_explanation?.simple || '',
    trainer_technical: source.trainer_explanation?.technical || '',
    trainer_client_friendly: source.trainer_explanation?.client_friendly || '',
    coaching_cues: linesToText(source.coaching_cues),
    feel_cues: linesToText(source.feel_cues),
    common_errors: errorsToText(source.common_errors),
    muscle_anatomy: source.muscle_anatomy || {},
    joint_actions: source.joint_actions || {},
    body_highlighter_regions: source.body_highlighter_regions || {},
    muscle_roles: source.muscle_roles || {},
    quiz: source.quiz || {},
  }
}

function lessonDraftToPayload(exerciseId, draft) {
  return {
    exercise_id: exerciseId,
    title: draft.title,
    learning_goal_short: draft.learning_goal_short,
    learning_goal_detailed: draft.learning_goal_detailed,
    movement_pattern: draft.movement_pattern,
    trainer_simple: draft.trainer_simple,
    trainer_technical: draft.trainer_technical,
    trainer_client_friendly: draft.trainer_client_friendly,
    coaching_cues: textToLines(draft.coaching_cues),
    feel_cues: textToLines(draft.feel_cues),
    common_errors: textToErrors(draft.common_errors),
    muscle_anatomy: draft.muscle_anatomy,
    joint_actions: draft.joint_actions,
    body_highlighter_regions: draft.body_highlighter_regions,
    muscle_roles: draft.muscle_roles,
    quiz: draft.quiz,
  }
}

function Field({ label, value, onChange, placeholder = '', rows = 3 }) {
  return (
    <label className="block space-y-1.5">
      <div className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>{label}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-xl px-3 py-2 text-sm outline-none resize-y"
        style={{ background: 'var(--bg2)', color: 'var(--ink)', border: '1px solid var(--line)' }}
      />
    </label>
  )
}

function MuscleAnatomySection({ muscleAnatomy, muscleLanguage = 'de', taxonomy = null }) {
  const [open, setOpen] = useState(false)
  const entries = Object.entries(muscleAnatomy || {})
  if (!entries.length) return null
  return (
    <section className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--line)' }}>
      <button
        onClick={() => setOpen((o) => !o)}
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
              {m.origin && <div><span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Ursprung </span><span className="text-xs" style={{ color: 'var(--ink)' }}>{m.origin}</span></div>}
              {m.insertion && <div><span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Ansatz </span><span className="text-xs" style={{ color: 'var(--ink)' }}>{m.insertion}</span></div>}
              {m.innervation && <div><span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Innervation </span><span className="text-xs" style={{ color: 'var(--ink)' }}>{m.innervation}</span></div>}
              {m.function_in_exercise && <div className="pt-1 text-xs leading-5" style={{ color: 'var(--muted)', borderTop: '1px solid var(--line)' }}>{m.function_in_exercise}</div>}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default function ExerciseInsightModal({ exercise, onClose, onExerciseChange = null, muscleLanguage = 'de', taxonomy = null }) {
  const [localExercise, setLocalExercise] = useState(exercise)
  const [lessonDraft, setLessonDraft] = useState(() => buildLessonDraft(exercise, exercise?.lesson))
  const [exerciseNotes, setExerciseNotes] = useState(exercise?.notes || exercise?.description || '')
  const [loadingLesson, setLoadingLesson] = useState(false)
  const [savingLesson, setSavingLesson] = useState(false)
  const [savingNotes, setSavingNotes] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    setLocalExercise(exercise)
    setLessonDraft(buildLessonDraft(exercise, exercise?.lesson))
    setExerciseNotes(exercise?.notes || exercise?.description || '')
  }, [exercise])

  useEffect(() => {
    if (!exercise) return
    const id = exercise.exercise_id || exercise.id
    if (!id || exercise.lesson) return
    let active = true
    setLoadingLesson(true)
    getAnatomy(id)
      .then((lesson) => {
        if (!active || !lesson) return
        setLocalExercise((prev) => {
          const next = { ...prev, lesson }
          onExerciseChange?.(next)
          return next
        })
        setLessonDraft(buildLessonDraft(exercise, lesson))
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoadingLesson(false)
      })
    return () => {
      active = false
    }
  }, [exercise, onExerciseChange])

  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(''), 2200)
    return () => clearTimeout(timer)
  }, [notice])

  if (!exercise) return null

  const insight = buildExerciseInsights(localExercise)
  const exerciseId = localExercise.exercise_id || localExercise.id || localExercise.name

  async function copySheet() {
    try {
      await navigator.clipboard.writeText(buildExerciseCoachSheet(localExercise))
    } catch {}
  }

  async function exportSheet(kind) {
    try {
      const payload = kind === 'lesson'
        ? { kind: 'exercise_lesson', exercise_id: exerciseId, mode: 'trainer', force: true }
        : { kind: 'exercise_sheet', query: exerciseId, force: true }
      const result = await exportFitnessData(payload)
      alert(result?.path ? `Exportiert: ${result.path}` : 'Exportiert')
    } catch {
      alert('Export fehlgeschlagen')
    }
  }

  function downloadSheet() {
    const name = (insight.title || 'exercise').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    downloadText(`${name || 'exercise'}-coach-sheet.md`, buildExerciseCoachSheet(localExercise), 'text/markdown;charset=utf-8')
  }

  async function handleSaveLesson() {
    if (!exerciseId) return
    setSavingLesson(true)
    try {
      const payload = lessonDraftToPayload(exerciseId, lessonDraft)
      const result = await saveAnatomy(exerciseId, payload)
      const lesson = result?.lesson || payload
      const next = { ...localExercise, lesson }
      setLocalExercise(next)
      onExerciseChange?.(next)
      setNotice('Coach Sheet gespeichert')
    } catch {
      setNotice('Coach Sheet Save fehlgeschlagen')
    } finally {
      setSavingLesson(false)
    }
  }

  async function handleSaveNotes() {
    if (!exerciseId) return
    setSavingNotes(true)
    try {
      const payload = {
        ...localExercise,
        exercise_id: exerciseId,
        id: exerciseId,
        notes: exerciseNotes,
        description: exerciseNotes,
        display_name: localExercise.display_name || localExercise.displayName || localExercise.name,
      }
      await saveExercise(exerciseId, payload)
      const next = { ...localExercise, ...payload }
      setLocalExercise(next)
      onExerciseChange?.(next)
      setNotice('Exercise gespeichert')
    } catch {
      setNotice('Exercise Save fehlgeschlagen')
    } finally {
      setSavingNotes(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.68)' }} onClick={onClose} />
      <div
        className="absolute inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:w-[min(980px,94vw)] max-h-[92vh] overflow-hidden rounded-t-3xl md:rounded-3xl shadow-2xl"
        style={{ background: 'var(--panel)', border: '1px solid var(--line)' }}
      >
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
            {insight.isRaw && (
              <div
                className="inline-flex items-center gap-1.5 mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg"
                style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}
              >
                Ungeprüfte Rohdaten oder fehlende Lesson
              </div>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-xl" style={{ background: 'var(--card)', border: '1px solid var(--line)', color: 'var(--muted)' }}>
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(92vh-80px)] px-5 py-5 space-y-4">
          <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
            <section className="p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
              <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>Was es lehrt</div>
              <p className="text-sm leading-6" style={{ color: 'var(--ink)' }}>
                {insight.learningGoal || 'Keine Original-Beschreibung vorhanden.'}
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>Bewegung</div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{insight.movement.pattern}</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>Körperregionen</div>
                  <div className="flex flex-wrap gap-1.5">
                    {insight.regions.map((r) => (
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
                <button onClick={() => exportSheet('sheet')} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold" style={{ background: 'rgba(94,234,212,0.12)', border: '1px solid rgba(94,234,212,0.28)', color: 'var(--accent)' }}>
                  <span className="flex items-center gap-2"><Download size={14} /> Coach Sheet exportieren</span>
                  <span style={{ color: 'var(--muted)' }}>obsidian</span>
                </button>
                <button onClick={() => exportSheet('lesson')} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold" style={{ background: 'rgba(94,234,212,0.08)', border: '1px solid rgba(94,234,212,0.2)', color: 'var(--ink)' }}>
                  <span className="flex items-center gap-2"><Download size={14} /> Lesson exportieren</span>
                  <span style={{ color: 'var(--muted)' }}>obsidian</span>
                </button>
                <button onClick={downloadSheet} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold" style={{ background: 'var(--bg2)', border: '1px solid var(--line)', color: 'var(--ink)' }}>
                  <span className="flex items-center gap-2"><Download size={14} /> Coach Sheet laden</span>
                  <span style={{ color: 'var(--muted)' }}>md</span>
                </button>
                <button onClick={copySheet} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold" style={{ background: 'var(--bg2)', border: '1px solid var(--line)', color: 'var(--ink)' }}>
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
                  <div className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--muted)' }}>Primär</div>
                  <div className="flex flex-wrap gap-1.5">
                    {insight.primary.length ? insight.primary.map((m) => (
                      <span key={m} className="text-[11px] px-2 py-1 rounded-full" style={{ background: 'rgba(94,234,212,0.12)', color: 'var(--accent)' }}>
                        {translateMuscle(m, taxonomy, muscleLanguage)}
                      </span>
                    )) : <span className="text-sm" style={{ color: 'var(--muted)' }}>n/a</span>}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--muted)' }}>Sekundär</div>
                  <div className="flex flex-wrap gap-1.5">
                    {insight.secondary.length ? insight.secondary.map((m) => (
                      <span key={m} className="text-[11px] px-2 py-1 rounded-full" style={{ background: 'var(--bg2)', color: 'var(--muted)' }}>
                        {translateMuscle(m, taxonomy, muscleLanguage)}
                      </span>
                    )) : <span className="text-sm" style={{ color: 'var(--muted)' }}>n/a</span>}
                  </div>
                </div>
              </div>
            </section>

            <section className="p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
              <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>Exercise Notes</div>
              <Field
                label="Notizen"
                value={exerciseNotes}
                onChange={setExerciseNotes}
                rows={5}
                placeholder="Coaching-Notizen, Umsetzungsdetails, interne Hinweise..."
              />
              <div className="mt-3 flex justify-end">
                <button onClick={handleSaveNotes} disabled={savingNotes} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold" style={{ background: 'var(--bg2)', border: '1px solid var(--line)', color: 'var(--ink)' }}>
                  {savingNotes ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Exercise speichern
                </button>
              </div>
            </section>
          </div>

          {(insight.coachCues.length > 0 || insight.commonErrors.length > 0) && (
            <div className="grid gap-4 md:grid-cols-2">
              {insight.coachCues.length > 0 && (
                <section className="p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
                  <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>Coaching Cues</div>
                  <div className="flex flex-wrap gap-2">
                    {insight.coachCues.map((cue) => (
                      <span key={cue} className="text-sm px-3 py-2 rounded-xl" style={{ background: 'var(--bg2)', color: 'var(--ink)' }}>{cue}</span>
                    ))}
                  </div>
                </section>
              )}
              {insight.commonErrors.length > 0 && (
                <section className="p-4 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
                  <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>Fehlerbilder</div>
                  <div className="space-y-2">
                    {insight.commonErrors.map((err) => (
                      <div key={`${err.error}-${err.correction}`} className="p-3 rounded-xl" style={{ background: 'var(--bg2)', border: '1px solid var(--line)' }}>
                        <div className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{err.error}</div>
                        <div className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{err.anatomicalReason}</div>
                        <div className="text-sm mt-1" style={{ color: 'var(--accent)' }}>{err.correction}</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          <section className="p-4 rounded-2xl space-y-4" style={{ background: 'var(--card)', border: '1px solid var(--line)' }}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Coach Sheet Editor</div>
                <div className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
                  {loadingLesson ? 'Anatomie-Daten werden geladen…' : 'Lesson direkt im aktuellen Datenpfad bearbeiten.'}
                </div>
              </div>
              <button onClick={handleSaveLesson} disabled={savingLesson || loadingLesson} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold" style={{ background: 'rgba(94,234,212,0.12)', border: '1px solid rgba(94,234,212,0.28)', color: 'var(--accent)' }}>
                {savingLesson ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Coach Sheet speichern
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Titel" value={lessonDraft.title} onChange={(value) => setLessonDraft((prev) => ({ ...prev, title: value }))} rows={2} />
              <Field label="Movement Pattern" value={lessonDraft.movement_pattern} onChange={(value) => setLessonDraft((prev) => ({ ...prev, movement_pattern: value }))} rows={2} />
              <Field label="Learning Goal Kurz" value={lessonDraft.learning_goal_short} onChange={(value) => setLessonDraft((prev) => ({ ...prev, learning_goal_short: value }))} rows={3} />
              <Field label="Learning Goal Detailliert" value={lessonDraft.learning_goal_detailed} onChange={(value) => setLessonDraft((prev) => ({ ...prev, learning_goal_detailed: value }))} rows={4} />
              <Field label="Trainer Simple" value={lessonDraft.trainer_simple} onChange={(value) => setLessonDraft((prev) => ({ ...prev, trainer_simple: value }))} rows={4} />
              <Field label="Trainer Technical" value={lessonDraft.trainer_technical} onChange={(value) => setLessonDraft((prev) => ({ ...prev, trainer_technical: value }))} rows={4} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Client Friendly" value={lessonDraft.trainer_client_friendly} onChange={(value) => setLessonDraft((prev) => ({ ...prev, trainer_client_friendly: value }))} rows={4} />
              <Field label="Feel Cues" value={lessonDraft.feel_cues} onChange={(value) => setLessonDraft((prev) => ({ ...prev, feel_cues: value }))} rows={5} placeholder="Eine Zeile pro Cue" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Coaching Cues" value={lessonDraft.coaching_cues} onChange={(value) => setLessonDraft((prev) => ({ ...prev, coaching_cues: value }))} rows={6} placeholder="Eine Zeile pro Cue" />
              <Field label="Common Errors" value={lessonDraft.common_errors} onChange={(value) => setLessonDraft((prev) => ({ ...prev, common_errors: value }))} rows={6} placeholder="error | reason | correction | cue" />
            </div>
          </section>

          <MuscleAnatomySection muscleAnatomy={localExercise.lesson?.muscle_anatomy} muscleLanguage={muscleLanguage} taxonomy={taxonomy} />

          {loadingLesson && (
            <div className="text-center py-2 text-xs flex items-center justify-center gap-2" style={{ color: 'var(--muted)' }}>
              <Loader2 size={14} className="animate-spin" /> Anatomie-Daten werden geladen…
            </div>
          )}

          {notice && (
            <div className="text-center py-2 text-xs font-semibold rounded-xl" style={{ color: 'var(--accent)', background: 'rgba(94,234,212,0.08)', border: '1px solid rgba(94,234,212,0.2)' }}>
              {notice}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
