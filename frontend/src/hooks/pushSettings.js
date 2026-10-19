// Reine Hilfen für das Notification-Panel (ohne Firebase/Vite-Aliase, damit mit `node --test` prüfbar).

export const DEFAULT_QUIET_HOURS = { enabled: false, start: '22:00', end: '07:00' }

export { describeDevice } from '../lib/deviceInfo.js'

export function mergePushSettings(base = {}, patch = {}) {
  const merged = { ...base, ...patch }
  const tokens = Array.from(new Set([
    ...(Array.isArray(base?.tokens) ? base.tokens : []),
    ...(base?.token ? [base.token] : []),
    ...(Array.isArray(patch?.tokens) ? patch.tokens : []),
    ...(patch?.token ? [patch.token] : []),
  ].filter(Boolean)))

  // Geräteliste: nur Einträge, deren Token noch existiert; der neueste Eintrag je Token gewinnt
  const devices = new Map()
  for (const device of [...(base?.devices || []), ...(patch?.devices || [])]) {
    if (device?.token && tokens.includes(device.token)) devices.set(device.token, device)
  }

  return {
    enabled: false,
    types: {},
    reminderTime: '18:00',
    quietHours: DEFAULT_QUIET_HOURS,
    mutedClients: [],
    clientWorkoutMode: 'all',
    ...merged,
    token: tokens[0] || merged.token || null,
    tokens,
    devices: Array.from(devices.values()),
  }
}
