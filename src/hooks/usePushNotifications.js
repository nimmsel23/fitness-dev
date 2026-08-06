import { useCallback, useEffect, useState } from 'react'
import { isLocalMode, getPushSettings, savePushSettings } from '@db'
import { getMessagingIfSupported } from '@cloud/firebase.js'
import { getToken } from 'firebase/messaging'
import { VAPID_KEY } from '@firebase-config'

const PUSH_SW_URL = '/firebase-messaging-sw.js'
const PUSH_SW_SCOPE = '/firebase-push/'

function mergePushSettings(base = {}, patch = {}) {
  const merged = { ...base, ...patch }
  const tokens = Array.from(new Set([
    ...(Array.isArray(base?.tokens) ? base.tokens : []),
    ...(base?.token ? [base.token] : []),
    ...(Array.isArray(patch?.tokens) ? patch.tokens : []),
    ...(patch?.token ? [patch.token] : []),
  ].filter(Boolean)))
  return {
    enabled: false,
    types: {},
    reminderTime: '18:00',
    ...merged,
    token: tokens[0] || merged.token || null,
    tokens,
  }
}

export function usePushNotifications(user) {
  const [settings, setSettings] = useState(null)
  const [permission, setPermission] = useState(() =>
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  )
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (isLocalMode() || !user) return
    let alive = true
    getPushSettings().then((s) => alive && setSettings(mergePushSettings({}, s)))
    return () => { alive = false }
  }, [user])

  const enable = useCallback(async () => {
    if (isLocalMode() || !user) return
    setBusy(true)
    try {
      const messaging = await getMessagingIfSupported()
      if (!messaging) throw new Error('Push wird auf diesem Gerät/Browser nicht unterstützt')

      const perm = await Notification.requestPermission()
      setPermission(perm)
      if (perm !== 'granted') return

      const registration = await navigator.serviceWorker.register(PUSH_SW_URL, { scope: PUSH_SW_SCOPE })
      const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: registration })
      if (!token) throw new Error('Kein Push-Token erhalten')

      const next = mergePushSettings(settings, { enabled: true, token })
      await savePushSettings(next)
      setSettings(next)
    } finally {
      setBusy(false)
    }
  }, [user, settings])

  const disable = useCallback(async () => {
    if (isLocalMode() || !user) return
    setBusy(true)
    try {
      const next = mergePushSettings(settings, { enabled: false })
      await savePushSettings(next)
      setSettings(next)
    } finally {
      setBusy(false)
    }
  }, [user, settings])

  const updateTypes = useCallback(async (types) => {
    if (isLocalMode() || !user) return
    const next = mergePushSettings(settings, { types: { ...(settings?.types || {}), ...types } })
    setSettings(next)
    await savePushSettings(next)
  }, [user, settings])

  const updateReminderTime = useCallback(async (reminderTime) => {
    if (isLocalMode() || !user) return
    const next = mergePushSettings(settings, { reminderTime })
    setSettings(next)
    await savePushSettings(next)
  }, [user, settings])

  return { settings, permission, busy, enable, disable, updateTypes, updateReminderTime }
}
