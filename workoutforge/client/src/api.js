const BASE = "/api";

async function req(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: body ? { "content-type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
    cache: method === "GET" ? "no-store" : "default",
  });
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}`);
  return res.json();
}

export const api = {
  get:    (path)        => req("GET",    path),
  post:   (path, body)  => req("POST",   path, body),
  patch:  (path, body)  => req("PATCH",  path, body),
  put:    (path, body)  => req("PUT",    path, body),
  delete: (path)        => req("DELETE", path),
};
