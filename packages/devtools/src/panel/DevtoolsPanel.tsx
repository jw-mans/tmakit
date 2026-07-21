import { useState } from 'react';
import type { MockController } from '@tmakit/core';
import { LogTab } from './LogTab';
import { ThemeTab } from './ThemeTab';
import { UserTab } from './UserTab';
import { C, mono, PanelButton, sans } from './ui';

type Tab = 'log' | 'user' | 'theme';

export interface DevtoolsPanelProps {
  controller: MockController;
  /** Start open. Default false (collapsed to a launcher button). */
  defaultOpen?: boolean;
}

/**
 * Floating dev panel. HARD RULE: mount only behind `import.meta.env.DEV` — this is
 * the consumer's responsibility (keep tma-devtools in devDependencies).
 */
export function DevtoolsPanel({ controller, defaultOpen = false }: DevtoolsPanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [tab, setTab] = useState<Tab>('log');

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        title="Open tmakit devtools"
        style={{
          position: 'fixed',
          right: 16,
          bottom: 16,
          zIndex: 2147483000,
          width: 44,
          height: 44,
          borderRadius: 22,
          border: `1px solid ${C.border}`,
          background: C.bgRaised,
          color: C.accent,
          font: `16px ${mono}`,
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        }}
      >
        tk
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        right: 16,
        bottom: 16,
        zIndex: 2147483000,
        width: 380,
        height: 460,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 12,
        border: `1px solid ${C.border}`,
        background: C.bg,
        color: C.text,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        overflow: 'hidden',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 10px',
          borderBottom: `1px solid ${C.border}`,
          background: C.bgRaised,
        }}
      >
        <strong style={{ font: `12px ${sans}`, color: C.accent }}>tmakit</strong>
        <nav style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
          {(['log', 'user', 'theme'] as const).map((t) => (
            <PanelButton key={t} active={tab === t} onClick={() => setTab(t)}>
              {t}
            </PanelButton>
          ))}
        </nav>
        <PanelButton style={{ marginLeft: 'auto' }} onClick={() => setOpen(false)} title="Collapse">
          ×
        </PanelButton>
      </header>
      <div style={{ flex: 1, minHeight: 0 }}>
        {tab === 'log' && <LogTab controller={controller} />}
        {tab === 'user' && <UserTab />}
        {tab === 'theme' && <ThemeTab controller={controller} />}
      </div>
    </div>
  );
}
