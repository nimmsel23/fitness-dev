import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import { api, localToday } from '../api.js'

export default function Journal() {
  const [date, setDate]       = useState(localToday())
  const [content, setContent] = useState('')
  const [saving, setSaving]   = useState(false)
  const [toast, setToast]     = useState('')
  const [entries, setEntries] = useState([])

  useEffect(() => { loadEntries() }, [])

  useEffect(() => {
    api.get(`/journal?date=${date}`).then(d => {
      if (d?.ok) setContent(d.content || '')
      else setContent('')
    }).catch(() => setContent(''))
  }, [date])

  async function loadEntries() {
    try {
      const r = await api.get('/journal/list')
      setEntries(r?.entries || [])
    } catch {}
  }

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 2000) }

  async function save() {
    setSaving(true)
    try {
      await api.post(`/journal?date=${date}`, { content })
      showToast('Gespeichert')
      loadEntries()
    } catch { showToast('Fehler') }
    finally { setSaving(false) }
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input
          type="date" value={date} max={localToday()}
          onChange={e => setDate(e.target.value)}
          className="flex-1 px-3 py-2 rounded-xl text-sm"
          style={{ background: 'var(--card)', border: '1px solid var(--line)', color: 'var(--ink)', outline: 'none' }}
        />
        <button onClick={save} disabled={saving}
          className="px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-1.5"
          style={{ background: 'var(--accent)', color: '#080b12', opacity: saving ? 0.6 : 1 }}>
          <Save size={14} /> {saving ? '…' : 'Speichern'}
        </button>
      </div>

      <textarea value={content} onChange={e => setContent(e.target.value)} rows={12}
        placeholder="Training, Notizen, Learnings…"
        className="w-full px-3 py-3 text-sm rounded-2xl resize-none mb-4"
        style={{ background: 'var(--card)', border: '1px solid var(--line)', color: 'var(--ink)', outline: 'none', lineHeight: '1.65' }}
        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
        onBlur={e => e.target.style.borderColor = 'var(--line)'}
      />

      {entries.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--line)' }}>
          <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest"
            style={{ background: 'var(--bg2)', color: 'var(--muted)', borderBottom: '1px solid var(--line)' }}>
            Einträge
          </div>
          <div style={{ maxHeight: '220px', overflowY: 'auto', background: 'var(--card)' }}>
            {entries.map(e => (
              <button key={e.date} onClick={() => setDate(e.date)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm border-b last:border-0"
                style={{
                  borderColor: 'var(--line)',
                  background: date === e.date ? 'var(--accent)' + '15' : 'transparent',
                  color: date === e.date ? 'var(--accent)' : 'var(--ink)',
                  textAlign: 'left',
                }}
                onMouseEnter={ev => { if (date !== e.date) ev.currentTarget.style.background = 'var(--card-hover)' }}
                onMouseLeave={ev => { if (date !== e.date) ev.currentTarget.style.background = 'transparent' }}
              >
                <span>{e.date}</span>
                <span className="text-xs" style={{ color: 'var(--muted)' }}>{(e.mtime || '').slice(0,10)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-sm font-medium shadow-xl z-50"
          style={{ background: 'var(--card)', color: 'var(--accent)', border: '1px solid var(--line)' }}>
          {toast}
        </div>
      )}
    </div>
  )
}
