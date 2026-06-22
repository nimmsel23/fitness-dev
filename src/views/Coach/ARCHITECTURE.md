# View Architecture: Coach

Versteckte Admin-Ansicht für Coach-seitige Exercise-Freigabe. Nicht in der Nav — erreichbar per `#coach`, nur für lokale Instanz / alpha-User (Guard in `App.jsx`).

## Komponenten

- **`index.jsx`**: Einzige Datei. Lädt globale Inbox, rendert Approve-Liste mit Optimistic UI.

## Zugang (App.jsx)

Guard in `App.jsx`: Tab nur sichtbar für lokale Instanz (`isLocalMode()`) oder bestimmte User-Accounts. Kein öffentlicher Zugang.

## Datenfluss

- `getGlobalInbox()` → `GET /fitness/inbox` → Liste ausstehender Exercise-Kandidaten
- `approveInbox(fileId, userId)` → `POST /fitness/inbox/:id/approve`
- Optimistic UI: nach Approve wird Item sofort per `.filter()` aus State entfernt, kein Re-Fetch

## Bekannte Schwachstellen

- `getGlobalInbox()` ist identisch mit `getInbox()` — kein echtes Mehrmandanten-Backend dahinter
- `approveInbox(fileId, userId)` übergibt `userId`, aber `kb.js` ignoriert ihn (nur ein Parameter) — userId erreicht das Backend nie
- Strukturell fast identisch mit `Inbox.jsx` — Duplikation

## Kontext: Coach-Klient-System

Diese View ist ein Platzhalter für das geplante Coach-Klient-System. Der aktuelle Stand (keine pro-User-Firestore-Collection, kein echtes Mehrmandanten-Routing) macht eine vollständige Implementierung noch nicht möglich. Siehe `DISCONNECTED.md` #1.
