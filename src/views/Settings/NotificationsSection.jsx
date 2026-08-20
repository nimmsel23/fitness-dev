import { Bell, BellOff, BellRing } from 'lucide-react'
import { usePushNotifications } from '../../hooks/usePushNotifications.js'

const TYPE_LABELS = {
  workout: 'Workout-Reminder',
  activeWorkout: 'Open-Workout-Reminder (1h nach Start)',
  habit: 'Habit-Reminder',
  coverage: 'Coverage-Alert (Muskelgruppe X Tage nicht trainiert)',
  restday: 'Rest-Day-Check (lange keine Session)',
}

export default function NotificationsSection({ user }) {
  const { settings, permission, busy, enable, disable, updateTypes, updateReminderTime } = usePushNotifications(user)

  if (permission === 'unsupported') return null

  return (
    <section className="card p-6 space-y-5 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-fit-accent/10 flex items-center justify-center">
          {settings?.enabled ? <BellRing size={18} className="text-fit-accent" /> : <BellOff size={18} className="text-fit-dim" />}
        </div>
        <div>
          <h3 className="text-base font-semibold text-fit-ink">Push-Benachrichtigungen</h3>
          <div className="text-xs text-fit-dim" style={{ opacity: 0.6 }}>
            {settings?.enabled ? 'Aktiv' : 'Deaktiviert'}
          </div>
        </div>
      </div>

      {permission === 'denied' && (
        <div className="text-xs font-medium text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl">
          Benachrichtigungen sind im Browser blockiert — in den Browser-Einstellungen für diese Seite erlauben.
        </div>
      )}

      <div className="text-xs font-medium text-sky-600 bg-sky-500/10 border border-sky-500/20 px-3 py-2 rounded-xl">
        iPhone/iPad: zuerst zum Home-Bildschirm hinzufügen und dann die installierte App öffnen. Push in einem normalen Safari-Tab ist auf iOS/iPadOS nicht zuverlässig genug.
      </div>

      {!settings?.enabled ? (
        <button
          onClick={enable}
          disabled={busy || permission === 'denied'}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-fit-accent text-black rounded-xl font-semibold text-xs hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
        >
          <Bell size={14} /> {busy ? 'Aktiviere…' : 'Push-Benachrichtigungen aktivieren'}
        </button>
      ) : (
        <div className="space-y-5">
          <div>
            <div className="text-xs font-medium mb-2 ml-1" style={{ color: 'var(--dim)', opacity: 0.7 }}>Erinnerungszeit</div>
            <input
              type="time"
              value={settings.reminderTime || '18:00'}
              onChange={(e) => updateReminderTime(e.target.value)}
              className="w-full bg-fit-bg2 border border-fit-line rounded-xl px-4 py-3 text-sm font-medium text-fit-ink focus:border-fit-accent outline-none transition-colors"
            />
          </div>

          <div className="space-y-2">
            {Object.entries(TYPE_LABELS).map(([key, label]) => (
              <label key={key} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-fit-bg2 border border-fit-line cursor-pointer">
                <span className="text-xs font-medium text-fit-ink">{label}</span>
                <input
                  type="checkbox"
                  checked={settings.types?.[key] ?? true}
                  onChange={(e) => updateTypes({ [key]: e.target.checked })}
                  className="accent-[var(--accent)] w-4 h-4"
                />
              </label>
            ))}
          </div>

          <button
            onClick={disable}
            disabled={busy}
            className="w-full py-2.5 text-xs font-semibold text-fit-dim bg-fit-bg border border-fit-line rounded-xl hover:text-fit-ink hover:border-fit-accent/40 transition-all cursor-pointer"
          >
            Deaktivieren
          </button>
        </div>
      )}
    </section>
  )
}
