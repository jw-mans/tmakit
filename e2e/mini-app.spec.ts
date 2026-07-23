import { test, expect } from '@playwright/test';
import { createTmaPageDriver } from '@tmakit/testing';

/**
 * End-to-end against the playground in a real browser. 
 * 
 * There is no Telegram client here — the tmakit mock runs inside the page 
 * and `createTmaPageDriver` answers postEvents / injects events from the 
 * test, exactly like a real client would.
 *
 * Run: `npm run test:e2e` (first time: `npx playwright install chromium`).
 */
test.describe('tmakit mini app (mock-driven E2E)', () => {
  test('injected viewport event reaches useViewport', async ({ page }) => {
    await page.goto('/');
    const tma = createTmaPageDriver(page);

    await tma.emit('viewport_changed', {
      height: 500,
      width: 360,
      is_expanded: true,
      is_state_stable: true,
    });

    // App prints "useViewport: {width}×{height}".
    await expect(page.getByText('360×500')).toBeVisible();
  });

  test('payment flow: main button → invoice → resolve as paid', async ({ page }) => {
    await page.goto('/');
    const tma = createTmaPageDriver(page);

    // MainButton is a native button (headless in-app) — press it via the bridge.
    // Home screen: pressing it navigates to detail.
    await tma.emit('main_button_pressed');
    await expect(page.getByTestId('screen')).toHaveText('detail');

    // Detail screen: pressing it opens the invoice.
    await tma.emit('main_button_pressed');
    await expect.poll(async () => (await tma.pending()).length).toBeGreaterThan(0);

    const invoice = (await tma.pending())[0]!;
    await tma.resolveRequest(invoice.id, {
      name: 'invoice_closed',
      params: { slug: 'demo-invoice-slug', status: 'paid' },
    });

    await expect(page.getByTestId('payment')).toHaveText('paid');
  });

  test('bridge log records outgoing postEvents', async ({ page }) => {
    await page.goto('/');
    const tma = createTmaPageDriver(page);

    await page.getByRole('button', { name: 'request_theme' }).click();

    await expect
      .poll(async () => (await tma.log()).some((e) => e.name === 'web_app_request_theme' && e.direction === 'out'))
      .toBe(true);
  });
});
