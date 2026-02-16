import { useEffect, useState } from 'react';
import { ghFetchJson, ghListDir } from '../lib/github';
import type { IrbBacklog } from '../lib/types';

async function listBacklogJsonPaths(): Promise<string[]> {
  const root = 'projects/ai-irb/backlog';
  const years = (await ghListDir(root)).filter((e) => e.type === 'dir');
  const paths: string[] = [];

  for (const y of years.slice(-2)) {
    const months = (await ghListDir(y.path)).filter((e) => e.type === 'dir');
    for (const m of months.slice(-2)) {
      const days = (await ghListDir(m.path)).filter((e) => e.type === 'dir');
      for (const d of days.slice(-14)) {
        const hours = (await ghListDir(d.path)).filter((e) => e.type === 'dir');
        for (const h of hours.slice(-24)) {
          const files = await ghListDir(h.path);
          const json = files.find((f) => f.type === 'file' && f.name === 'irb-improvement.json');
          if (json) paths.push(json.path);
        }
      }
    }
  }

  return paths.sort().slice(-72);
}

export default function Backlog() {
  const [items, setItems] = useState<IrbBacklog[]>([]);
  const [err, setErr] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        setLoading(true);
        const paths = await listBacklogJsonPaths();
        const backlogs = await Promise.all(paths.map((p) => ghFetchJson<IrbBacklog>(p)));
        if (!cancelled) setItems(backlogs.reverse());
      } catch (e: any) {
        if (!cancelled) setErr(String(e?.message || e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>Improvement Backlog (public read)</h2>
      <p style={{ opacity: 0.7, marginTop: -8 }}>Latest hourly backlog artifacts rendered from MeshCORE.</p>

      {loading && <p>Loading…</p>}
      {err && <pre style={{ color: 'crimson', whiteSpace: 'pre-wrap' }}>{err}</pre>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((b, idx) => (
          <div
            key={idx}
            style={{ border: '1px solid #333', borderRadius: 10, padding: 12, background: '#0b0b0b' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <strong>{b.run?.timestamp_utc || '(no timestamp)'}</strong>
              <span style={{ opacity: 0.7 }}>{b.proposals?.length || 0} proposal(s)</span>
            </div>

            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(b.proposals || []).map((p) => (
                <div key={p.id} style={{ border: '1px solid #444', borderRadius: 8, padding: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                    <code>{p.id}</code>
                    <span style={{ fontSize: 12, opacity: 0.85 }}>
                      {p.risk} • {p.surface}
                    </span>
                  </div>
                  <div style={{ marginTop: 6 }}>{p.title}</div>
                  <div style={{ marginTop: 6, opacity: 0.75, fontSize: 13 }}>
                    {(p.holon || '').trim()} • next: {p.next_action}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
