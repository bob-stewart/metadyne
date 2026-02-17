import { useEffect, useState } from 'react';
import IrbInbox from './pages/IrbInbox';
import Backlog from './pages/Backlog';
import { adminLoginUrl, adminMe, type AdminMe } from './lib/admin';

type Tab = 'inbox' | 'backlog';

export default function App() {
  const [tab, setTab] = useState<Tab>('inbox');
  const [adminOpen, setAdminOpen] = useState(false);
  const [me, setMe] = useState<AdminMe | null>(null);

  useEffect(() => {
    if (!adminOpen) return;
    adminMe().then(setMe).catch((e) => setMe({ authed: false, error: String(e?.message || e) }));
  }, [adminOpen]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#060606',
        color: '#f2f2f2',
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial'
      }}
    >
      <div
        style={{
          padding: 16,
          borderBottom: '1px solid #222',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div>
          <div style={{ fontWeight: 800 }}>Metadyne</div>
          <div style={{ opacity: 0.7, fontSize: 12 }}>MeshCORE Control Room (public read / gated write)</div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => setTab('inbox')}
            style={{
              padding: '8px 10px',
              borderRadius: 8,
              border: '1px solid #333',
              background: tab === 'inbox' ? '#1a1a1a' : 'transparent',
              color: 'inherit'
            }}
          >
            IRB Inbox
          </button>
          <button
            onClick={() => setTab('backlog')}
            style={{
              padding: '8px 10px',
              borderRadius: 8,
              border: '1px solid #333',
              background: tab === 'backlog' ? '#1a1a1a' : 'transparent',
              color: 'inherit'
            }}
          >
            Backlog
          </button>
          <div style={{ width: 1, height: 20, background: '#222', margin: '0 6px' }} />
          <button
            onClick={() => setAdminOpen(true)}
            style={{
              padding: '8px 10px',
              borderRadius: 8,
              border: '1px solid #333',
              background: 'transparent',
              color: 'inherit',
              opacity: 0.9
            }}
          >
            Admin
          </button>
        </div>
      </div>

      {tab === 'inbox' ? <IrbInbox /> : <Backlog />}

      {adminOpen && (
        <div
          onClick={() => setAdminOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 16
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(720px, 100%)',
              background: '#0b0b0b',
              border: '1px solid #222',
              borderRadius: 14,
              padding: 16
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Admin (gated write)</strong>
              <button
                onClick={() => setAdminOpen(false)}
                style={{
                  border: '1px solid #333',
                  background: 'transparent',
                  color: 'inherit',
                  borderRadius: 10,
                  padding: '6px 10px'
                }}
              >
                Close
              </button>
            </div>

            <p style={{ opacity: 0.75, marginTop: 8 }}>
              Writes are PR-as-transaction into MeshCORE (no silent mutation). This UI is being wired up now.
            </p>

            <div style={{ border: '1px solid #222', borderRadius: 12, padding: 12, marginTop: 12 }}>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Auth status</div>
              {!me && <div style={{ marginTop: 6 }}>Checking…</div>}
              {me && (
                <div style={{ marginTop: 6 }}>
                  {me.authed ? (
                    <div>
                      Signed in as <code>{me.login}</code>
                    </div>
                  ) : (
                    <div style={{ opacity: 0.9 }}>
                      Not signed in{me.error ? ` (${me.error})` : ''}
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                <a
                  href={adminLoginUrl(window.location.href)}
                  style={{
                    display: 'inline-block',
                    padding: '8px 10px',
                    borderRadius: 10,
                    border: '1px solid #333',
                    color: 'inherit',
                    textDecoration: 'none',
                    background: '#141414'
                  }}
                >
                  Sign in with GitHub
                </a>
                <button
                  onClick={() => adminMe().then(setMe)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 10,
                    border: '1px solid #333',
                    background: 'transparent',
                    color: 'inherit'
                  }}
                >
                  Refresh status
                </button>
              </div>

              <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
                Admin API base: <code>{(import.meta as any).env?.VITE_ADMIN_API_BASE || '(not set)'}</code>
              </div>
            </div>

            <div style={{ marginTop: 12, fontSize: 12, opacity: 0.75 }}>
              Next: click-through detail views + edit priority/status/feedback → “Propose PR”.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
