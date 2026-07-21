import { useState } from 'react';
import { METHOD_MIN_VERSION, isMethodSupported } from '@tmakit/core';
import { loadLaunchParamsOverride, saveLaunchParamsOverride } from '../override';
import { C, PanelButton, sans } from './ui';

const PLATFORMS = ['ios', 'android', 'tdesktop', 'macos', 'web', 'weba', 'webk'] as const;
const VERSIONS = ['6.0', '6.2', '6.4', '6.9', '7.2', '7.7', '8.0'] as const;

// Sorted for a readable degradation table.
const GATED = Object.entries(METHOD_MIN_VERSION).sort((a, b) => a[1].localeCompare(b[1]));

export function PlatformTab() {
  const stored = loadLaunchParamsOverride();
  const [platform, setPlatform] = useState<string>(stored?.platform ?? 'tdesktop');
  const [version, setVersion] = useState<string>(stored?.version ?? '8.0');

  const apply = () => {
    saveLaunchParamsOverride({ ...loadLaunchParamsOverride(), platform, version });
    location.reload();
  };

  return (
    <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10, font: `12px ${sans}`, color: C.text }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <Select label="platform" value={platform} options={PLATFORMS} onChange={setPlatform} />
        <Select label="version" value={version} options={VERSIONS} onChange={setVersion} />
      </div>

      <PanelButton tone="accent" onClick={apply} style={{ alignSelf: 'flex-start' }}>
        Apply &amp; reload
      </PanelButton>

      <div style={{ color: C.textDim, fontSize: 11 }}>
        support at v{version} (preview — from core's version map):
      </div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, fontFamily: 'ui-monospace, monospace', fontSize: 11 }}>
        {GATED.map(([method, min]) => {
          const ok = isMethodSupported(method, version);
          return (
            <li
              key={method}
              style={{
                display: 'grid',
                gridTemplateColumns: '16px 1fr auto',
                gap: 6,
                padding: '2px 0',
                color: ok ? C.text : C.textDim,
              }}
            >
              <span style={{ color: ok ? C.ok : C.danger }}>{ok ? '✓' : '✗'}</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {method.replace(/^web_app_/, '')}
              </span>
              <span style={{ color: C.textDim }}>{min}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Select(props: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 11, color: C.textDim, flex: 1 }}>
      {props.label}
      <select
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        style={{
          padding: '5px 8px',
          borderRadius: 6,
          border: `1px solid ${C.border}`,
          background: C.bg,
          color: C.text,
          font: `12px ${sans}`,
        }}
      >
        {props.options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
