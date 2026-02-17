import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getCookie, json, mustEnv, setCookie } from '../_lib/github';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const code = typeof req.query.code === 'string' ? req.query.code : '';
    const state = typeof req.query.state === 'string' ? req.query.state : '';
    if (!code) return json(res, 400, { ok: false, error: 'Missing code' });

    const stateCookie = getCookie(req, 'md_state');
    if (!state || !stateCookie || state !== stateCookie) {
      return json(res, 400, { ok: false, error: 'State mismatch' });
    }

    const clientId = mustEnv('GITHUB_OAUTH_CLIENT_ID');
    const clientSecret = mustEnv('GITHUB_OAUTH_CLIENT_SECRET');

    const tokenResp = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json'
      },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code })
    });

    const tokenJson = await tokenResp.json();
    if (!tokenResp.ok || tokenJson.error) {
      return json(res, 400, { ok: false, error: tokenJson.error || 'Token exchange failed', detail: tokenJson });
    }

    const token = tokenJson.access_token as string;
    if (!token) return json(res, 400, { ok: false, error: 'No access token received' });

    // store token in httpOnly cookie (v1). Long-term: swap for encrypted session store.
    setCookie(res, 'md_gh', token, { maxAgeSec: 60 * 60 * 8 });

    const returnTo = mustEnv('ADMIN_RETURN_TO'); // e.g. https://bob-stewart.github.io/metadyne/
    res.statusCode = 302;
    res.setHeader('Location', returnTo);
    res.end();
  } catch (e: any) {
    json(res, 500, { ok: false, error: String(e?.message || e) });
  }
}
