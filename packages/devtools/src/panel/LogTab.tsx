import { useMemo, useState, useSyncExternalStore } from 'react';
import type { BridgeLogEntry, MockController } from '@tmakit/core';
import { C, mono, PanelButton } from './ui';

type Filter = 'all' | 'out' | 'in';

export function LogTab({ controller }: { controller: MockController }) {
  const entries = useSyncExternalStore(controller.logger.subscribe, controller.logger.entries);
  const [filter, setFilter] = useState<Filter>('all');

  const shown = useMemo(
    () => (filter === 'all' ? entries : entries.filter((e) => e.direction === filter)),
    [entries, filter],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', gap: 6, padding: '8px 10px', alignItems: 'center' }}>
        {(['all', 'out', 'in'] as const).map((f) => (
          <PanelButton key={f} active={filter === f} onClick={() => setFilter(f)}>
            {f === 'out' ? '→ out' : f === 'in' ? '← in' : 'all'}
          </PanelButton>
        ))}
        <span style={{ color: C.textDim, font: `11px ${mono}`, marginLeft: 'auto' }}>{shown.length}</span>
        <PanelButton tone="danger" onClick={() => controller.logger.clear()}>
          clear
        </PanelButton>
      </div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, overflowY: 'auto', flex: 1 }}>
        {shown.length === 0 && (
          <li style={{ padding: 12, color: C.textDim, font: `12px ${mono}` }}>No traffic.</li>
        )}
        {[...shown].reverse().map((e) => (
          <LogRow key={e.id} entry={e} />
        ))}
      </ul>
    </div>
  );
}

function LogRow({ entry }: { entry: BridgeLogEntry }) {
  const color = entry.direction === 'out' ? C.out : C.in;
  const time = new Date(entry.ts).toLocaleTimeString(undefined, { hour12: false });
  return (
    <li
      style={{
        display: 'grid',
        gridTemplateColumns: '68px 14px 1fr',
        gap: 6,
        padding: '4px 10px',
        borderTop: `1px solid ${C.border}`,
        font: `11px ${mono}`,
      }}
    >
      <span style={{ color: C.textDim }}>{time}</span>
      <span style={{ color, fontWeight: 700 }}>{entry.direction === 'out' ? '→' : '←'}</span>
      <span style={{ overflowWrap: 'anywhere' }}>
        <span style={{ color }}>{entry.name}</span>
        {entry.params !== undefined && (
          <span style={{ color: C.textDim }}> {JSON.stringify(entry.params)}</span>
        )}
      </span>
    </li>
  );
}
