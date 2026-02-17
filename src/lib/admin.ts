const ADMIN_BASE = (import.meta as any).env?.VITE_ADMIN_API_BASE || '';

export type AdminMe = { authed: boolean; login?: string; error?: string };

export function adminBase() {
  return ADMIN_BASE.replace(/\/$/, '');
}

export function adminLoginUrl(returnTo?: string) {
  const u = new URL(adminBase() + '/api/auth/login');
  if (returnTo) u.searchParams.set('returnTo', returnTo);
  return u.toString();
}

export async function adminMe(): Promise<AdminMe> {
  if (!ADMIN_BASE) return { authed: false, error: 'VITE_ADMIN_API_BASE not set' };
  const r = await fetch(adminBase() + '/api/auth/me', { credentials: 'include' });
  return (await r.json()) as AdminMe;
}

export async function proposePr(payload: {
  title: string;
  body?: string;
  changes: Array<{ path: string; content: string }>;
}): Promise<{ ok: boolean; prUrl?: string; number?: number; error?: string }> {
  const r = await fetch(adminBase() + '/api/propose-pr', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  return (await r.json()) as any;
}
