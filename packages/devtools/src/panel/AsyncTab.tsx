import { useState, useSyncExternalStore } from 'react';
import type { MockController, PendingRequest } from '@tmakit/core';
import { C, PanelButton, sans } from './ui';

export function AsyncTab({ controller }: { controller: MockController }) {
  const pending = useSyncExternalStore(controller.requests.subscribe, controller.requests.pending);

  return (
    <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10, font: `12px ${sans}`, color: C.text }}>
      {pending.length === 0 && (
        <p style={{ color: C.textDim, fontSize: 12, margin: 0 }}>
          No pending requests. Trigger a popup / invoice / QR / clipboard / biometry flow — it shows up here to resolve.
        </p>
      )}
      {pending.map((req) => (
        <Resolver key={req.id} controller={controller} req={req} />
      ))}
    </div>
  );
}

function params(req: PendingRequest): Record<string, unknown> {
  return (req.params ?? {}) as Record<string, unknown>;
}

function Card(props: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 11, color: C.accent, fontFamily: 'ui-monospace, monospace' }}>{props.title}</div>
      {props.children}
    </div>
  );
}

function Resolver({ controller, req }: { controller: MockController; req: PendingRequest }) {
  switch (req.name) {
    case 'web_app_open_popup':
      return <PopupResolver controller={controller} req={req} />;
    case 'web_app_open_invoice':
      return <InvoiceResolver controller={controller} req={req} />;
    case 'web_app_open_scan_qr_popup':
      return <QrResolver controller={controller} req={req} />;
    case 'web_app_read_text_from_clipboard':
      return <ClipboardResolver controller={controller} req={req} />;
    case 'web_app_biometry_request_access':
      return <BiometryAccessResolver controller={controller} req={req} />;
    case 'web_app_biometry_request_auth':
      return <BiometryAuthResolver controller={controller} req={req} />;
    default:
      return (
        <Card title={req.name}>
          <PanelButton onClick={() => controller.requests.dismiss(req.id)}>dismiss</PanelButton>
        </Card>
      );
  }
}

interface PopupButton {
  id?: string;
  type?: string;
  text?: string;
}

function PopupResolver({ controller, req }: { controller: MockController; req: PendingRequest }) {
  const p = params(req);
  const buttons = (Array.isArray(p.buttons) ? p.buttons : []) as PopupButton[];
  return (
    <Card title="open_popup → popup_closed">
      {typeof p.title === 'string' && <strong style={{ fontSize: 13 }}>{p.title}</strong>}
      {typeof p.message === 'string' && <span style={{ fontSize: 12, color: C.textDim }}>{p.message}</span>}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {buttons.length === 0 && <span style={{ color: C.textDim, fontSize: 11 }}>no buttons</span>}
        {buttons.map((b, i) => (
          <PanelButton
            key={b.id ?? i}
            tone={b.type === 'destructive' ? 'danger' : 'accent'}
            onClick={() => controller.requests.resolve(req.id, { name: 'popup_closed', params: { button_id: b.id } })}
          >
            {b.text ?? b.type ?? b.id ?? `btn ${i}`}
          </PanelButton>
        ))}
        <PanelButton onClick={() => controller.requests.resolve(req.id, { name: 'popup_closed', params: {} })}>
          dismiss
        </PanelButton>
      </div>
    </Card>
  );
}

function InvoiceResolver({ controller, req }: { controller: MockController; req: PendingRequest }) {
  const slug = String(params(req).slug ?? '');
  const close = (status: string) =>
    controller.requests.resolve(req.id, { name: 'invoice_closed', params: { slug, status } });
  return (
    <Card title="open_invoice → invoice_closed">
      <span style={{ fontSize: 11, color: C.textDim }}>slug: {slug || '—'}</span>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <PanelButton tone="accent" onClick={() => close('paid')}>paid</PanelButton>
        <PanelButton onClick={() => close('pending')}>pending</PanelButton>
        <PanelButton tone="danger" onClick={() => close('cancelled')}>cancelled</PanelButton>
        <PanelButton tone="danger" onClick={() => close('failed')}>failed</PanelButton>
      </div>
    </Card>
  );
}

function QrResolver({ controller, req }: { controller: MockController; req: PendingRequest }) {
  const [text, setText] = useState('https://example.com');
  return (
    <Card title="open_scan_qr_popup → qr_text_received / scan_qr_popup_closed">
      <TextRow value={text} onChange={setText} placeholder="scanned data" />
      <div style={{ display: 'flex', gap: 6 }}>
        {/* Emitting a match keeps the scanner open, like real Telegram. */}
        <PanelButton tone="accent" onClick={() => controller.emit('qr_text_received', { data: text })}>
          emit match
        </PanelButton>
        <PanelButton onClick={() => controller.requests.resolve(req.id, { name: 'scan_qr_popup_closed' })}>
          close
        </PanelButton>
      </div>
    </Card>
  );
}

function ClipboardResolver({ controller, req }: { controller: MockController; req: PendingRequest }) {
  const [text, setText] = useState('clipboard text');
  const reqId = params(req).req_id;
  const send = (data: string | null) =>
    controller.requests.resolve(req.id, { name: 'clipboard_text_received', params: { req_id: reqId, data } });
  return (
    <Card title="read_text_from_clipboard → clipboard_text_received">
      <TextRow value={text} onChange={setText} placeholder="clipboard contents" />
      <div style={{ display: 'flex', gap: 6 }}>
        <PanelButton tone="accent" onClick={() => send(text)}>return text</PanelButton>
        <PanelButton onClick={() => send(null)}>empty / denied</PanelButton>
      </div>
    </Card>
  );
}

function BiometryAccessResolver({ controller, req }: { controller: MockController; req: PendingRequest }) {
  const grant = (granted: boolean) =>
    controller.requests.resolve(req.id, {
      name: 'biometry_info_received',
      params: {
        available: true,
        access_requested: true,
        access_granted: granted,
        token_saved: false,
        device_id: 'mock-device',
        type: 'finger',
      },
    });
  return (
    <Card title="biometry_request_access → biometry_info_received">
      <div style={{ display: 'flex', gap: 6 }}>
        <PanelButton tone="accent" onClick={() => grant(true)}>granted</PanelButton>
        <PanelButton tone="danger" onClick={() => grant(false)}>denied</PanelButton>
      </div>
    </Card>
  );
}

function BiometryAuthResolver({ controller, req }: { controller: MockController; req: PendingRequest }) {
  const auth = (ok: boolean) =>
    controller.requests.resolve(req.id, {
      name: 'biometry_auth_requested',
      params: ok ? { status: 'authorized', token: 'mock-token' } : { status: 'failed' },
    });
  return (
    <Card title="biometry_request_auth → biometry_auth_requested">
      <div style={{ display: 'flex', gap: 6 }}>
        <PanelButton tone="accent" onClick={() => auth(true)}>authorized</PanelButton>
        <PanelButton tone="danger" onClick={() => auth(false)}>failed</PanelButton>
      </div>
    </Card>
  );
}

function TextRow(props: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
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
        font: '12px ui-monospace, monospace',
      }}
    />
  );
}
