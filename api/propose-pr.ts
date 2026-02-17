import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getCookie, ghFetch, json, mustEnv } from './_lib/github';

type Change = {
  path: string; // file path in repo
  content: string; // full new content (utf-8)
};

type Body = {
  title: string;
  body?: string;
  changes: Change[];
};

function b64(s: string) {
  return Buffer.from(s, 'utf8').toString('base64');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'POST only' });

    const token = getCookie(req, 'md_gh');
    if (!token) return json(res, 401, { ok: false, error: 'Not signed in' });

    const me = (await ghFetch('/user', token)) as any;
    const login = me.login as string;
    const allow = (mustEnv('ADMIN_ALLOW_GITHUB_LOGINS') || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (!allow.includes(login)) return json(res, 403, { ok: false, error: 'Not authorized' });

    const owner = mustEnv('MESHCORE_OWNER');
    const repo = mustEnv('MESHCORE_REPO');
    const baseBranch = mustEnv('MESHCORE_BRANCH');

    const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as Body;
    if (!body?.title || !Array.isArray(body?.changes) || body.changes.length === 0) {
      return json(res, 400, { ok: false, error: 'Missing title/changes' });
    }

    // 1) Get base branch sha
    const ref = (await ghFetch(`/repos/${owner}/${repo}/git/ref/heads/${baseBranch}`, token)) as any;
    const baseSha = ref.object.sha as string;

    // 2) Create new branch
    const branchName = `metadyne/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID().slice(0, 8)}`;
    await ghFetch(`/repos/${owner}/${repo}/git/refs`, token, {
      method: 'POST',
      body: { ref: `refs/heads/${branchName}`, sha: baseSha }
    });

    // 3) Apply file updates (create/update)
    for (const ch of body.changes) {
      // Get existing file sha if exists
      let existingSha: string | null = null;
      try {
        const existing = (await ghFetch(
          `/repos/${owner}/${repo}/contents/${encodeURIComponent(ch.path).replace(/%2F/g, '/')}`,
          token,
          { headers: { 'X-GitHub-Api-Version': '2022-11-28' } }
        )) as any;
        existingSha = existing.sha || null;
      } catch {
        existingSha = null;
      }

      await ghFetch(`/repos/${owner}/${repo}/contents/${encodeURIComponent(ch.path).replace(/%2F/g, '/')}`, token, {
        method: 'PUT',
        body: {
          message: `chore(metadyne): ${body.title}`,
          content: b64(ch.content),
          branch: branchName,
          ...(existingSha ? { sha: existingSha } : {})
        }
      });
    }

    // 4) Open PR
    const pr = (await ghFetch(`/repos/${owner}/${repo}/pulls`, token, {
      method: 'POST',
      body: {
        title: body.title,
        head: branchName,
        base: baseBranch,
        body: body.body || ''
      }
    })) as any;

    json(res, 200, { ok: true, prUrl: pr.html_url, number: pr.number });
  } catch (e: any) {
    json(res, 500, { ok: false, error: String(e?.message || e) });
  }
}
