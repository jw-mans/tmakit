import { useEffect, useState } from 'react';
import { on, postEvent } from '@telegram-apps/bridge';
import { DevtoolsPanel } from 'tma-devtools';
import { useSafeArea, useStoredState, useSupports, useViewport } from 'tma-kit';
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

// Stateful async flows — resolved from the panel's Async tab.
const asyncActions: Array<{ label: string; run: () => void }> = [
  {
    label: 'open_popup',
    run: () =>
      postEvent('web_app_open_popup', {
        title: 'Delete file?',
        message: 'This cannot be undone.',
        buttons: [
          { id: 'del', type: 'destructive', text: 'Delete' },
          { id: 'cancel', type: 'cancel' },
        ],
      }),
  },
  { label: 'open_invoice', run: () => postEvent('web_app_open_invoice', { slug: 'test-slug' }) },
  { label: 'scan_qr', run: () => postEvent('web_app_open_scan_qr_popup', { text: 'Point at a QR' }) },
  { label: 'read_clipboard', run: () => postEvent('web_app_read_text_from_clipboard', { req_id: 'clip-1' }) },
  { label: 'biometry_access', run: () => postEvent('web_app_biometry_request_access', { reason: 'Sign in' }) },
  { label: 'biometry_auth', run: () => postEvent('web_app_biometry_request_auth', { reason: 'Confirm' }) },
];

function App() {
  const [received, setReceived] = useState<{ count: number; last: string | null }>({ count: 0, last: null });
  const [error, setError] = useState<string | null>(null);

  // tma-kit runtime hooks — driven live by the panel's Viewport tab.
  const viewport = useViewport();
  const { safeArea, contentSafeArea } = useSafeArea();

  // Feature-gating — flips when you change the version in the panel's Platform tab.
  const supportsFullscreen = useSupports('web_app_request_fullscreen'); // 8.0+
  const supportsPopup = useSupports('web_app_open_popup'); // 6.2+

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

      <div style={{ color: '#888', fontSize: '0.8em' }}>async flows → resolve in the panel's Async tab:</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '0.4rem 0 1rem' }}>
        {asyncActions.map((a) => (
          <button
            key={a.label}
            onClick={() => fire(a.run)}
            style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #3a5', cursor: 'pointer' }}
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

      <section
        style={{
          border: '1px solid #333',
          borderRadius: 8,
          padding: '0.75rem 1rem',
          fontSize: '0.85em',
          fontFamily: 'ui-monospace, monospace',
          lineHeight: 1.7,
        }}
      >
        <div style={{ color: '#888', marginBottom: 4 }}>tma-kit hooks (drive these from the Viewport tab →)</div>
        <div>
          useViewport: {viewport.width}×{viewport.height} · expanded={String(viewport.isExpanded)} · stable=
          {String(viewport.isStable)}
        </div>
        <div>
          safeArea: [{safeArea.top}, {safeArea.right}, {safeArea.bottom}, {safeArea.left}] · content: [
          {contentSafeArea.top}, {contentSafeArea.right}, {contentSafeArea.bottom}, {contentSafeArea.left}]
        </div>
        <div>
          useSupports: request_fullscreen={supportsFullscreen ? '✓' : '✗'} · open_popup=
          {supportsPopup ? '✓' : '✗'} <span style={{ color: '#666' }}>(change version in Platform tab)</span>
        </div>
      </section>

      <StorageDemo />

      {/* HARD RULE: dev-only mount. */}
      {import.meta.env.DEV && <DevtoolsPanel controller={mock} />}
    </main>
  );
}

// tma-kit CloudStorage (via the mock's in-memory simulation over the bridge).
function StorageDemo() {
  const { value, setValue, loading } = useStoredState<string>('demo:note', { initial: '' });
  const [draft, setDraft] = useState('');

  return (
    <section style={{ border: '1px solid #333', borderRadius: 8, padding: '0.75rem 1rem', marginTop: '1rem' }}>
      <div style={{ color: '#888', fontSize: '0.8em', marginBottom: 6 }}>
        tma-kit CloudStorage (persists over the bridge → mock sim; survives reload):
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          value={draft}
          placeholder="note to persist"
          onChange={(e) => setDraft(e.target.value)}
          style={{ padding: '0.4rem 0.6rem', borderRadius: 6, border: '1px solid #444', flex: 1, minWidth: 160 }}
        />
        <button
          onClick={() => setValue(draft)}
          style={{ padding: '0.4rem 0.75rem', borderRadius: 6, border: '1px solid #3a5', cursor: 'pointer' }}
        >
          save
        </button>
        <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.85em', color: '#4ea1ff' }}>
          stored: {loading ? '…' : JSON.stringify(value)}
        </span>
      </div>
    </section>
  );
}

export default App;
