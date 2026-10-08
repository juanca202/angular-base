import { expect, test, type Page } from '@playwright/test';

/** Archivo de prueba determinista de 100 KB. */
const file = {
  name: 'prueba-100KB.bin',
  mimeType: 'application/octet-stream',
  buffer: Buffer.alloc(102_400, 7),
};

/** Registra las peticiones de red (no `data:` ni `blob:`) que salen mientras se ejecuta `action`. */
async function captureRequests(page: Page, action: () => Promise<void>): Promise<string[]> {
  const urls: string[] = [];
  const listener = (request: { url(): string }) => {
    const url = request.url();
    if (!url.startsWith('data:') && !url.startsWith('blob:')) {
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

test.describe('envío sin conexión', () => {
  test('envía un archivo sin conexión y sin realizar ninguna petición de red', async ({
    page,
    context,
  }) => {
    await page.goto('/enviar');
    await expect(page.getByRole('heading', { name: 'Enviar archivo' })).toBeVisible();

    await context.setOffline(true);
    const requests = await captureRequests(page, async () => {
      await page.setInputFiles('input[type="file"]', file);
      await expect(page.getByRole('img', { name: 'Código QR del archivo' })).toBeVisible();
      // Deja correr varios fotogramas de la secuencia antes de contar peticiones.
      await page.waitForTimeout(1_500);
    });

    expect(requests).toEqual([]);
    await expect(page.getByText('prueba-100KB.bin')).toBeVisible();
  });

  test('cancelar el envío sin conexión no genera peticiones', async ({ page, context }) => {
    await page.goto('/enviar');
    await expect(page.getByRole('heading', { name: 'Enviar archivo' })).toBeVisible();
    await context.setOffline(true);

    const requests = await captureRequests(page, async () => {
      await page.setInputFiles('input[type="file"]', file);
      await page.getByRole('button', { name: 'Cancelar' }).click();
      await expect(page.getByRole('img', { name: 'Código QR del archivo' })).toBeHidden();
    });

    expect(requests).toEqual([]);
  });

  // Requiere la compilación de producción servida (el service worker no corre en desarrollo):
  //   npx ng build && npx http-server dist/angular-base/browser -p 4300
  //   PWA_URL=http://localhost:4300 npx playwright test e2e/send-offline.spec.ts
  test('tras la primera carga con red, la app recargada sin conexión sigue enviando', async ({
    page,
    context,
  }) => {
    const base = process.env['PWA_URL'];
    test.skip(
      !base,
      'Define PWA_URL con la compilación de producción servida para probar el service worker',
    );

    await page.goto(`${base}/enviar`);
    await page.evaluate(() => navigator.serviceWorker.ready);
    // La primera recarga pone la página bajo el control del service worker.
    await page.reload();
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);

    await context.setOffline(true);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Enviar archivo' })).toBeVisible();

    await page.setInputFiles('input[type="file"]', file);
    await expect(page.getByRole('img', { name: 'Código QR del archivo' })).toBeVisible();
  });
});
