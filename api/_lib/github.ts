import type { VercelRequest, VercelResponse } from '@vercel/node';

type GhOpts = { method?: string; headers?: Record<string, string>; body?: unknown };

export function json(res: VercelResponse, status: number, data: unknown) {
  res.status(status).setHeader('content-type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data, null, 2));
}

export function mustEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export async function ghFetch(path: string, token: string, opts: GhOpts = {}) {
  const url = `https://api.github.com/${path.replace(/^\//, '')}`;
  const r = await fetch(url, {
    method: opts.method || 'GET',
    headers: {
      accept: 'application/vnd.github+json',
      'user-agent': 'metadyne-admin',
      authorization: `Bearer ${token}`,
      ...(opts.headers || {})
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined
  });

  const text = await r.text();
  const data = text ? safeJson(text) : null;

  if (!r.ok) {
    const msg = (data && (data as any).message) || text || r.statusText;
    throw new Error(`GitHub API error ${r.status}: ${msg}`);
  }

  return data;
}

function safeJson(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}

export function getCookie(req: VercelRequest, name: string): string | null {
  const raw = req.headers.cookie || '';
  const parts = raw.split(';').map((p) => p.trim());
  for (const p of parts) {
    if (!p) continue;
    const idx = p.indexOf('=');
    if (idx === -1) continue;
    const k = p.slice(0, idx);
    const v = p.slice(idx + 1);
    if (k === name) return decodeURIComponent(v);
  }
  return null;
}

export function setCookie(res: VercelResponse, name: string, value: string, opts?: { maxAgeSec?: number }) {
  const secure = process.env.NODE_ENV === 'production';
  const attrs = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    secure ? 'Secure' : '',
    opts?.maxAgeSec != null ? `Max-Age=${opts.maxAgeSec}` : ''
  ].filter(Boolean);

  res.setHeader('Set-Cookie', attrs.join('; '));
}
