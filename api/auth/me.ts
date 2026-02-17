import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getCookie, ghFetch, json, mustEnv } from '../_lib/github';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const token = getCookie(req, 'md_gh');
    if (!token) return json(res, 200, { authed: false });

    const me = await ghFetch('/user', token);
    const allow = (mustEnv('ADMIN_ALLOW_GITHUB_LOGINS') || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const login = (me as any).login as string;
    const authed = allow.includes(login);
    return json(res, 200, { authed, login });
  } catch (e: any) {
    json(res, 200, { authed: false, error: String(e?.message || e) });
  }
}
