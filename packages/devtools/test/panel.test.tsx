import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { DevtoolsPanel } from 'tma-devtools';
import { createMockBridge } from '@tmakit/testing';

describe('DevtoolsPanel', () => {
  it('shows outgoing bridge traffic and its auto-response in the log', async () => {
    const { bridge, mock } = createMockBridge();
    render(<DevtoolsPanel controller={mock} defaultOpen />);

    act(() => {
      bridge.postEvent!('web_app_request_theme');
    });

    // request logged (out) and its auto-answered theme_changed (in) both show up.
    expect(await screen.findByText('web_app_request_theme')).toBeTruthy();
    expect(await screen.findByText('theme_changed')).toBeTruthy();
  });

  it('surfaces a pending async request with a badge', async () => {
    const { bridge, mock } = createMockBridge();
    render(<DevtoolsPanel controller={mock} defaultOpen />);

    act(() => {
      bridge.postEvent!('web_app_open_invoice', { slug: 'x' });
    });

    expect(mock.requests.pending().length).toBe(1);
    expect(await screen.findByText(/async \(1\)/)).toBeTruthy();
  });
});
