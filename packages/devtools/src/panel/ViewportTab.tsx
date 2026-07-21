import { useState } from 'react';
import type { MockController } from '@tmakit/core';
import { C, PanelButton, sans } from './ui';

interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}
const ZERO: Insets = { top: 0, right: 0, bottom: 0, left: 0 };

export function ViewportTab({ controller }: { controller: MockController }) {
  const [height, setHeight] = useState(800);
  const [width, setWidth] = useState(390);
  const [expanded, setExpanded] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [safe, setSafe] = useState<Insets>(ZERO);
  const [content, setContent] = useState<Insets>(ZERO);

  const emitViewport = (next: { height?: number; width?: number; expanded?: boolean }) => {
    controller.emit('viewport_changed', {
      height: next.height ?? height,
      width: next.width ?? width,
      is_expanded: next.expanded ?? expanded,
      is_state_stable: true,
    });
  };

  const toggleFullscreen = (on: boolean) => {
    setFullscreen(on);
    controller.emit('fullscreen_changed', { is_fullscreen: on });
  };

  return (
    <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 12, font: `12px ${sans}`, color: C.text }}>
      <Slider
        label="height"
        min={200}
        max={1000}
        value={height}
        onChange={(v) => {
          setHeight(v);
          emitViewport({ height: v });
        }}
      />
      <Slider
        label="width"
        min={250}
        max={600}
        value={width}
        onChange={(v) => {
          setWidth(v);
          emitViewport({ width: v });
        }}
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <PanelButton
          active={expanded}
          onClick={() => {
            const next = !expanded;
            setExpanded(next);
            emitViewport({ expanded: next });
          }}
        >
          expanded
        </PanelButton>
        <PanelButton active={fullscreen} onClick={() => toggleFullscreen(!fullscreen)}>
          fullscreen
        </PanelButton>
      </div>

      <InsetGrid
        title="safe_area_changed"
        insets={safe}
        onChange={(next) => {
          setSafe(next);
          controller.emit('safe_area_changed', next);
        }}
      />
      <InsetGrid
        title="content_safe_area_changed"
        insets={content}
        onChange={(next) => {
          setContent(next);
          controller.emit('content_safe_area_changed', next);
        }}
      />
    </div>
  );
}

function Slider(props: { label: string; min: number; max: number; value: number; onChange: (v: number) => void }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ color: C.textDim, fontSize: 11 }}>
        {props.label}: <b style={{ color: C.text }}>{props.value}px</b>
      </span>
      <input
        type="range"
        min={props.min}
        max={props.max}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
        style={{ accentColor: C.accent }}
      />
    </label>
  );
}

function InsetGrid(props: { title: string; insets: Insets; onChange: (next: Insets) => void }) {
  const set = (key: keyof Insets, value: number) => props.onChange({ ...props.insets, [key]: value });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ color: C.textDim, fontSize: 11 }}>{props.title}</span>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
        {(['top', 'right', 'bottom', 'left'] as const).map((k) => (
          <label key={k} style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: 10, color: C.textDim }}>
            {k}
            <input
              type="number"
              value={props.insets[k]}
              onChange={(e) => set(k, Number(e.target.value))}
              style={{
                width: '100%',
                padding: '4px 6px',
                borderRadius: 6,
                border: `1px solid ${C.border}`,
                background: C.bg,
                color: C.text,
                font: '12px ui-monospace, monospace',
              }}
            />
          </label>
        ))}
      </div>
    </div>
  );
}
