import { expect, test, type Page } from '@playwright/test';
import {
  feed,
  installFakeCamera,
  sampleBytes,
  storedBytes,
  transfer,
} from './support/receive-helpers';

/** Registra las peticiones de red (no `data:` ni `blob:`) que salen mientras se ejecuta `action`. */
async function captureRequests(page: Page, action: () => Promise<void>): Promise<string[]> {
  const urls: string[] = [];
  const listener = (request: { url(): string }) => {
    const url = request.url();
    // The icon sprites are static assets of the app itself (precached by the service worker in
    // production); they are not requests made by the reception.
    const isIconSprite = new URL(url).pathname.startsWith('/images/');
    if (!url.startsWith('data:') && !url.startsWith('blob:') && !isIconSprite) {
      urls.push(url);
    }
  };
  page.on('request', listener);
  try {
    await action();
  } finally {
    page.off('request', listener);
  }
  return urls;
}

test.describe('recepción sin conexión', () => {
  test('recibe un archivo sin conexión y sin realizar ninguna petición de red', async ({
    page,
    context,
  }) => {
    const bytes = sampleBytes(102_400);
    const fragments = await transfer('prueba-100KB.bin', 'application/octet-stream', bytes);
    await installFakeCamera(page);
    // The reader module (ZXing) is loaded when the reception starts; in production the service worker
    // serves it from the cache, here it must be in memory before the connection is cut.
    const readerModule = page.waitForResponse((response) =>
      response.url().endsWith('/zxing/zxing_reader.wasm'),
    );
    await page.goto('/recibir');
    await expect(page.getByRole('button', { name: 'Terminar lectura' })).toBeEnabled();
    await readerModule;

    await context.setOffline(true);
    const requests = await captureRequests(page, async () => {
      await feed(page, fragments);
      await expect(page.getByRole('heading', { name: 'Resultado de la recepción' })).toBeVisible({
        timeout: 60_000,
      });
    });

    expect(requests).toEqual([]);
    expect(await storedBytes(page, 'prueba-100KB.bin')).toEqual(Array.from(bytes));
  });
});
