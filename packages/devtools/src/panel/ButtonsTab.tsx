import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { BridgeLogEntry, MockController } from '@tmakit/core';
import { C, PanelButton, sans } from './ui';

/** Latest params posted for a given method name, or undefined. */
function lastParams(entries: readonly BridgeLogEntry[], name: string): Record<string, unknown> | undefined {
  for (let i = entries.length - 1; i >= 0; i--) {
    const e = entries[i];
    if (e && e.direction === 'out' && e.name === name) {
      return (e.params ?? {}) as Record<string, unknown>;
    }
  }
  return undefined;
}

export function ButtonsTab({ controller }: { controller: MockController }) {
  const entries = useSyncExternalStore(controller.logger.subscribe, controller.logger.entries);

  const main = lastParams(entries, 'web_app_setup_main_button');
  const secondary = lastParams(entries, 'web_app_setup_secondary_button');
  const back = lastParams(entries, 'web_app_setup_back_button');
  const settings = lastParams(entries, 'web_app_setup_settings_button');

  return (
    <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 12, font: `12px ${sans}`, color: C.text }}>
      <Haptic entries={entries} />

      <Row label="MainButton" state={buttonState(main)} onPress={() => controller.emit('main_button_pressed')} />
      <Row
        label="SecondaryButton"
        state={buttonState(secondary)}
        onPress={() => controller.emit('secondary_button_pressed')}
      />
      <Row
        label="BackButton"
        state={main === undefined && back === undefined ? 'no setup yet' : back?.is_visible ? 'visible' : 'hidden'}
        onPress={() => controller.emit('back_button_pressed')}
      />
      <Row
        label="SettingsButton"
        state={settings?.is_visible ? 'visible' : settings === undefined ? 'no setup yet' : 'hidden'}
        onPress={() => controller.emit('settings_button_pressed')}
      />
    </div>
  );
}

function buttonState(params: Record<string, unknown> | undefined): string {
  if (!params) return 'no setup yet';
  if (!params.is_visible) return 'hidden';
  const text = typeof params.text === 'string' ? params.text : '';
  const active = params.is_active === false ? ' · inactive' : '';
  return `visible: "${text}"${active}`;
}

function Row(props: { label: string; state: string; onPress: () => void }) {
  const visible = props.state.startsWith('visible');
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 9, height: 9, borderRadius: 5, background: visible ? C.ok : C.border, flex: '0 0 auto' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12 }}>{props.label}</div>
        <div style={{ fontSize: 10, color: C.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {props.state}
        </div>
      </div>
      <PanelButton onClick={props.onPress}>press</PanelButton>
    </div>
  );
}

function Haptic({ entries }: { entries: readonly BridgeLogEntry[] }) {
  const last = lastParams(entries, 'web_app_trigger_haptic_feedback');
  const lastId = useRef<number>(-1);
  const [flash, setFlash] = useState(false);

  // Flash when a new haptic call arrives.
  const currentId = (() => {
    for (let i = entries.length - 1; i >= 0; i--) {
      const e = entries[i];
      if (e && e.name === 'web_app_trigger_haptic_feedback') return e.id;
    }
    return -1;
  })();

  useEffect(() => {
    if (currentId !== -1 && currentId !== lastId.current) {
      lastId.current = currentId;
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 250);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [currentId]);

  const type = last ? String(last.type ?? '') : '';
  const detail = last ? String(last.impact_style ?? last.notification_type ?? '') : '';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 10px',
        borderRadius: 8,
        border: `1px solid ${flash ? C.accent : C.border}`,
        background: flash ? 'rgba(78,161,255,0.15)' : C.bgRaised,
        transition: 'background 150ms, border-color 150ms',
      }}
    >
      <span style={{ fontSize: 16 }}>{flash ? '💥' : '·'}</span>
      <span style={{ fontSize: 11, color: C.textDim }}>
        haptic: {type ? `${type}${detail ? ` / ${detail}` : ''}` : 'none yet'}
      </span>
    </div>
  );
}
