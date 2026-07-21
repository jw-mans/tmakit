import { useEffect, useState, useSyncExternalStore } from 'react';
import { on, postEvent } from '@telegram-apps/bridge';
import type { BridgeLogEntry } from '@tmakit/core';
import { mock } from './tma-mock';

const dirColor: Record<BridgeLogEntry['direction'], string> = { out: '#ff9f6a', in: '#4ea1ff' };
const fmtTime = (ts: number) => new Date(ts).toLocaleTimeString(undefined, { hour12: false });

// Buttons that make the "app" send calls to the client, so the mock has traffic.
const actions: Array<{ label: string; run: () => void }> = [
  { label: 'request_theme', run: () => postEvent('web_app_request_theme') },
  { label: 'request_viewport', run: () => postEvent('web_app_request_viewport') },
  { label: 'request_safe_area', run: () => postEvent('web_app_request_safe_area') },
  {
    label: 'setup_main_button (stateful, no auto-reply)',
    run: () =>
      postEvent('web_app_setup_main_button', {
        is_visible: true,
        is_active: true,
        is_progress_visible: false,
        text: 'CONTINUE',
        color: '#5288c1',
        text_color: '#ffffff',
      }),
  },
];

function App() {
  const entries = useSyncExternalStore(mock.logger.subscribe, mock.logger.entries);
  const [received, setReceived] = useState<{ count: number; last: string | null }>({ count: 0, last: null });
  const [error, setError] = useState<string | null>(null);

  // Prove events actually reach the app's own listeners (not just our log).
  useEffect(() => {
    const names = ['theme_changed', 'viewport_changed', 'safe_area_changed'] as const;
    const offs = names.map((n) =>
      on(n, () => setReceived((r) => ({ count: r.count + 1, last: n }))),
    );
    return () => offs.forEach((off) => off());
  }, []);

  const fire = (run: () => void) => {
    try {
      setError(null);
      run();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 720, margin: '2rem auto', padding: '0 1rem' }}>
      <h1 style={{ marginBottom: 0 }}>tmakit playground</h1>
      <p style={{ color: '#888', marginTop: 4 }}>
        M1 — mock engine + bridge log. Click to send a call; the mock auto-answers request events.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '1rem 0' }}>
        {actions.map((a) => (
          <button
            key={a.label}
            onClick={() => fire(a.run)}
            style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #444', cursor: 'pointer' }}
          >
            {a.label}
          </button>
        ))}
        <button
          onClick={() => mock.logger.clear()}
          style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #444', cursor: 'pointer' }}
        >
          clear log
        </button>
      </div>

      <p style={{ color: '#8fbf8f', fontSize: '0.9em' }}>
        app listeners received <b>{received.count}</b> event(s)
        {received.last ? ` · last: ${received.last}` : ''}
      </p>
      {error && <p style={{ color: '#ec3942', fontSize: '0.9em' }}>error: {error}</p>}

      <div style={{ border: '1px solid #333', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ padding: '0.4rem 0.75rem', background: '#1c1c1c', color: '#aaa', fontSize: '0.8em' }}>
          bridge log · {entries.length} entries · <span style={{ color: dirColor.out }}>→ app→client</span>{' '}
          <span style={{ color: dirColor.in }}>← client→app</span>
        </div>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: 360, overflowY: 'auto' }}>
          {entries.length === 0 && (
            <li style={{ padding: '0.75rem', color: '#666' }}>No traffic yet — click a button above.</li>
          )}
          {[...entries].reverse().map((e) => (
            <li
              key={e.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '90px 20px 1fr',
                gap: 8,
                padding: '0.35rem 0.75rem',
                borderTop: '1px solid #262626',
                fontFamily: 'ui-monospace, monospace',
                fontSize: '0.82em',
              }}
            >
              <span style={{ color: '#666' }}>{fmtTime(e.ts)}</span>
              <span style={{ color: dirColor[e.direction], fontWeight: 700 }}>
                {e.direction === 'out' ? '→' : '←'}
              </span>
              <span>
                <span style={{ color: dirColor[e.direction] }}>{e.name}</span>
                {e.params !== undefined && (
                  <span style={{ color: '#888' }}> {JSON.stringify(e.params)}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

export default App;
