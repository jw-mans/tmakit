import type { CSSProperties, ReactNode } from 'react';

/** Dark, self-contained palette — no external CSS so the panel drops into any app. */
export const C = {
  bg: '#15171c',
  bgRaised: '#1c1f26',
  border: '#2a2e37',
  text: '#e6e8eb',
  textDim: '#8b919c',
  accent: '#4ea1ff',
  out: '#ff9f6a',
  in: '#4ea1ff',
  danger: '#ec3942',
  ok: '#8fbf8f',
} as const;

export const mono = 'ui-monospace, SFMono-Regular, Menlo, monospace';
export const sans = 'system-ui, -apple-system, sans-serif';

export function PanelButton(props: {
  children: ReactNode;
  onClick?: () => void;
  active?: boolean;
  tone?: 'default' | 'accent' | 'danger';
  title?: string;
  style?: CSSProperties;
}) {
  const tone = props.tone ?? 'default';
  const color = tone === 'danger' ? C.danger : tone === 'accent' ? C.accent : C.text;
  return (
    <button
      onClick={props.onClick}
      title={props.title}
      style={{
        padding: '5px 10px',
        borderRadius: 6,
        border: `1px solid ${props.active ? C.accent : C.border}`,
        background: props.active ? 'rgba(78,161,255,0.12)' : C.bgRaised,
        color,
        font: `12px ${sans}`,
        cursor: 'pointer',
        ...props.style,
      }}
    >
      {props.children}
    </button>
  );
}

export function Field(props: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 3, font: `11px ${sans}`, color: C.textDim }}>
      {props.label}
      <input
        value={props.value}
        placeholder={props.placeholder}
        onChange={(e) => props.onChange(e.target.value)}
        style={{
          padding: '5px 8px',
          borderRadius: 6,
          border: `1px solid ${C.border}`,
          background: C.bg,
          color: C.text,
          font: `12px ${mono}`,
        }}
      />
    </label>
  );
}
