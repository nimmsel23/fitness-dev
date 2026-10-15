import test from 'node:test'
import assert from 'node:assert/strict'
import { DEFAULT_QUIET_HOURS, describeDevice, mergePushSettings } from './pushSettings.js'

test('Gerätebeschreibung aus dem User-Agent', () => {
  assert.equal(describeDevice('Mozilla/5.0 (Linux; Android 14) AppleWebKit Chrome/120 Mobile Safari/537'), 'Chrome · Android')
  assert.equal(describeDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit Version/17 Safari/604'), 'Safari · iOS')
  assert.equal(describeDevice('Mozilla/5.0 (X11; Linux x86_64; rv:130.0) Gecko/20100101 Firefox/130.0'), 'Firefox · Linux')
  assert.equal(describeDevice('Mozilla/5.0 (Windows NT 10.0) Chrome/120 Edg/120'), 'Edge · Windows')
  assert.equal(describeDevice(''), 'Browser · Gerät')
})

test('Standardwerte und Token-Vereinigung', () => {
  const s = mergePushSettings({ token: 'a' }, { tokens: ['b'] })
  assert.deepEqual(s.tokens, ['a', 'b'])
  assert.equal(s.token, 'a')
  assert.deepEqual(s.quietHours, DEFAULT_QUIET_HOURS)
  assert.deepEqual(s.mutedClients, [])
  assert.equal(s.clientWorkoutMode, 'all')
  assert.equal(s.reminderTime, '18:00')
})

test('Geräteliste: neues Gerät kommt dazu, doppelter Token ersetzt, verwaiste fallen weg', () => {
  const base = mergePushSettings({}, { token: 'a', devices: [{ token: 'a', label: 'alt' }, { token: 'weg', label: 'verwaist' }] })
  assert.deepEqual(base.devices.map((d) => d.token), ['a'])
  const next = mergePushSettings(base, { token: 'b', devices: [{ token: 'b', label: 'neu' }, { token: 'a', label: 'aktualisiert' }] })
  assert.deepEqual(next.devices.map((d) => [d.token, d.label]), [['a', 'aktualisiert'], ['b', 'neu']])
})

test('Patch überschreibt Panel-Felder, ohne Tokens zu verlieren', () => {
  const base = mergePushSettings({}, { enabled: true, token: 'a', mutedClients: ['U1'] })
  const next = mergePushSettings(base, { quietHours: { enabled: true, start: '21:00', end: '06:30' }, mutedClients: [] })
  assert.deepEqual(next.tokens, ['a'])
  assert.equal(next.quietHours.start, '21:00')
  assert.deepEqual(next.mutedClients, [])
  assert.equal(next.enabled, true)
})
