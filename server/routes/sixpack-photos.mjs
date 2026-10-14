// Dev Node host forwards bytes and Authorization unchanged to the Python owner.
import { Hono } from 'hono';
export function sixpackPhotoRoutes({ pythonBase = 'http://127.0.0.1:9150', fetchImpl = fetch } = {}) {
  const app = new Hono();
  async function proxy(c) {
    const source = new URL(c.req.url);
    const headers = new Headers(c.req.raw.headers);
    headers.delete('host');
    try {
      const response = await fetchImpl(`${pythonBase}${source.pathname}${source.search}`, {
        method: c.req.method, headers,
        body: ['GET', 'HEAD'].includes(c.req.method) ? undefined : c.req.raw.body,
        duplex: 'half', redirect: 'manual', signal: c.req.raw.signal,
      });
      return new Response(response.body, { status: response.status, headers: response.headers });
    } catch {
      return c.json({ ok: false, error: 'fitness_api_unreachable' }, 502);
    }
  }
  app.all('/sixpack/photos', proxy);
  app.all('/sixpack-photos/*', proxy);
  return app;
}
