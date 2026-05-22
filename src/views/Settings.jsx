import { useState, useEffect } from 'react'
import { Activity, Dumbbell, Settings2, Sparkles, User } from 'lucide-react'
import { api } from '../api.js'

const STORAGE_KEY = 'fitness-settings'

const DEFAULTS = {
  age: 30,
  weight_kg: 80,
  freq_per_week: 4,
  split: 'ppl',
  hit_default: true,
}

function loadSettings() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }
  } catch {
    return { ...DEFAULTS }
  }
}

function saveSettings(s) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
}

export function useLocalSettings() {
  const [s, setS] = useState(loadSettings)

  function set(key, val) {
    setS(prev => {
      const next = { ...prev, [key]: val }
      saveSettings(next)
      return next
    })
  }

  return { ...s, set }
}

const DAY_START = 6
const DAY_END   = 20

const DARK_THEMES  = [
  { id: 'mocha',   label: '🍯 Honey Night' },
  { id: 'sweet',   label: '🔵 Sweet Amber' },
  { id: 'nordic',  label: '❄️ Nordic' },
  { id: 'nothing', label: '⬛ Nothing' },
]
const LIGHT_THEMES = [
  { id: 'latte',  label: '☀️ Latte' },
]

function ThemeBtn({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '0.45rem 0.25rem',
      borderRadius: '0.55rem',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.72rem',
      fontWeight: active ? '700' : '400',
      background: active ? 'var(--accent-glow)' : 'transparent',
      color: active ? 'var(--accent)' : 'var(--muted)',
      outline: active ? '1px solid var(--accent)' : '1px solid transparent',
      transition: 'all 0.15s',
      whiteSpace: 'nowrap',
    }}>
      {label}
    </button>
  )
}

export default function Settings({ themeMode, circDark, circLight, onSetThemeMode, onSetManualTheme, onSetCircadianDark, onSetCircadianLight }) {
  const { age, weight_kg, freq_per_week, split, hit_default, set } = useLocalSettings()
  const [health, setHealth] = useState(null)
  const [wger, setWger] = useState(null)
  const [firestoreStatus, setFirestoreStatus] = useState(null)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    api.get('/health').then(setHealth).catch(() => setHealth({ ok: false }))
    fetch('http://localhost:8000/api/v2/language/?format=json')
      .then(r => setWger(r.ok))
      .catch(() => setWger(false))
    api.get('/firestore/status').then(setFirestoreStatus).catch(() => setFirestoreStatus({ ok: false }))
  }, [])

  async function handleSync() {
    setSyncing(true)
    try {
      await api.post('/firestore/sync', {})
      const s = await api.get('/firestore/status')
      setFirestoreStatus(s)
    } catch {
      setFirestoreStatus({ ok: false })
    } finally {
      setSyncing(false)
    }
  }

  const card = {
    background: 'var(--card)',
    border: '1px solid var(--line)',
    borderRadius: '1rem',
    padding: '1.25rem',
  }

  const labelCls = {
    display: 'block',
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
    color: 'var(--muted)',
    marginBottom: '0.35rem',
  }

  const inputCls = {
    width: '100%',
    background: 'var(--panel)',
    border: '1px solid var(--line)',
    borderRadius: '0.6rem',
    padding: '0.6rem 0.85rem',
    color: 'var(--ink)',
    fontSize: '0.875rem',
  }

  return (
    <div className="grid gap-4">

      {/* Trainingsprofil */}
      <section style={card}>
        <div className="flex items-center gap-2 mb-4">
          <Dumbbell size={18} style={{ color: 'var(--accent)' }} />
          <h2 className="font-semibold text-base">Training</h2>
        </div>
        <div className="grid gap-3">
          <div>
            <label style={labelCls}>Trainingstage / Woche</label>
            <input
              type="number" min={1} max={7} value={freq_per_week}
              onChange={e => set('freq_per_week', Number(e.target.value))}
              style={inputCls}
            />
          </div>
          <div>
            <label style={labelCls}>Bevorzugter Split</label>
            <select value={split} onChange={e => set('split', e.target.value)} style={inputCls}>
              <option value="ppl">Push / Pull / Legs</option>
              <option value="upper_lower">Upper / Lower</option>
              <option value="full_body">Full Body</option>
              <option value="bro">Bro Split (Einzel-Muskel)</option>
            </select>
          </div>
          <div className="flex items-center justify-between" style={{ background: 'var(--panel)', borderRadius: '0.6rem', padding: '0.6rem 0.85rem', border: '1px solid var(--line)' }}>
            <span className="text-sm">HIT als Standard</span>
            <button
              onClick={() => set('hit_default', !hit_default)}
              style={{
                width: '2.5rem', height: '1.4rem', borderRadius: '999px', border: 'none', cursor: 'pointer',
                background: hit_default ? 'var(--accent)' : 'var(--line)',
                position: 'relative', transition: 'background 0.2s',
              }}
            >
              <span style={{
                position: 'absolute', top: '0.15rem', left: hit_default ? '1.15rem' : '0.15rem',
                width: '1.1rem', height: '1.1rem', borderRadius: '50%',
                background: 'white', transition: 'left 0.2s',
              }} />
            </button>
          </div>
        </div>
      </section>

      {/* Körper */}
      <section style={card}>
        <div className="flex items-center gap-2 mb-4">
          <User size={18} style={{ color: 'var(--orange)' }} />
          <h2 className="font-semibold text-base">Körper</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label style={labelCls}>Alter</label>
            <input
              type="number" min={15} max={99} value={age}
              onChange={e => set('age', Number(e.target.value))}
              style={inputCls}
            />
          </div>
          <div>
            <label style={labelCls}>Körpergewicht (kg)</label>
            <input
              type="number" min={30} max={300} step={0.5} value={weight_kg}
              onChange={e => set('weight_kg', Number(e.target.value))}
              style={inputCls}
            />
          </div>
        </div>
        <p style={{ fontSize: '0.72rem', color: 'var(--dim)', marginTop: '0.75rem' }}>
          Wird für Volumen-Empfehlungen und Coverage-Kontext genutzt.
        </p>
      </section>

      {/* Sync */}
      <section style={card}>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={18} style={{ color: '#a78bfa' }} />
          <h2 className="font-semibold text-base">Firestore Sync</h2>
        </div>
        <div className="flex items-center justify-between" style={{ background: 'var(--panel)', borderRadius: '0.6rem', padding: '0.6rem 0.85rem', border: '1px solid var(--line)', marginBottom: '0.75rem' }}>
          <span className="text-sm" style={{ color: 'var(--muted)' }}>Status</span>
          {firestoreStatus === null
            ? <span style={{ fontSize: '0.75rem', color: 'var(--dim)' }}>Prüfe…</span>
            : firestoreStatus.ok
              ? <span style={{ fontSize: '0.75rem', color: 'var(--green)', background: 'rgba(34,197,94,0.1)', borderRadius: '999px', padding: '0.2rem 0.75rem' }}>verbunden</span>
              : <span style={{ fontSize: '0.75rem', color: 'var(--red)', background: 'rgba(239,68,68,0.1)', borderRadius: '999px', padding: '0.2rem 0.75rem' }}>nicht erreichbar</span>
          }
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          style={{
            width: '100%', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.3)',
            borderRadius: '0.6rem', padding: '0.6rem', color: '#c4b5fd', fontSize: '0.875rem', cursor: 'pointer',
            opacity: syncing ? 0.5 : 1,
          }}
        >
          {syncing ? 'Synchronisiere…' : 'Jetzt synchronisieren'}
        </button>
      </section>

      {/* Darstellung */}
      <section style={card}>
        <div className="flex items-center gap-2 mb-4">
          <Activity size={18} style={{ color: 'var(--muted)' }} />
          <h2 className="font-semibold text-base">Darstellung</h2>
        </div>

        <p style={{ ...labelCls, marginBottom: '0.4rem' }}>Dunkel</p>
        <div className="grid grid-cols-4 gap-2 mb-4" style={{ background: 'var(--panel)', borderRadius: '0.75rem', padding: '0.3rem', border: '1px solid var(--line)' }}>
          {DARK_THEMES.map(t => (
            <ThemeBtn key={t.id} label={t.label}
              active={circDark === t.id}
              onClick={() => {
                onSetCircadianDark(t.id)
                if (themeMode !== 'circadian') onSetManualTheme(t.id)
              }}
            />
          ))}
        </div>

        <p style={{ ...labelCls, marginBottom: '0.4rem' }}>Hell</p>
        <div className="grid gap-2 mb-4" style={{ background: 'var(--panel)', borderRadius: '0.75rem', padding: '0.3rem', border: '1px solid var(--line)' }}>
          {LIGHT_THEMES.map(t => (
            <ThemeBtn key={t.id} label={t.label}
              active={circLight === t.id}
              onClick={() => {
                onSetCircadianLight(t.id)
                if (themeMode !== 'circadian') onSetManualTheme(t.id)
              }}
            />
          ))}
        </div>

        <div className="flex items-center justify-between" style={{ background: 'var(--panel)', borderRadius: '0.6rem', padding: '0.6rem 0.85rem', border: '1px solid var(--line)' }}>
          <div>
            <span className="text-sm">🌅 Circadian</span>
            {themeMode === 'circadian' && (
              <span style={{ fontSize: '0.7rem', color: 'var(--dim)', marginLeft: '0.5rem' }}>
                ☀️ {DAY_START}:00–{DAY_END}:00 · 🌙 {DAY_END}:00–{DAY_START}:00
              </span>
            )}
          </div>
          <button
            onClick={() => onSetThemeMode(themeMode === 'circadian' ? 'manual' : 'circadian')}
            style={{
              width: '2.5rem', height: '1.4rem', borderRadius: '999px', border: 'none', cursor: 'pointer',
              background: themeMode === 'circadian' ? 'var(--accent)' : 'var(--line)',
              position: 'relative', transition: 'background 0.2s', flexShrink: 0,
            }}
          >
            <span style={{
              position: 'absolute', top: '0.15rem',
              left: themeMode === 'circadian' ? '1.15rem' : '0.15rem',
              width: '1.1rem', height: '1.1rem', borderRadius: '50%',
              background: 'white', transition: 'left 0.2s',
            }} />
          </button>
        </div>
      </section>

      {/* System */}
      <section style={card}>
        <div className="flex items-center gap-2 mb-4">
          <Settings2 size={18} style={{ color: 'var(--dim)' }} />
          <h2 className="font-semibold text-base">System</h2>
        </div>
        <div className="grid gap-2">
          {[
            ['fitness-dev', health === null ? 'Prüfe…' : health.ok ? `online :${health.port}` : 'offline', health?.ok],
            ['wger', wger === null ? 'Prüfe…' : wger ? 'online :8000' : 'offline', wger],
            ['Daten', '~/.aos/fitness/', true],
            ['Katalog', '~/fitness-dev/catalog/kb/', true],
          ].map(([label, value, ok]) => (
            <div key={label} className="flex items-center justify-between" style={{ background: 'var(--panel)', borderRadius: '0.6rem', padding: '0.5rem 0.85rem', border: '1px solid var(--line)' }}>
              <span className="text-sm" style={{ color: 'var(--muted)' }}>{label}</span>
              <span style={{ fontSize: '0.75rem', color: ok ? 'var(--green)' : 'var(--dim)' }}>{value}</span>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
