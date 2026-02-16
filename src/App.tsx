import { useState } from 'react';
import IrbInbox from './pages/IrbInbox';
import Backlog from './pages/Backlog';

type Tab = 'inbox' | 'backlog';

export default function App() {
  const [tab, setTab] = useState<Tab>('inbox');

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

        <div style={{ display: 'flex', gap: 8 }}>
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
        </div>
      </div>

      {tab === 'inbox' ? <IrbInbox /> : <Backlog />}
    </div>
  );
}
