import type { VercelRequest, VercelResponse } from '@vercel/node';
import { mustEnv } from '../_lib/github';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const clientId = mustEnv('GITHUB_OAUTH_CLIENT_ID');
  const appUrl = mustEnv('ADMIN_APP_URL'); // e.g. https://metadyne-admin.vercel.app

  const redirectUri = `${appUrl}/api/auth/callback`;
  const state = crypto.randomUUID();

  // NOTE: for v1 we skip state storage; we'll validate "best effort" by also tying it to a short-lived cookie.
  res.setHeader('Set-Cookie', `md_state=${encodeURIComponent(state)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`);

  const authorize = new URL('https://github.com/login/oauth/authorize');
  authorize.searchParams.set('client_id', clientId);
  authorize.searchParams.set('redirect_uri', redirectUri);
  authorize.searchParams.set('scope', 'read:user');
  authorize.searchParams.set('state', state);

  // optional: where to return user after auth
  const returnTo = typeof req.query.returnTo === 'string' ? req.query.returnTo : '';
  if (returnTo) authorize.searchParams.set('redirect_to', returnTo);

  res.statusCode = 302;
  res.setHeader('Location', authorize.toString());
  res.end();
}
