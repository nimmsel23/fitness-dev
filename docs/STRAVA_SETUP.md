# Strava-Live-Import einrichten (Radtouren-Tab)

Voraussetzung, damit der "Strava"-Button im Radtouren-Tab (`Touren →
Tour importieren → Live-Verbindung`) tatsächlich verbindet statt den
"Nicht konfiguriert"-Hinweis zu zeigen.

## 1. Strava-API-App anlegen (einmalig, im Browser)

1. Bei Strava einloggen, dann zu https://www.strava.com/settings/api
2. Neue App anlegen:
   - **Application Name**: z.B. "fitness-dev" (beliebig, nur intern sichtbar)
   - **Category**: "Other" reicht
   - **Website**: `http://localhost` (Pflichtfeld, wird nicht geprüft)
   - **Authorization Callback Domain**: **nur der Host, ohne Port/Pfad/https**
     - Für lokale Entwicklung: `localhost`
     - Für den Prod-Server (falls dort später auch genutzt): die jeweilige
       Domain/IP, unter der `server.mjs` erreichbar ist
3. Nach dem Anlegen zeigt Strava **Client ID** und **Client Secret** an.

## 2. Credentials lokal ablegen

```bash
mkdir -p ~/.env
cat > ~/.env/strava.json <<'EOF'
{
  "client_id": "DEINE_CLIENT_ID",
  "client_secret": "DEIN_CLIENT_SECRET"
}
EOF
chmod 600 ~/.env/strava.json
```

Kein Server-Neustart-Zwang, aber `npm run dev` (bzw. der laufende
`server.mjs`-Prozess) muss die Datei nach dem Start einmal neu lesen — bei
laufendem Dev-Server also kurz neu starten.

## 3. Verbinden

1. Im Radtouren-Tab auf den **Strava**-Button unter "Live-Verbindung"
   klicken → Redirect zu Strava → dort die App autorisieren
   (Scope: `activity:read_all`, nur Lesezugriff).
2. Strava leitet zurück zu `/tours/strava/callback` → `server.mjs` tauscht
   den Code serverseitig gegen Access-/Refresh-Token, speichert sie unter
   `~/.aos/users/<uid>/fitness/integrations/strava.json` (pro Nutzer,
   `client_secret` verlässt nie den Browser).
3. Zurück im Radtouren-Tab zeigt der Strava-Button jetzt "Verbunden — Touren
   holen" — erneuter Klick importiert die letzten 30 Rad-Aktivitäten
   (Ride/GravelRide/MountainBikeRide/EBikeRide/VirtualRide, alles andere wird
   rausgefiltert).

Token-Refresh läuft automatisch im Hintergrund (`strava-integration.mjs`,
`refreshIfNeeded()`) — kein erneutes manuelles Verbinden nötig, solange der
Refresh-Token gültig bleibt.

## Bekannte Lücke: Prod-Firebase-PWA (Simon nutzt diese, nicht den Dev-Server)

Dieser Flow läuft ausschließlich über `server.mjs` (Node-Backend) — das
existiert nur im lokalen/Dev-Modus bzw. auf `fitness.service` (:6100). Die
**Firebase-PWA** (`fitness-aos.web.app`, was Simon tatsächlich in der App
nutzt) hat keinen Node-Backend-Unterbau (`@db` zeigt dort auf
`db.firestore.js`, direkter Firestore-SDK-Zugriff, kein Server dazwischen).

Damit Simon selbst "Verbinden" klicken kann, bräuchte es zusätzlich eine
**Firebase Cloud Function** (oder einen alternativen HTTPS-Endpoint), die
denselben OAuth-Code-Exchange serverseitig übernimmt — `client_secret` darf
so oder so nie im Browser-Bundle landen. Das ist bewusst noch nicht gebaut
(separater Scope, eigene Freigabe/Deploy nötig) — bis dahin bleibt für
Prod-Nutzer weiterhin der Datei-Export-Weg (GPX/TCX/FIT hochladen) der
einzige funktionierende Import.
