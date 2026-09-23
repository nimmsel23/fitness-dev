/**
 * strava-routes.mjs — Hono-Sub-Router für den Strava-Live-Import
 * (Radtouren-Tab). Reine HTTP-Schicht (Request/Response, Redirects,
 * Fehler-Mapping) — die eigentliche OAuth-/API-Logik sitzt in
 * strava-integration.mjs, wird hier nur aufgerufen.
 *
 * Gemountet in server.mjs via `app.route("/tours/strava", stravaRoutes(...))`
 * — Pfade hier sind deshalb relativ zu diesem Mount-Punkt.
 */
import { Hono } from "hono";
import { stravaStatus, buildAuthorizeUrl, exchangeCodeForTokens, fetchStravaTours, disconnectStrava } from "./strava-integration.mjs";

// redirectUri wird aus der eingehenden Request gebaut (nicht hartcodiert),
// damit dev (:9100) und prod (:6100) ohne Code-Änderung funktionieren — muss
// aber in der Strava-App-Config als "Authorization Callback Domain" (nur der
// Host, kein Port/Pfad) hinterlegt sein. Siehe docs/STRAVA_SETUP.md.
function stravaRedirectUri(c) {
  const url = new URL(c.req.url);
  return `${url.protocol}//${url.host}/tours/strava/callback`;
}

/**
 * @param {{ dataDir: string, log: import('pino').Logger }} deps
 */
export function stravaRoutes({ dataDir, log }) {
  const router = new Hono();

  router.get("/status", (c) => {
    return c.json({ ok: true, ...stravaStatus(dataDir) });
  });

  router.get("/authorize", (c) => {
    try {
      const authorizeUrl = buildAuthorizeUrl(stravaRedirectUri(c));
      return c.redirect(authorizeUrl);
    } catch (err) {
      return c.json({ ok: false, error: err.message }, 400);
    }
  });

  router.get("/callback", async (c) => {
    const code = c.req.query("code");
    const error = c.req.query("error");
    if (error) return c.redirect(`/#tours?strava_error=${encodeURIComponent(error)}`);
    if (!code) return c.json({ ok: false, error: "Strava: kein code-Parameter im Callback." }, 400);
    try {
      await exchangeCodeForTokens({ dataDir, code, redirectUri: stravaRedirectUri(c) });
      return c.redirect("/#tours?strava_connected=1");
    } catch (err) {
      log.error({ err }, "[strava] Token-Exchange fehlgeschlagen");
      return c.redirect(`/#tours?strava_error=${encodeURIComponent(err.message)}`);
    }
  });

  router.get("/activities", async (c) => {
    try {
      const tours = await fetchStravaTours({ dataDir, perPage: Number(c.req.query("per_page") || 30) });
      return c.json({ ok: true, tours });
    } catch (err) {
      return c.json({ ok: false, error: err.message }, 400);
    }
  });

  router.post("/disconnect", (c) => {
    disconnectStrava(dataDir);
    return c.json({ ok: true });
  });

  return router;
}
