import { useState } from 'react';
import type { MockUser } from '@tmakit/core';
import { USER_PRESETS } from '../presets';
import {
  loadLaunchParamsOverride,
  saveLaunchParamsOverride,
  clearLaunchParamsOverride,
} from '../override';
import { C, Field, PanelButton, sans } from './ui';

interface FormState {
  first_name: string;
  last_name: string;
  username: string;
  language_code: string;
  is_premium: boolean;
  startParam: string;
}

function initialForm(): FormState {
  const o = loadLaunchParamsOverride();
  const u = o?.user;
  return {
    first_name: u?.first_name ?? 'Test',
    last_name: u?.last_name ?? 'User',
    username: u?.username ?? 'testuser',
    language_code: u?.language_code ?? 'en',
    is_premium: u?.is_premium ?? false,
    startParam: o?.startParam ?? '',
  };
}

export function UserTab() {
  const [form, setForm] = useState<FormState>(initialForm);
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const usePreset = (preset: (typeof USER_PRESETS)[number]) => {
    setForm({
      first_name: preset.user.first_name,
      last_name: preset.user.last_name ?? '',
      username: preset.user.username ?? '',
      language_code: preset.user.language_code ?? 'en',
      is_premium: preset.user.is_premium ?? false,
      startParam: preset.startParam ?? '',
    });
  };

  const applyAndReload = () => {
    const user: MockUser = {
      id: loadLaunchParamsOverride()?.user?.id ?? 99281932,
      first_name: form.first_name,
      last_name: form.last_name || undefined,
      username: form.username || undefined,
      language_code: form.language_code || undefined,
      is_premium: form.is_premium,
    };
    saveLaunchParamsOverride({
      ...loadLaunchParamsOverride(),
      user,
      startParam: form.startParam || undefined,
    });
    location.reload();
  };

  const reset = () => {
    clearLaunchParamsOverride();
    location.reload();
  };

  return (
    <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10, font: `12px ${sans}`, color: C.text }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {USER_PRESETS.map((p) => (
          <PanelButton key={p.id} onClick={() => usePreset(p)}>
            {p.label}
          </PanelButton>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <Field label="first_name" value={form.first_name} onChange={(v) => set('first_name', v)} />
        <Field label="last_name" value={form.last_name} onChange={(v) => set('last_name', v)} />
        <Field label="username" value={form.username} onChange={(v) => set('username', v)} />
        <Field label="language_code" value={form.language_code} onChange={(v) => set('language_code', v)} />
        <Field label="start_param" value={form.startParam} onChange={(v) => set('startParam', v)} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, alignSelf: 'end', fontSize: 12 }}>
          <input
            type="checkbox"
            checked={form.is_premium}
            onChange={(e) => set('is_premium', e.target.checked)}
          />
          is_premium
        </label>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <PanelButton tone="accent" onClick={applyAndReload}>
          Apply &amp; reload
        </PanelButton>
        <PanelButton tone="danger" onClick={reset}>
          Reset
        </PanelButton>
      </div>
      <p style={{ color: C.textDim, fontSize: 11, margin: 0 }}>
        initData is parsed at init — applying reloads to re-initialize the SDK.
      </p>
    </div>
  );
}
