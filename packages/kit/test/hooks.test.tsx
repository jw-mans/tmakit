import { describe, it, expect } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { TmaProvider, useViewport, useSupports, usePayment, useStoredState } from 'tma-kit';
import { createMockBridge, type MockBridgeHandle } from '@tmakit/testing';

function wrapperFor({ bridge }: MockBridgeHandle) {
  return ({ children }: { children: ReactNode }) => <TmaProvider bridge={bridge}>{children}</TmaProvider>;
}

describe('useViewport', () => {
  it('requests on mount and updates from the auto-answered viewport_changed', async () => {
    const handle = createMockBridge();
    const { result } = renderHook(() => useViewport(), { wrapper: wrapperFor(handle) });
    await waitFor(() => expect(result.current.height).toBeGreaterThan(0));
    expect(result.current.isExpanded).toBe(true);
    expect(result.current.isStable).toBe(true);
  });
});

describe('useSupports', () => {
  it('gates a method by the reported version', () => {
    const at70 = createMockBridge({ version: '7.0' });
    const { result: r70 } = renderHook(() => useSupports('web_app_request_fullscreen'), {
      wrapper: wrapperFor(at70),
    });
    expect(r70.current).toBe(false);

    const at80 = createMockBridge({ version: '8.0' });
    const { result: r80 } = renderHook(() => useSupports('web_app_request_fullscreen'), {
      wrapper: wrapperFor(at80),
    });
    expect(r80.current).toBe(true);
  });
});

describe('usePayment', () => {
  it('opens an invoice and resolves by slug', async () => {
    const handle = createMockBridge();
    const { result } = renderHook(() => usePayment(), { wrapper: wrapperFor(handle) });

    let promise!: Promise<string>;
    act(() => {
      promise = result.current.open('slug-1');
    });
    await waitFor(() => expect(handle.mock.requests.pending().length).toBe(1));

    const id = handle.mock.requests.pending()[0]!.id;
    act(() => {
      handle.mock.requests.resolve(id, { name: 'invoice_closed', params: { slug: 'slug-1', status: 'paid' } });
    });

    await expect(promise).resolves.toBe('paid');
    await waitFor(() => expect(result.current.status).toBe('paid'));
  });
});

describe('useStoredState', () => {
  it('persists a value and reads it back (CloudStorage sim)', async () => {
    const handle = createMockBridge();
    const wrapper = wrapperFor(handle);

    const first = renderHook(() => useStoredState<string>('note', { initial: '' }), { wrapper });
    await waitFor(() => expect(first.result.current.loading).toBe(false));
    await act(async () => {
      await first.result.current.setValue('hello');
    });

    // A fresh hook over the same bridge sees the persisted value.
    const second = renderHook(() => useStoredState<string>('note', { initial: '' }), { wrapper });
    await waitFor(() => expect(second.result.current.value).toBe('hello'));
  });
});
