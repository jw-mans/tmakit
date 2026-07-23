import { useEffect, useState, type CSSProperties } from 'react';
import { on, postEvent } from '@telegram-apps/bridge';
import { DevtoolsPanel } from 'tma-devtools';
import {
  BackButton,
  MainButton,
  useSafeArea,
  useStoredState,
  useSupports,
  useViewport,
  usePayment,
} from 'tma-kit';
import { mock } from './tma-mock';

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

// --- shared styles (tokens live in index.css) ---
const mono = 'var(--mono)';
const card: CSSProperties = {
  background: 'var(--panel)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: '16px 18px',
};
const cardHead: CSSProperties = {
  color: 'var(--dim)',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  marginBottom: 12,
};
const dataLine: CSSProperties = { fontFamily: mono, fontSize: 13, lineHeight: 1.9, color: 'var(--text-2)' };
const hint: CSSProperties = { color: 'var(--faint)', fontSize: 11.5, margin: '10px 0 0' };

function App() {
  const [received, setReceived] = useState<{ count: number; last: string | null }>({ count: 0, last: null });
  const [error, setError] = useState<string | null>(null);
  const [lastSent, setLastSent] = useState<string | null>(null);

  // tma-kit runtime hooks — driven live by the panel's Viewport / Platform tabs.
  const viewport = useViewport();
  const { safeArea, contentSafeArea } = useSafeArea();
  const supportsFullscreen = useSupports('web_app_request_fullscreen'); // 8.0+
  const supportsPopup = useSupports('web_app_open_popup'); // 6.2+

  useEffect(() => {
    const names = ['theme_changed', 'viewport_changed', 'safe_area_changed'] as const;
    const offs = names.map((n) => on(n, () => setReceived((r) => ({ count: r.count + 1, last: n }))));
    return () => offs.forEach((off) => off());
  }, []);

  const send = (action: { label: string; run: () => void }) => {
    try {
      setError(null);
      action.run();
      setLastSent(action.label);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div
      style={{
        width: 'min(1080px, 94vw)',
        margin: '0 auto',
        padding: 'clamp(2rem, 7vh, 4.5rem) 0 clamp(3rem, 10vh, 6rem)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'clamp(1.25rem, 3.5vh, 2rem)',
      }}
    >
      <header>
        <h1 style={{ margin: 0, fontSize: 'clamp(1.6rem, 3.4vw, 2.15rem)' }}>tmakit playground</h1>
        <p style={{ margin: '6px 0 0', color: 'var(--dim)', maxWidth: '66ch', lineHeight: 1.55 }}>
          A live demo of tma-kit + tma-devtools — fire bridge calls, drive the viewport, resolve
          async flows. Open the devtools panel with the round{' '}
          <b style={{ color: 'var(--accent)' }}>tk</b> button in the bottom-right corner.
        </p>
      </header>

      {/* controls */}
      <section style={card}>
        <div style={cardHead}>send bridge calls</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {actions.map((a) => (
            <button key={a.label} className="pg-btn" onClick={() => send(a)}>
              {a.label}
            </button>
          ))}
        </div>

        <div style={{ ...cardHead, marginTop: 18 }}>async flows — resolve in the panel's Async tab</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {asyncActions.map((a) => (
            <button key={a.label} className="pg-btn async" onClick={() => send(a)}>
              {a.label}
            </button>
          ))}
        </div>

        {lastSent && (
          <p style={{ margin: '14px 0 0', fontFamily: mono, fontSize: 12.5, color: 'var(--dim)' }}>
            → sent <b style={{ color: 'var(--warn)' }}>web_app_{lastSent}</b>{' '}
            <span style={{ color: 'var(--faint)' }}>· see it in the panel's Log tab</span>
          </p>
        )}
        {error && <p style={{ color: 'var(--danger)', fontSize: 13, margin: '8px 0 0' }}>error: {error}</p>}
      </section>

      {/* live state — a grid that fills the width */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'clamp(1rem, 2.5vh, 1.5rem)',
        }}
      >
        <section style={card}>
          <div style={cardHead}>tma-kit hooks</div>
          <div style={dataLine}>
            <div>
              useViewport: <b style={{ color: 'var(--text)' }}>{viewport.width}×{viewport.height}</b> ·
              expanded={String(viewport.isExpanded)} · stable={String(viewport.isStable)}
            </div>
            <div>
              safeArea: [{safeArea.top}, {safeArea.right}, {safeArea.bottom}, {safeArea.left}] · content: [
              {contentSafeArea.top}, {contentSafeArea.right}, {contentSafeArea.bottom}, {contentSafeArea.left}]
            </div>
            <div>
              useSupports: request_fullscreen=
              <b style={{ color: supportsFullscreen ? 'var(--ok)' : 'var(--warn)' }}>{supportsFullscreen ? '✓' : '✗'}</b>{' '}
              · open_popup=
              <b style={{ color: supportsPopup ? 'var(--ok)' : 'var(--warn)' }}>{supportsPopup ? '✓' : '✗'}</b>
            </div>
          </div>
          <p style={hint}>drive from the Viewport / Platform tabs →</p>
        </section>

        <section style={card}>
          <div style={cardHead}>event listeners</div>
          <div style={{ fontFamily: mono, display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <b style={{ color: 'var(--ok)', fontSize: 30, lineHeight: 1 }}>{received.count}</b>
            <span style={{ color: 'var(--dim)' }}>events received</span>
          </div>
          <p style={hint}>{received.last ? `last: ${received.last}` : 'emit from the panel to see this move'}</p>
        </section>

        <StorageDemo />
        <NavPaymentDemo />
      </div>

      {/* HARD RULE: dev-only mount. */}
      {import.meta.env.DEV && <DevtoolsPanel controller={mock} />}
    </div>
  );
}

// CloudStorage over the bridge → the mock's in-memory simulation.
function StorageDemo() {
  const { value, setValue, loading } = useStoredState<string>('demo:note', { initial: '' });
  const [draft, setDraft] = useState('');

  return (
    <section style={card}>
      <div style={cardHead}>CloudStorage</div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          value={draft}
          placeholder="note to persist"
          onChange={(e) => setDraft(e.target.value)}
          style={{
            flex: 1,
            minWidth: 0,
            padding: '0.45rem 0.65rem',
            borderRadius: 8,
            border: '1px solid var(--border-2)',
            background: 'var(--bg)',
            color: 'var(--text)',
          }}
        />
        <button className="pg-btn async" onClick={() => setValue(draft)}>
          save
        </button>
      </div>
      <p style={{ margin: '10px 0 0', fontFamily: mono, fontSize: 13, color: 'var(--accent)' }}>
        stored: {loading ? '…' : JSON.stringify(value)}
      </p>
      <p style={hint}>persists over the bridge → mock sim; survives reload</p>
    </section>
  );
}

// Declarative native buttons + payment. Press them from the panel's Buttons tab;
// resolve the invoice from the Async tab. BackButton appears only on the detail screen.
function NavPaymentDemo() {
  const [screen, setScreen] = useState<'home' | 'detail'>('home');
  const payment = usePayment();

  return (
    <section style={card}>
      <div style={cardHead}>navigation + payment</div>
      <div style={{ fontFamily: mono, fontSize: 14 }}>
        screen:{' '}
        <b data-testid="screen" style={{ color: 'var(--accent)' }}>
          {screen}
        </b>{' '}
        · payment:{' '}
        <b data-testid="payment" style={{ color: 'var(--ok)' }}>
          {payment.status}
        </b>
        {payment.slug ? ` (${payment.slug})` : ''}
      </div>
      <p style={hint}>native buttons live in the panel's Buttons / Async tabs</p>

      {screen === 'detail' && <BackButton onClick={() => setScreen('home')} />}
      <MainButton
        text={screen === 'home' ? 'Go to detail' : 'Buy 100 ⭐'}
        onClick={() => {
          if (screen === 'home') setScreen('detail');
          else void payment.open('demo-invoice-slug');
        }}
      />
    </section>
  );
}

export default App;
