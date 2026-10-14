/**
 * useSessionGateController — GPS-Start/Stop + Timer-Status der Session,
 * aus useSession.js herausgelöst (PHASE3_TODO.md Stück 4, rein mechanisch,
 * keine Logik/Werte verändert, ein Doku-Klärung siehe unten).
 *
 * Braucht `location`/`setLocation`/`duration`/`setDuration` von außen
 * (Basis-Session-Felder, bleiben bewusst im Haupthook, da sie auch ohne
 * jedes Gate-Feature existieren) sowie `save` (die aktuelle Save-Closure
 * des Haupthooks — per Hoisting bereits verfügbar, da `save` dort als
 * `async function` deklariert ist) und `setDirty`/`showToast`.
 *
 * Doku-Klärung zu den "zwei getrennten Fehler-Enums" aus dem DB-Layer-Audit
 * (PHASE3_TODO.md Stück 4): `getCurrentPosition()` hat ein echtes
 * `errorReason`-Enum (denied/timeout/unavailable/unsupported), das für den
 * Start-Toast genutzt wird. `resolveGeoLocation()` (lib/geoLocate.js) hat
 * dagegen KEIN Fehler-Enum — es fängt jeden eigenen Fehlschlag (Overpass/
 * Nominatim down oder Timeout) bereits intern ab und degradiert still auf
 * den nächstschwächeren Fallback (Gym -> Adresse -> rohe Koordinaten),
 * liefert nur bei ungültigen Koordinaten `null` zurück. Es gibt also
 * technisch keine zwei konkurrierenden Enums zu vereinheitlichen — die
 * Unklarheit war, dass `resolveGeoLocation()`s Fehlschläge für den User
 * unsichtbar sind (kein Toast, falls z.B. Nominatim down ist und nur noch
 * rohe Koordinaten übrig bleiben). Bewusst NICHT geändert: ein zusätzlicher
 * Toast für "nur Koordinaten statt Adresse" wäre mehr Rauschen als Nutzen
 * (`gps.label` zeigt die Koordinaten ja bereits sichtbar an) — hier nur
 * dokumentiert, damit die nächste Person nicht erneut nach einem
 * nichtexistenten zweiten Enum sucht.
 */

import { normalizeSessionGate, estimateDurationMinutes } from '../../lib/sessionGate.js';
import { resolveGeoLocation } from '../../lib/geoLocate.js';
import { useState } from 'react';

// GPS-Fix drinnen (Gym, Beton/Stahl) dauert oft länger als ein knapper
// Timeout erlaubt — jeder Fehler (Timeout, Denial, Unavailable) lief bisher
// still in `resolve(null)`, ohne dass man es je bemerkt hätte (Bug-Fund
// 2026-08-09: sessionGate.gps blieb trotz erteilter Berechtigung null).
// enableHighAccuracy:true + 15s Timeout, Fehlergrund wird zurückgegeben statt
// verschluckt, damit startSessionGate() sichtbares Feedback geben kann.
function getCurrentPosition() {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return Promise.resolve({ position: null, errorReason: 'unsupported' });
  }
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        position: {
          lat: position.coords?.latitude ?? null,
          lng: position.coords?.longitude ?? null,
          accuracy: position.coords?.accuracy ?? null,
          capturedAt: new Date().toISOString(),
        },
        errorReason: null,
      }),
      (err) => {
        const reason = err?.code === 1 ? 'denied' : err?.code === 3 ? 'timeout' : 'unavailable';
        resolve({ position: null, errorReason: reason });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5 * 60 * 1000 },
    );
  });
}

const GPS_ERROR_LABELS = {
  denied: 'Standort-Zugriff verweigert',
  timeout: 'Standort-Fix hat zu lange gedauert (drinnen oft schwach)',
  unavailable: 'Standort nicht verfügbar',
  unsupported: 'Standort wird nicht unterstützt',
};

export function useSessionGateController({ location, setLocation, duration, setDuration, save, setDirty, showToast }) {
  const [sessionGate, setSessionGate] = useState(() => normalizeSessionGate(null));

  async function startSessionGate() {
    const { position: gps, errorReason } = await getCurrentPosition();
    const geo = gps ? await resolveGeoLocation(gps.lat, gps.lng) : null;
    const nextGate = normalizeSessionGate({
      status: 'active',
      startedAt: new Date().toISOString(),
      endedAt: null,
      gps: gps && geo ? { ...gps, label: geo.label, mapsUrl: geo.mapsUrl, source: geo.source } : gps,
    });
    // Vorhandenen manuellen Location-Text nie überschreiben — nur befüllen, wenn leer.
    const nextLocation = (!location.trim() && geo?.label) ? geo.label : undefined;
    setSessionGate(nextGate);
    if (nextLocation) setLocation(nextLocation);
    setDirty(false);
    await save(false, { sessionGate: nextGate, location: nextLocation });
    if (errorReason) {
      showToast(`Workout gestartet · ${GPS_ERROR_LABELS[errorReason] || 'Standort nicht erfasst'}`);
    } else {
      showToast('Workout gestartet');
    }
  }

  async function stopSessionGate() {
    const baseGate = normalizeSessionGate(sessionGate);
    if (!baseGate.startedAt) return;
    const nextGate = normalizeSessionGate({
      status: 'completed',
      startedAt: baseGate.startedAt,
      endedAt: new Date().toISOString(),
    });
    const nextDuration = duration || estimateDurationMinutes(nextGate);
    setSessionGate(nextGate);
    if (nextDuration && nextDuration !== duration) setDuration(nextDuration);
    setDirty(false);
    await save(false, { sessionGate: nextGate, duration: nextDuration });
    showToast('Workout beendet');
  }

  return { sessionGate, setSessionGate, startSessionGate, stopSessionGate };
}
