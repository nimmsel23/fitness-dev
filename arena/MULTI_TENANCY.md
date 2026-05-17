# MUSCLE ARENA - Multi-Tenancy Architecture

## Overview

MUSCLE ARENA ist **multi-tenant** und funktioniert in zwei Contexts:
1. **Personal Context** (alpha's eigene Daten)
2. **Client Context** (individuelle Client-Daten)

---

## URL Structure

### Personal Context (alpha)
```
URL: http://localhost:8788/fitness/arena/
Data stored: ~/vital-hub/personal/sessions/
API endpoints: /session, /anatomy, /exercises, etc.
```

### Client Context (per client)
```
URL: http://localhost:8788/c/{CLIENT_ID}/fitness/arena/
Data stored: ~/vital-hub/clients/_entries/{CLIENT_ID}/sessions/
API endpoints: /c/{CLIENT_ID}/session, /c/{CLIENT_ID}/anatomy, etc.
```

**Example Clients:**
- `/c/matthias/fitness/arena/` → Matthias' personal MUSCLE ARENA
- `/c/mathmay/fitness/arena/` → Mathmay's personal MUSCLE ARENA
- `/c/test-kunde/fitness/arena/` → Test client's MUSCLE ARENA

---

## How Multi-Tenancy Works

### 1. **Relative Asset Paths**
Vite config uses **relative base path** (`./`) instead of absolute:

```js
// vite.config.mjs
export default defineConfig({
  base: "./",  // ← Relative, not "/fitness/arena/"
});
```

**Result:**
- Assets load from `./assets/index-DW8mI6Da.js` (relative to current URL)
- Works in both `/fitness/arena/` and `/c/{CLIENT_ID}/fitness/arena/`

### 2. **Relative API URLs**
Main.js uses **relative URL resolution** with `../../`:

```js
// src/main.mjs
function apiUrl(relPath) {
  return new URL(`../../${relPath}`, window.location.href).toString();
}
```

**Resolution Examples:**

| Context | Current URL | `apiUrl("session")` | Resolves To |
|---------|-------------|---------------------|-------------|
| Personal | `/fitness/arena/` | `../../session` | `/session` |
| Client | `/c/matthias/fitness/arena/` | `../../session` | `/c/matthias/session` |

**Why `../../` works:**
- Goes up 2 levels from `/fitness/arena/`
- Personal: Lands at root `/`
- Client: Lands at `/c/{CLIENT_ID}/`

### 3. **Server-Side Routing**
`fitnessctx/server.mjs` handles both contexts:

```js
// Personal endpoint
if (req.method === "POST" && url.pathname === "/session") {
  // Save to ~/vital-hub/personal/sessions/
}

// Client endpoint
if (req.method === "POST" && url.pathname.startsWith("/c/")) {
  const clientId = extractClientId(url.pathname);
  // Save to ~/vital-hub/clients/_entries/{clientId}/sessions/
}
```

---

## Data Isolation

### Personal Data (alpha)
```
~/vital-hub/personal/
├── sessions/
│   └── 2026-03-09.json  ← alpha's workout logs
├── journal/
├── habits/
└── ...
```

### Client Data (per client)
```
~/vital-hub/clients/_entries/matthias/
├── sessions/
│   └── 2026-03-09.json  ← Matthias' workout logs
├── journal/
├── habits/
└── ...
```

**Data is completely isolated** - clients can't access each other's data or alpha's personal data.

---

## Testing Multi-Tenancy

### Manual Testing

**Personal Context:**
```bash
# Open in browser
http://localhost:8788/fitness/arena/

# Log a workout
# Check data saved to: ~/vital-hub/personal/sessions/YYYY-MM-DD.json
```

**Client Context:**
```bash
# Open in browser
http://localhost:8788/c/matthias/fitness/arena/

# Log a workout
# Check data saved to: ~/vital-hub/clients/_entries/matthias/sessions/YYYY-MM-DD.json
```

### Automated Testing

```bash
# Test asset loading (should return 200 for both)
curl -I http://localhost:8788/fitness/arena/assets/index-DW8mI6Da.js
curl -I http://localhost:8788/c/matthias/fitness/arena/assets/index-DW8mI6Da.js

# Test data loading (should return 200 for both)
curl -I http://localhost:8788/fitness/arena/data/anatomy.json
curl -I http://localhost:8788/c/matthias/fitness/arena/data/anatomy.json

# Test API endpoints (404 = no session yet, which is OK)
curl "http://localhost:8788/session?date=2026-03-09"
curl "http://localhost:8788/c/matthias/session?date=2026-03-09"
```

---

## Common Pitfalls (Avoided)

### ❌ **Absolute Base Path**
```js
// WRONG - only works in personal context
base: "/fitness/arena/"
```
→ Assets would load from `/fitness/arena/assets/...` even in client context
→ Clients would load personal data (security issue!)

### ❌ **Hardcoded API Endpoints**
```js
// WRONG - always saves to personal endpoint
fetch("/session", { method: "POST", ... })
```
→ Client logs would save to alpha's personal data (security issue!)

### ✅ **Relative Paths (Correct)**
```js
// CORRECT - works in both contexts
base: "./"
apiUrl: new URL("../../session", window.location.href)
```
→ Assets and API calls resolve correctly per context
→ Data isolation maintained

---

## Benefits of Multi-Tenancy

1. **Single Codebase** - Same MUSCLE ARENA build works for all users
2. **Data Isolation** - Each client has separate data storage
3. **Easy Deployment** - No per-client builds or configurations
4. **Scalable** - Add new clients by creating directory + URL route
5. **Consistent UX** - All users get same features and updates

---

## Adding New Clients

To add a new client:

1. **Create client directory:**
   ```bash
   mkdir -p ~/vital-hub/clients/_entries/new-client/sessions
   mkdir -p ~/vital-hub/clients/_entries/new-client/journal
   ```

2. **Access via URL:**
   ```
   http://localhost:8788/c/new-client/fitness/arena/
   ```

3. **Data automatically saved to:**
   ```
   ~/vital-hub/clients/_entries/new-client/sessions/
   ```

No code changes needed!

---

## Security Considerations

1. **Client ID Validation** - Server validates client IDs match pattern `[a-z0-9_-]+`
2. **Path Traversal Prevention** - Server sanitizes paths to prevent `../` attacks
3. **Data Isolation** - Each client's data directory is separate
4. **No Cross-Client Access** - API endpoints enforce client context

---

## Future Enhancements

- [ ] Client-specific theming (custom colors per client)
- [ ] Client-specific exercise libraries (custom exercises)
- [ ] Client progress comparison (anonymized aggregate stats)
- [ ] Client-specific UI customization (hide/show features)

---

**Status:** ✅ Multi-Tenancy fully functional and tested
**Last Updated:** 2026-03-09
**Architecture:** Relative paths + URL resolution + server-side routing
