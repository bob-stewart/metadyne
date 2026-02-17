import type { VercelRequest, VercelResponse } from '@vercel/node';
import { json } from './_lib/github';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  json(res, 200, { ok: true, service: 'metadyne-admin' });
}
