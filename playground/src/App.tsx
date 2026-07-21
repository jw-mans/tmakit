import { useEffect, useState } from 'react';
import { on, postEvent } from '@telegram-apps/bridge';
import { DevtoolsPanel } from 'tma-devtools';
import { mock } from './tma-mock';

// Buttons that make the "app" send calls to the client, so the panel has traffic.
const actions: Array<{ label: string; run: () => void }> = [
  { label: 'request_theme', run: () => postEvent('web_app_request_theme') },
  { label: 'request_viewport', run: () => postEvent('web_app_request_viewport') },
  { label: 'request_safe_area', run: () => postEvent('web_app_request_safe_area') },
  {
    label: 'setup_main_button',
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
  const [received, setReceived] = useState<{ count: number; last: string | null }>({ count: 0, last: null });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const names = ['theme_changed', 'viewport_changed', 'safe_area_changed'] as const;
    const offs = names.map((n) => on(n, () => setReceived((r) => ({ count: r.count + 1, last: n }))));
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
        M2 — devtools panel (bottom-right). Send calls below; watch the panel's log / switch theme / edit the user.
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
      </div>

      <p style={{ color: '#8fbf8f', fontSize: '0.9em' }}>
        app listeners received <b>{received.count}</b> event(s)
        {received.last ? ` · last: ${received.last}` : ''}
      </p>
      {error && <p style={{ color: '#ec3942', fontSize: '0.9em' }}>error: {error}</p>}

      {/* HARD RULE: dev-only mount. */}
      {import.meta.env.DEV && <DevtoolsPanel controller={mock} />}
    </main>
  );
}

export default App;
