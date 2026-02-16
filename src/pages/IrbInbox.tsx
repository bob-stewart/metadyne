import { useEffect, useMemo, useState } from 'react';
import { ghFetchJson, ghListDir } from '../lib/github';
import type { IrbCase } from '../lib/types';

const CASES_DIR = 'projects/ai-irb/cases';

type Col = 'OPEN' | 'IN_REVIEW' | 'ESCALATED' | 'RESOLVED' | 'OTHER';

function groupByStatus(cases: IrbCase[]): Record<Col, IrbCase[]> {
  const cols: Record<Col, IrbCase[]> = {
    OPEN: [],
    IN_REVIEW: [],
    ESCALATED: [],
    RESOLVED: [],
    OTHER: []
  };

  for (const c of cases) {
    const s = ((c.status || 'OTHER') as string).toUpperCase();
    if (s === 'OPEN') cols.OPEN.push(c);
    else if (s === 'IN_REVIEW') cols.IN_REVIEW.push(c);
    else if (s === 'ESCALATED') cols.ESCALATED.push(c);
    else if (s === 'RESOLVED') cols.RESOLVED.push(c);
    else cols.OTHER.push(c);
  }

  return cols;
}

export default function IrbInbox() {
  const [items, setItems] = useState<IrbCase[]>([]);
  const [err, setErr] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        setLoading(true);
        const entries = await ghListDir(CASES_DIR);
        const jsonFiles = entries
          .filter((e) => e.type === 'file' && e.name.endsWith('.json'))
          .slice(0, 120);

        const cases = await Promise.all(jsonFiles.map((e) => ghFetchJson<IrbCase>(e.path)));
        cases.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

        if (!cancelled) setItems(cases);
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

  const grouped = useMemo(() => groupByStatus(items), [items]);

  return (
    <div style={{ padding: 16 }}>
      <h2>AI-IRB Inbox (public read)</h2>
      <p style={{ opacity: 0.7, marginTop: -8 }}>
        Read-only Kanban over MeshCORE. Gated write (PR-as-transaction) comes next.
      </p>

      {loading && <p>Loading…</p>}
      {err && <pre style={{ color: 'crimson', whiteSpace: 'pre-wrap' }}>{err}</pre>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, alignItems: 'start' }}>
        {(Object.entries(grouped) as Array<[Col, IrbCase[]]>).map(([col, cs]) => (
          <div key={col} style={{ border: '1px solid #333', borderRadius: 10, padding: 10, minHeight: 200 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>{col}</strong>
              <span style={{ opacity: 0.7 }}>{cs.length}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
              {cs.map((c) => (
                <div
                  key={c.id}
                  style={{ border: '1px solid #444', borderRadius: 10, padding: 10, background: '#0c0c0c' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <code>{c.id}</code>
                    <span style={{ fontSize: 12, opacity: 0.75 }}>{c.severity || ''}</span>
                  </div>
                  <div style={{ marginTop: 6, fontSize: 13 }}>{c.summary || ''}</div>
                  <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {(c.affectedSurfaces || []).slice(0, 6).map((s) => (
                      <span
                        key={s}
                        style={{
                          fontSize: 11,
                          border: '1px solid #333',
                          padding: '2px 6px',
                          borderRadius: 999,
                          opacity: 0.85
                        }}
                      >
                        {s}
                      </span>
                    ))}
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
