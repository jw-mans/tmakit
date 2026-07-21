import { useState } from 'react';
import type { MockController } from '@tmakit/core';
import { THEME_PARAMS, type ThemeMode } from '../theme';
import { saveLaunchParamsOverride, loadLaunchParamsOverride } from '../override';
import { C, PanelButton, sans } from './ui';

export function ThemeTab({ controller }: { controller: MockController }) {
  const [mode, setMode] = useState<ThemeMode>('dark');

  const apply = (next: ThemeMode) => {
    setMode(next);
    const themeParams = { ...THEME_PARAMS[next] };
    // Live: the app reacts immediately via its theme_changed listener.
    controller.emit('theme_changed', { theme_params: themeParams });
    // Persist so a reload keeps the choice.
    saveLaunchParamsOverride({ ...loadLaunchParamsOverride(), themeParams });
  };

  return (
    <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10, font: `12px ${sans}`, color: C.text }}>
      <div style={{ display: 'flex', gap: 8 }}>
        {(['light', 'dark'] as const).map((m) => (
          <PanelButton key={m} active={mode === m} tone="accent" onClick={() => apply(m)}>
            {m}
          </PanelButton>
        ))}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: 6,
        }}
      >
        {Object.entries(THEME_PARAMS[mode]).map(([key, value]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
            <span style={{ width: 14, height: 14, borderRadius: 3, background: value, border: `1px solid ${C.border}` }} />
            <span style={{ color: C.textDim, overflow: 'hidden', textOverflow: 'ellipsis' }}>{key}</span>
          </div>
        ))}
      </div>
      <p style={{ color: C.textDim, fontSize: 11, margin: 0 }}>
        Emits <code>theme_changed</code> live; also saved for reload.
      </p>
    </div>
  );
}
